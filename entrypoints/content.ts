import { isDistractingSite, Settings, DEFAULT_SETTINGS } from '@/utils/presets';
import { isValidSettings, ExtensionMessage } from '@/utils/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',

  main() {
    const hostname = window.location.hostname;

    function applyGrayscale(settings: Settings) {
      const isDistracting = isDistractingSite(hostname, settings);

      if (settings.enabled && isDistracting) {
        document.documentElement.style.filter = `grayscale(${settings.intensity}%)`;
      } else {
        document.documentElement.style.filter = '';
      }
    }

    // Load settings and apply on start
    browser.storage.sync.get(['settings']).then((result) => {
      const settings = isValidSettings(result.settings) ? result.settings : DEFAULT_SETTINGS;
      applyGrayscale(settings);
    });

    // Listen for settings changes from storage
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.settings?.newValue) {
        const settings = isValidSettings(changes.settings.newValue)
          ? changes.settings.newValue
          : DEFAULT_SETTINGS;
        applyGrayscale(settings);
      }
    });

    // Listen for direct messages from popup (instant apply)
    browser.runtime.onMessage.addListener((message: ExtensionMessage) => {
      if (message.type === 'APPLY_SETTINGS' && isValidSettings(message.settings)) {
        applyGrayscale(message.settings);
      }
    });
  },
});
