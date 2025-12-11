import type { Settings } from './presets';

// Message types for extension communication
export type ExtensionMessage =
  | { type: 'APPLY_SETTINGS'; settings: Settings }
  | { type: 'GET_SETTINGS' }
  | { type: 'CHECK_SITE'; hostname: string };

export interface CheckSiteResponse {
  isDistracting: boolean;
  settings: Settings;
}

// Type guard for settings validation
export function isValidSettings(value: unknown): value is Settings {
  if (!value || typeof value !== 'object') return false;

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.enabled === 'boolean' &&
    typeof obj.intensity === 'number' &&
    obj.intensity >= 0 &&
    obj.intensity <= 100 &&
    Array.isArray(obj.enabledPresets) &&
    Array.isArray(obj.customBlacklist) &&
    obj.customBlacklist.every((site) => typeof site === 'string')
  );
}

// Validate and sanitize hostname input
export function isValidHostname(input: string): boolean {
  if (!input || input.length > 253) return false;

  // Basic hostname pattern: alphanumeric, hyphens, dots
  const hostnamePattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  return hostnamePattern.test(input);
}

// Sanitize hostname from user input
export function sanitizeHostname(input: string): string | null {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/.*$/, '') // Remove path
    .replace(/:\d+$/, ''); // Remove port

  return isValidHostname(cleaned) ? cleaned : null;
}

// Check if hostname matches a site pattern (exact or subdomain)
export function hostnameMatches(hostname: string, pattern: string): boolean {
  // Normalize both
  const h = hostname.toLowerCase();
  const p = pattern.toLowerCase();

  // Exact match
  if (h === p) return true;

  // Subdomain match: hostname ends with .pattern
  if (h.endsWith(`.${p}`)) return true;

  return false;
}

// Browser internal page detection
const BROWSER_PROTOCOLS = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'brave://',
  'about:',
  'moz-extension://',
  'file://',
  'view-source:',
];

export function isBrowserPage(url: string | undefined): boolean {
  if (!url) return true;
  return BROWSER_PROTOCOLS.some((protocol) => url.startsWith(protocol));
}
