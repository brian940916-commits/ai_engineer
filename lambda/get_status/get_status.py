"""GET /status — profile + today's intake + plant state + recent history."""

import json
import logging
import os
import re

import boto3
from boto3.dynamodb.conditions import Key

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

    qs = event.get("queryStringParameters") or {}
    date = qs.get("date")
    if not date or not DATE_RE.match(date):
        return _resp(400, {"error": "Missing or invalid date"})

    try:
        days = int(qs.get("days", "7"))
    except (ValueError, TypeError):
        days = 7
    days = max(1, min(31, days))

    try:
        prof = _table.get_item(
            Key={"userId": user_id, "itemType": "PROFILE"}
        ).get("Item")
        goal_ml = int(prof["goalMl"]) if prof and prof.get("goalMl") is not None else DEFAULT_GOAL_ML
        nickname = prof.get("nickname") if prof else None

        resp = _table.query(
            KeyConditionExpression=Key("userId").eq(user_id) & Key("itemType").begins_with("DAY#"),
            ScanIndexForward=False,  # newest first; DAY#<date> sorts chronologically
            Limit=days,
        )
        day_items = resp.get("Items", [])
    except Exception:
        logger.exception("DynamoDB read failed for user=%s", user_id)
        return _resp(500, {"error": "Internal server error"})

    today_item = next((d for d in day_items if d.get("date") == date), None)
    if today_item:
        total_ml = int(today_item.get("totalMl", 0))
        drink_count = int(today_item.get("drinkCount", 0))
        last_drink_at = today_item.get("lastDrinkAt")
    else:
        total_ml, drink_count, last_drink_at = 0, 0, None

    history = []
    for d in day_items:
        d_total = int(d.get("totalMl", 0))
        history.append({
            "date": d.get("date"),
            "totalMl": d_total,
            "goalMl": goal_ml,
            "progress": round(d_total / goal_ml, 2) if goal_ml > 0 else 0.0,
        })

    return _resp(200, {
        "profile": {"nickname": nickname, "goalMl": goal_ml},
        "today": {
            "date": date,
            "totalMl": total_ml,
            "drinkCount": drink_count,
            "lastDrinkAt": last_drink_at,
        },
        "plant": plant.compute(total_ml, goal_ml, last_drink_at),
        "history": history,
    })
