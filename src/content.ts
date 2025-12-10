import { isDistractingSite, Settings } from './presets';

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
chrome.runtime.sendMessage({ type: 'CHECK_SITE', hostname: window.location.hostname }, (response) => {
  if (response) {
    currentSettings = response.settings;
    applyGrayscale(response.settings);
  }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.settings) {
    currentSettings = changes.settings.newValue;
    applyGrayscale(changes.settings.newValue);
  }
});
