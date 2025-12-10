import { Settings, DEFAULT_SETTINGS } from './presets';

export async function loadSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(['settings']);
  return result.settings ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ settings });
}

export function onSettingsChange(callback: (settings: Settings) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.settings) {
      callback(changes.settings.newValue);
    }
  });
}
