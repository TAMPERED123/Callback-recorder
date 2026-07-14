import { createHash, randomBytes } from 'crypto';

const SHARE_CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4,20}$/;

export function generateOwnerToken(): string {
  return randomBytes(24).toString('hex');
}

export function hashOwnerToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function normalizeShareCode(value: string): string {
  return value.trim().toUpperCase();
}

export function extractShareCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const explicitCodeMatch = trimmed.match(/\bcode\s*:\s*([A-Z0-9]{1,20})\b/i);
  if (explicitCodeMatch?.[1]) {
    const normalized = normalizeShareCode(explicitCodeMatch[1]);
    return isValidShareCode(normalized) ? normalized : null;
  }

  const urlCodeMatch = trimmed.match(/\/match\/([A-Z0-9]{1,20})(?:\/|$)/i);
  if (urlCodeMatch?.[1]) {
    const normalized = normalizeShareCode(urlCodeMatch[1]);
    return isValidShareCode(normalized) ? normalized : null;
  }

  const normalized = normalizeShareCode(trimmed);
  return isValidShareCode(normalized) ? normalized : null;
}

export function isValidShareCode(value: string): boolean {
  return SHARE_CODE_PATTERN.test(normalizeShareCode(value));
}

export function getOwnerCookieName(shareCode: string): string {
  return `cb_owner_${normalizeShareCode(shareCode)}`;
}

export function buildShareText(matchName: string, shareCode: string, matchUrl: string): string {
  return `View the live Call Break scoreboard for ${matchName}.\nCode: ${shareCode}\n${matchUrl}`;
}
