import { loadSettings, saveSettings } from './storage';
import { DEFAULT_SETTINGS, isDistractingSite } from './presets';

// Set default settings on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await saveSettings(DEFAULT_SETTINGS);
  }
});

// Listen for messages from popup/content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    loadSettings().then(sendResponse);
    return true;
  }

  if (message.type === 'CHECK_SITE') {
    loadSettings().then((settings) => {
      const isDistracting = isDistractingSite(message.hostname, settings);
      sendResponse({ isDistracting, settings });
    });
    return true;
  }
});
