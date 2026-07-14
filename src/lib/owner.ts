export const OWNER_KEY = 'callbreak_owner_id';
export const USER_NAME_KEY = 'callbreak_user_name';
export const OWNER_DISPLAY_NAME_MAP_KEY = 'callbreak_match_owner_display_names';

function readJsonMap<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, T>;
  } catch {
    return {};
  }
}

function writeJsonMap<T>(key: string, value: Record<string, T>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getOwnerId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(OWNER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(OWNER_KEY, id);
  }
  return id;
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_NAME_KEY);
  return raw?.trim() || null;
}

export function setUserName(name: string) {
  if (typeof window === 'undefined') return;
  const trimmed = name.trim();
  if (trimmed) {
    localStorage.setItem(USER_NAME_KEY, trimmed);
  } else {
    localStorage.removeItem(USER_NAME_KEY);
  }
}

export function getMatchOwnerDisplayName(shareCode: string): string | null {
  if (typeof window === 'undefined') return null;
  const normalized = shareCode.trim().toUpperCase();
  const map = readJsonMap<string>(OWNER_DISPLAY_NAME_MAP_KEY);
  return map[normalized] || null;
}

export function setMatchOwnerDisplayName(shareCode: string, name: string) {
  if (typeof window === 'undefined') return;
  const trimmedName = name.trim();
  if (!trimmedName) return;
  const normalized = shareCode.trim().toUpperCase();
  const map = readJsonMap<string>(OWNER_DISPLAY_NAME_MAP_KEY);
  map[normalized] = trimmedName;
  writeJsonMap(OWNER_DISPLAY_NAME_MAP_KEY, map);
}
