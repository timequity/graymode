import { isDistractingSite, Settings } from '@/utils/presets';
import { settingsStorage } from '@/utils/storage';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',

  main() {
    let currentSettings: Settings | null = null;

    function applyGrayscale(settings: Settings) {
      const hostname = window.location.hostname;
      const isDistracting = isDistractingSite(hostname, settings);

      if (settings.enabled && isDistracting) {
        document.documentElement.style.filter = `grayscale(${settings.intensity}%)`;
      } else {
        document.documentElement.style.filter = '';
      }
    }

    // Check site and apply on load
    browser.runtime.sendMessage({
      type: 'CHECK_SITE',
      hostname: window.location.hostname
    }).then((response) => {
      if (response) {
        currentSettings = response.settings;
        applyGrayscale(response.settings);
      }
    });

    // Watch for settings changes
    settingsStorage.watch((newSettings) => {
      if (newSettings) {
        currentSettings = newSettings;
        applyGrayscale(newSettings);
      }
    });
  },
});
