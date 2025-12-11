import { storage } from 'wxt/utils/storage';
import { Settings, DEFAULT_SETTINGS } from './presets';

// Type-safe storage with WXT
export const settingsStorage = storage.defineItem<Settings>('sync:settings', {
  fallback: DEFAULT_SETTINGS,
});

// Helper functions for compatibility
export async function loadSettings(): Promise<Settings> {
  return await settingsStorage.getValue();
}

export async function saveSettings(settings: Settings): Promise<void> {
  await settingsStorage.setValue(settings);
}
