"""DELETE /water — remove one drink entry and recalculate daily totals."""

import json
import logging
import os
import re

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

    date = body.get("date")
    entry_index = body.get("entryIndex")

    if not isinstance(date, str) or not DATE_RE.match(date):
        return _resp(400, {"error": "Invalid date"})
    if not isinstance(entry_index, int) or isinstance(entry_index, bool) or entry_index < 0:
        return _resp(400, {"error": "Invalid entryIndex"})

    # Read the goal so the plant calc reflects the user's real target.
    goal_ml = DEFAULT_GOAL_ML
    try:
        prof = _table.get_item(
            Key={"userId": user_id, "itemType": "PROFILE"}
        ).get("Item")
        if prof and prof.get("goalMl") is not None:
            goal_ml = int(prof["goalMl"])

        day_item = _table.get_item(
            Key={"userId": user_id, "itemType": f"DAY#{date}"}
        ).get("Item")
    except ClientError:
        logger.exception("DynamoDB read failed for user=%s date=%s", user_id, date)
        return _resp(500, {"error": "Internal server error"})

    entries = day_item.get("entries", []) if day_item else []
    if entry_index >= len(entries):
        return _resp(404, {"error": "entryIndex out of range"})

    removed = entries[entry_index]
    removed_ml = int(removed.get("ml", 0))

    try:
        # Remove the entry, then recompute totals from the remaining entries to
        # keep totalMl / drinkCount / lastDrinkAt consistent.
        resp = _table.update_item(
            Key={"userId": user_id, "itemType": f"DAY#{date}"},
            UpdateExpression=f"REMOVE entries[{entry_index}] "
            "ADD totalMl :neg, drinkCount :negone",
            ExpressionAttributeValues={
                ":neg": -removed_ml,
                ":negone": -1,
            },
            ReturnValues="ALL_NEW",
        )
        item = resp["Attributes"]
    except ClientError:
        logger.exception("DynamoDB delete failed for user=%s date=%s", user_id, date)
        return _resp(500, {"error": "Internal server error"})

    remaining = item.get("entries", [])
    if remaining:
        last_drink_at = max(e.get("at", "") for e in remaining) or None
    else:
        last_drink_at = None

    total_ml = int(item.get("totalMl", 0))
    drink_count = int(item.get("drinkCount", 0))

    # Persist the corrected lastDrinkAt (REMOVE alone leaves the stale value).
    try:
        if last_drink_at is None:
            _table.update_item(
                Key={"userId": user_id, "itemType": f"DAY#{date}"},
                UpdateExpression="REMOVE lastDrinkAt",
            )
        else:
            _table.update_item(
                Key={"userId": user_id, "itemType": f"DAY#{date}"},
                UpdateExpression="SET lastDrinkAt = :last",
                ExpressionAttributeValues={":last": last_drink_at},
            )
    except ClientError:
        logger.exception("DynamoDB lastDrinkAt fixup failed for user=%s date=%s", user_id, date)
        return _resp(500, {"error": "Internal server error"})

    return _resp(200, {
        "date": date,
        "totalMl": total_ml,
        "goalMl": goal_ml,
        "drinkCount": drink_count,
        "lastDrinkAt": last_drink_at,
        "plant": plant.compute(total_ml, goal_ml, last_drink_at),
    })
