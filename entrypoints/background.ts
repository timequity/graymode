import { settingsStorage } from '@/utils/storage';
import { DEFAULT_SETTINGS, isDistractingSite } from '@/utils/presets';

export default defineBackground(() => {
  // Set default settings on install
  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      await settingsStorage.setValue(DEFAULT_SETTINGS);
    }
  });

  // Listen for messages from popup/content
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message.type === 'GET_SETTINGS') {
      return settingsStorage.getValue();
    }

    if (message.type === 'CHECK_SITE') {
      return settingsStorage.getValue().then((settings) => {
        const isDistracting = isDistractingSite(message.hostname, settings);
        return { isDistracting, settings };
      });
    }
  });
});
