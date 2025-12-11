import { isDistractingSite, Settings, DEFAULT_SETTINGS } from '@/utils/presets';

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
      const settings = result.settings ?? DEFAULT_SETTINGS;
      applyGrayscale(settings);
    });

    // Listen for settings changes from storage
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.settings?.newValue) {
        applyGrayscale(changes.settings.newValue);
      }
    });

    // Listen for direct messages from popup (instant apply)
    browser.runtime.onMessage.addListener((message) => {
      if (message.type === 'APPLY_SETTINGS' && message.settings) {
        applyGrayscale(message.settings);
      }
    });
  },
});
