import { useCallback, useEffect, useState } from 'react';
import { getStatus, localToday, recordWater, updateProfile } from '../lib/api';
import type { RecordResponse, StatusResponse } from '../types';

// Merge the authoritative POST /water response back into the cached status:
// today's totals, the plant state, the profile goal, and today's history entry.
function applyRecord(prev: StatusResponse, res: RecordResponse): StatusResponse {
  const today = localToday();
  const history = [...prev.history];
  const idx = history.findIndex((d) => d.date === res.date);
  const entry = {
    date: res.date,
    totalMl: res.totalMl,
    goalMl: res.goalMl,
    progress: res.goalMl > 0 ? res.totalMl / res.goalMl : 0,
  };
  if (idx >= 0) history[idx] = entry;
  else history.unshift(entry);

  return {
    ...prev,
    profile: { ...prev.profile, goalMl: res.goalMl },
    today: {
      date: res.date === today ? res.date : prev.today.date,
      totalMl: res.totalMl,
      drinkCount: res.drinkCount,
      lastDrinkAt: res.lastDrinkAt,
    },
    plant: res.plant,
    history,
  };
}

export function useStatus() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus(await getStatus(31)); // a month of history (streaks + 7-day chart)
    } catch (e) {
      setError(e instanceof Error ? e.message : '無法連線到伺服器');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Log a drink with an optimistic bump, then reconcile with the server.
  // Returns the authoritative response, or null on failure (with rollback).
  const addWater = useCallback(
    async (amountMl: number): Promise<RecordResponse | null> => {
      const prev = status;
      if (prev) {
        const totalMl = prev.today.totalMl + amountMl;
        const goalMl = prev.profile.goalMl || 1;
        setStatus({
          ...prev,
          today: { ...prev.today, totalMl },
          plant: { ...prev.plant, progress: totalMl / goalMl },
        });
      }
      try {
        const res = await recordWater(amountMl);
        setStatus((s) => (s ? applyRecord(s, res) : s));
        return res;
      } catch {
        if (prev) setStatus(prev); // roll back the optimistic bump
        return null;
      }
    },
    [status]
  );

  // Update goal/nickname. Returns true on success.
  const saveProfile = useCallback(
    async (p: { goalMl?: number; nickname?: string }): Promise<boolean> => {
      try {
        const profile = await updateProfile(p);
        setStatus((s) => (s ? { ...s, profile } : s));
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : '儲存失敗');
        return false;
      }
    },
    []
  );

  return { status, loading, error, reload, addWater, saveProfile };
}
