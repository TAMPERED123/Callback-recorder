export const OWNER_KEY = 'callbreak_owner_id';
export function getOwnerId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(OWNER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(OWNER_KEY, id);
  }
  return id;
}
