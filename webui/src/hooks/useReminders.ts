import { useCallback, useEffect, useRef, useState } from 'react';
import { REMINDER_BODY } from '../lib/copy';

const STORAGE_KEY = 'plantBuddyReminders';
const DEFAULT_HOURS = 2;

type Permission = NotificationPermission | 'unsupported';

function currentPermission(): Permission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

// Frontend-only reminders via the browser Notification API (core scope — no
// Service Worker, no Web Push). Local timers only fire while the tab is alive.
export function useReminders() {
  const [enabled, setEnabledState] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'on'
  );
  const [permission, setPermission] = useState<Permission>(currentPermission);
  const timer = useRef<number | undefined>(undefined);

  const setEnabled = useCallback((on: boolean) => {
    setEnabledState(on);
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  }, []);

  // Turning reminders on requests notification permission once.
  const enable = useCallback(async (): Promise<boolean> => {
    if (permission === 'unsupported') return false;
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
      setPermission(perm);
    }
    const granted = perm === 'granted';
    setEnabled(granted);
    return granted;
  }, [permission, setEnabled]);

  const disable = useCallback(() => {
    setEnabled(false);
    clearTimeout(timer.current);
  }, [setEnabled]);

  // (Re)schedule a local reminder for lastDrinkAt + N hours.
  const schedule = useCallback(
    (lastDrinkAt: string | null, hours = DEFAULT_HOURS) => {
      clearTimeout(timer.current);
      if (!enabled || permission !== 'granted' || !lastDrinkAt) return;
      const fireAt = new Date(lastDrinkAt).getTime() + hours * 3_600_000;
      const delay = Math.max(0, fireAt - Date.now());
      timer.current = window.setTimeout(() => {
        new Notification('Plant Buddy', { body: REMINDER_BODY });
      }, delay);
    },
    [enabled, permission]
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return { enabled, permission, enable, disable, schedule };
}
