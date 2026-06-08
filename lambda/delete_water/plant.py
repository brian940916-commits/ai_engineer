"""Plant state machine — the single source of truth.

Implements the table in documents/01-system-architecture.md exactly. This file is
COPIED VERBATIM into both lambda/record_water/ and lambda/get_status/; the two
copies must stay identical (do not let them drift).
"""

from datetime import datetime, timezone


def _parse_iso(ts):
    """Parse an ISO 8601 timestamp (e.g. '2026-06-08T05:32:10Z') to an aware datetime."""
    if not ts:
        return None
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(ts)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def compute(total_ml, goal_ml, last_drink_at, now=None):
    """Return {stage, mood, progress}.

    stage  — from progress = totalMl / goalMl (resets to 'seed' each new day).
    mood   — from hours since last_drink_at ('sleepy' if no drink yet today).
    """
    if now is None:
        now = datetime.now(timezone.utc)

    total_ml = float(total_ml or 0)
    goal_ml = float(goal_ml or 0)
    progress = (total_ml / goal_ml) if goal_ml > 0 else 0.0

    if progress < 0.25:
        stage = "seed"
    elif progress < 0.50:
        stage = "sprout"
    elif progress < 0.75:
        stage = "growing"
    elif progress < 1.00:
        stage = "budding"
    else:
        stage = "blooming"

    last = _parse_iso(last_drink_at)
    if last is None:
        mood = "sleepy"
    else:
        hours_since = (now - last).total_seconds() / 3600.0
        if hours_since < 2:
            mood = "happy"
        elif hours_since < 4:
            mood = "ok"
        elif hours_since < 6:
            mood = "thirsty"
        else:
            mood = "wilting"

    return {"stage": stage, "mood": mood, "progress": round(progress, 2)}
