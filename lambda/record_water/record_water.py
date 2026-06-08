"""POST /water — record one drink and return the updated daily status + plant."""

import json
import logging
import os
import re
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

import plant

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DEFAULT_GOAL_ML = 2000
USER_ID_RE = re.compile(r"^[0-9a-fA-F-]{36}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

_dynamodb = boto3.resource(
    "dynamodb", endpoint_url=os.environ.get("DYNAMODB_ENDPOINT") or None
)
_table = _dynamodb.Table(os.environ["TABLE_NAME"])


def _resp(status, payload):
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json"},
        "body": json.dumps(payload),
    }


def handler(event, context):
    headers = event.get("headers") or {}
    user_id = headers.get("x-user-id")
    if not user_id or not USER_ID_RE.match(user_id):
        return _resp(400, {"error": "Missing or invalid X-User-Id"})

    try:
        body = json.loads(event.get("body") or "{}")
    except (ValueError, TypeError):
        return _resp(400, {"error": "Body must be valid JSON"})

    amount_ml = body.get("amountMl")
    date = body.get("date")

    if not isinstance(amount_ml, int) or isinstance(amount_ml, bool) or not (1 <= amount_ml <= 2000):
        return _resp(400, {"error": "Invalid amountMl"})
    if not isinstance(date, str) or not DATE_RE.match(date):
        return _resp(400, {"error": "Invalid date"})

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    try:
        # Lazily create the PROFILE if missing (idempotent / concurrency-safe).
        goal_ml = DEFAULT_GOAL_ML
        try:
            _table.put_item(
                Item={
                    "userId": user_id,
                    "itemType": "PROFILE",
                    "goalMl": DEFAULT_GOAL_ML,
                    "createdAt": now_iso,
                },
                ConditionExpression="attribute_not_exists(userId)",
            )
        except ClientError as e:
            if e.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
            # Profile already exists — read its real goal for the plant calc.
            prof = _table.get_item(
                Key={"userId": user_id, "itemType": "PROFILE"}
            ).get("Item")
            if prof and prof.get("goalMl") is not None:
                goal_ml = int(prof["goalMl"])

        # Atomic accumulate into today's record.
        resp = _table.update_item(
            Key={"userId": user_id, "itemType": f"DAY#{date}"},
            UpdateExpression=(
                "ADD totalMl :amt, drinkCount :one "
                "SET lastDrinkAt = :now, #d = if_not_exists(#d, :date), "
                "entries = list_append(if_not_exists(entries, :empty), :entry)"
            ),
            ExpressionAttributeNames={"#d": "date"},
            ExpressionAttributeValues={
                ":amt": amount_ml,
                ":one": 1,
                ":now": now_iso,
                ":date": date,
                ":empty": [],
                ":entry": [{"ml": amount_ml, "at": now_iso}],
            },
            ReturnValues="ALL_NEW",
        )
        item = resp["Attributes"]
    except ClientError:
        logger.exception("DynamoDB write failed for user=%s date=%s", user_id, date)
        return _resp(500, {"error": "Internal server error"})

    total_ml = int(item["totalMl"])
    drink_count = int(item["drinkCount"])
    last_drink_at = item.get("lastDrinkAt")

    return _resp(200, {
        "date": date,
        "totalMl": total_ml,
        "goalMl": goal_ml,
        "drinkCount": drink_count,
        "lastDrinkAt": last_drink_at,
        "plant": plant.compute(total_ml, goal_ml, last_drink_at),
    })
