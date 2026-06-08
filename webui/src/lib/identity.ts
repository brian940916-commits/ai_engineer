const STORAGE_KEY = 'plantBuddyUserId';

// Anonymous, persistent identity: one UUID per browser, kept in localStorage and
// sent as the X-User-Id header on every request. Clearing storage = a fresh plant.
export function getUserId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
