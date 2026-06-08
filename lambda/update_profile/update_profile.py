"""PUT /profile — upsert the user's daily goal and/or nickname."""

import json
import logging
import os
import re
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

USER_ID_RE = re.compile(r"^[0-9a-fA-F-]{36}$")
NICK_RE = re.compile(r"^[a-zA-Z0-9_]{0,20}$")
GOAL_MIN = 500
GOAL_MAX = 6000

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


_INVALID = {"error": "Provide goalMl (500-6000) and/or nickname (<=20 chars)"}


def handler(event, context):
    headers = event.get("headers") or {}
    user_id = headers.get("x-user-id")
    if not user_id or not USER_ID_RE.match(user_id):
        return _resp(400, {"error": "Missing or invalid X-User-Id"})

    try:
        body = json.loads(event.get("body") or "{}")
    except (ValueError, TypeError):
        return _resp(400, {"error": "Body must be valid JSON"})

    goal_ml = body.get("goalMl")
    nickname = body.get("nickname")

    if goal_ml is not None:
        if not isinstance(goal_ml, int) or isinstance(goal_ml, bool) or not (GOAL_MIN <= goal_ml <= GOAL_MAX):
            return _resp(400, _INVALID)
    if nickname is not None:
        if not isinstance(nickname, str) or not NICK_RE.match(nickname):
            return _resp(400, _INVALID)
    if goal_ml is None and nickname is None:
        return _resp(400, _INVALID)

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Build a dynamic UpdateExpression that sets only the provided fields.
    sets = ["createdAt = if_not_exists(createdAt, :now)"]
    names = {}
    values = {":now": now_iso}
    if goal_ml is not None:
        sets.append("goalMl = :g")
        values[":g"] = goal_ml
    if nickname is not None:
        sets.append("#n = :nn")
        names["#n"] = "nickname"
        values[":nn"] = nickname

    kwargs = {
        "Key": {"userId": user_id, "itemType": "PROFILE"},
        "UpdateExpression": "SET " + ", ".join(sets),
        "ExpressionAttributeValues": values,
        "ReturnValues": "ALL_NEW",
    }
    if names:
        kwargs["ExpressionAttributeNames"] = names

    try:
        prof = _table.update_item(**kwargs)["Attributes"]
    except ClientError:
        logger.exception("DynamoDB profile update failed for user=%s", user_id)
        return _resp(500, {"error": "Internal server error"})

    return _resp(200, {
        "nickname": prof.get("nickname"),
        "goalMl": int(prof["goalMl"]) if prof.get("goalMl") is not None else None,
    })
