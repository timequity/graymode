import { settingsStorage } from '@/utils/storage';
import { DEFAULT_SETTINGS } from '@/utils/presets';

export default defineBackground(() => {
  // Set default settings on install
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      await settingsStorage.setValue(DEFAULT_SETTINGS);
    }
  });
});
