import { Settings, PresetKey, DEFAULT_SETTINGS, isDistractingSite } from '@/utils/presets';
import { loadSettings, saveSettings } from '@/utils/storage';

const MAX_BLACKLIST_FREE = 5;

let settings: Settings = DEFAULT_SETTINGS;
let currentHostname: string = '';
let currentTabId: number | null = null;

// DOM elements
const enabledCheckbox = document.getElementById('enabled') as HTMLInputElement;
const intensitySlider = document.getElementById('intensity') as HTMLInputElement;
const intensityValue = document.getElementById('intensity-value') as HTMLSpanElement;
const blacklistItems = document.getElementById('blacklist-items') as HTMLDivElement;
const blacklistCount = document.getElementById('blacklist-count') as HTMLSpanElement;
const newSiteInput = document.getElementById('new-site') as HTMLInputElement;
const addSiteButton = document.getElementById('add-site') as HTMLButtonElement;
const statusBar = document.getElementById('status-bar') as HTMLDivElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const addCurrentButton = document.getElementById('add-current') as HTMLButtonElement;
const currentSiteName = document.getElementById('current-site-name') as HTMLSpanElement;

// Preset checkboxes
const presetCheckboxes = document.querySelectorAll<HTMLInputElement>('[data-preset]');

async function init() {
  settings = await loadSettings();
  await getCurrentTab();
  render();
  setupListeners();
}

async function getCurrentTab() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.id) {
      const url = new URL(tab.url);
      currentHostname = url.hostname.replace(/^www\./, '');
      currentTabId = tab.id;
    }
  } catch (e) {
    currentHostname = '';
    currentTabId = null;
  }
}

// Notify current tab to apply changes immediately
async function notifyCurrentTab() {
  if (currentTabId) {
    try {
      await browser.tabs.sendMessage(currentTabId, {
        type: 'APPLY_SETTINGS',
        settings
      });
    } catch (e) {
      // Tab might not have content script loaded
    }
  }
}

function updateStatus() {
  if (!currentHostname || currentHostname.startsWith('chrome') || currentHostname.startsWith('about')) {
    statusText.textContent = 'Browser page';
    statusBar.classList.remove('active');
    addCurrentButton.style.display = 'none';
    return;
  }

  const isFiltering = settings.enabled && isDistractingSite(currentHostname, settings);

  if (isFiltering) {
    statusText.textContent = `Filtering ${currentHostname}`;
    statusBar.classList.add('active');
    addCurrentButton.style.display = 'none';
  } else {
    statusText.textContent = `Not filtered: ${currentHostname}`;
    statusBar.classList.remove('active');

    // Show "Add current site" button if not already in blacklist and has room
    const canAdd = !settings.customBlacklist.includes(currentHostname) &&
                   settings.customBlacklist.length < MAX_BLACKLIST_FREE;
    if (canAdd) {
      addCurrentButton.style.display = 'flex';
      currentSiteName.textContent = currentHostname;
    } else {
      addCurrentButton.style.display = 'none';
    }
  }
}

function render() {
  // Main toggle
  enabledCheckbox.checked = settings.enabled;

  // Intensity
  intensitySlider.value = String(settings.intensity);
  intensityValue.textContent = String(settings.intensity);

  // Presets
  presetCheckboxes.forEach((checkbox) => {
    const preset = checkbox.dataset.preset as PresetKey;
    checkbox.checked = settings.enabledPresets.includes(preset);
  });

  // Blacklist
  renderBlacklist();

  // Status
  updateStatus();
}

function renderBlacklist() {
  blacklistItems.innerHTML = '';
  settings.customBlacklist.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'blacklist-item';
    item.innerHTML = `
      <span>${site}</span>
      <button data-index="${index}">&times;</button>
    `;
    blacklistItems.appendChild(item);
  });

  blacklistCount.textContent = `(${settings.customBlacklist.length}/${MAX_BLACKLIST_FREE})`;
  addSiteButton.disabled = settings.customBlacklist.length >= MAX_BLACKLIST_FREE;
}

function setupListeners() {
  // Main toggle
  enabledCheckbox.addEventListener('change', async () => {
    settings.enabled = enabledCheckbox.checked;
    await saveSettings(settings);
    updateStatus();
    notifyCurrentTab();
  });

  // Intensity
  intensitySlider.addEventListener('input', () => {
    intensityValue.textContent = intensitySlider.value;
  });

  intensitySlider.addEventListener('change', async () => {
    settings.intensity = Number(intensitySlider.value);
    await saveSettings(settings);
    notifyCurrentTab();
  });

  // Presets
  presetCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      const preset = checkbox.dataset.preset as PresetKey;
      if (checkbox.checked) {
        settings.enabledPresets.push(preset);
      } else {
        settings.enabledPresets = settings.enabledPresets.filter((p) => p !== preset);
      }
      await saveSettings(settings);
      updateStatus();
      notifyCurrentTab();
    });
  });

  // Add current site
  addCurrentButton.addEventListener('click', async () => {
    if (currentHostname && settings.customBlacklist.length < MAX_BLACKLIST_FREE) {
      if (!settings.customBlacklist.includes(currentHostname)) {
        settings.customBlacklist.push(currentHostname);
        await saveSettings(settings);
        renderBlacklist();
        updateStatus();
        notifyCurrentTab();
      }
    }
  });

  // Add site manually
  addSiteButton.addEventListener('click', async () => {
    const site = newSiteInput.value.trim().toLowerCase();
    if (site && settings.customBlacklist.length < MAX_BLACKLIST_FREE) {
      // Remove protocol and www
      const cleanSite = site.replace(/^(https?:\/\/)?(www\.)?/, '');
      if (!settings.customBlacklist.includes(cleanSite)) {
        settings.customBlacklist.push(cleanSite);
        await saveSettings(settings);
        renderBlacklist();
        updateStatus();
        notifyCurrentTab();
        newSiteInput.value = '';
      }
    }
  });

  newSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSiteButton.click();
    }
  });

  // Remove site
  blacklistItems.addEventListener('click', async (e) => {
    const button = (e.target as HTMLElement).closest('button');
    if (button) {
      const index = Number(button.dataset.index);
      settings.customBlacklist.splice(index, 1);
      await saveSettings(settings);
      renderBlacklist();
      updateStatus();
      notifyCurrentTab();
    }
  });
}

init();
