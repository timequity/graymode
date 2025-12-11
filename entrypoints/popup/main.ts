import { Settings, PresetKey, DEFAULT_SETTINGS, isDistractingSite } from '@/utils/presets';
import { loadSettings, saveSettings } from '@/utils/storage';
import { isValidSettings, sanitizeHostname, isBrowserPage } from '@/utils/types';

const MAX_BLACKLIST_FREE = 5;

let settings: Settings = DEFAULT_SETTINGS;
let currentHostname = '';
let currentTabId: number | null = null;

// DOM Elements with null checks
function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element #${id} not found`);
  }
  return el as T;
}

// Lazy-loaded DOM references
let elements: {
  enabledCheckbox: HTMLInputElement;
  intensitySlider: HTMLInputElement;
  intensityValue: HTMLSpanElement;
  blacklistItems: HTMLDivElement;
  blacklistCount: HTMLSpanElement;
  newSiteInput: HTMLInputElement;
  addSiteButton: HTMLButtonElement;
  statusBar: HTMLDivElement;
  statusText: HTMLSpanElement;
  addCurrentButton: HTMLButtonElement;
  currentSiteName: HTMLSpanElement;
  presetCheckboxes: NodeListOf<HTMLInputElement>;
} | null = null;

function getElements() {
  if (!elements) {
    elements = {
      enabledCheckbox: getElement<HTMLInputElement>('enabled'),
      intensitySlider: getElement<HTMLInputElement>('intensity'),
      intensityValue: getElement<HTMLSpanElement>('intensity-value'),
      blacklistItems: getElement<HTMLDivElement>('blacklist-items'),
      blacklistCount: getElement<HTMLSpanElement>('blacklist-count'),
      newSiteInput: getElement<HTMLInputElement>('new-site'),
      addSiteButton: getElement<HTMLButtonElement>('add-site'),
      statusBar: getElement<HTMLDivElement>('status-bar'),
      statusText: getElement<HTMLSpanElement>('status-text'),
      addCurrentButton: getElement<HTMLButtonElement>('add-current'),
      currentSiteName: getElement<HTMLSpanElement>('current-site-name'),
      presetCheckboxes: document.querySelectorAll<HTMLInputElement>('[data-preset]'),
    };
  }
  return elements;
}

async function init() {
  try {
    const loaded = await loadSettings();
    settings = isValidSettings(loaded) ? loaded : DEFAULT_SETTINGS;
    await getCurrentTab();
    render();
    setupListeners();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
}

async function getCurrentTab() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && tab.id && !isBrowserPage(tab.url)) {
      const url = new URL(tab.url);
      currentHostname = url.hostname.replace(/^www\./, '');
      currentTabId = tab.id;
    }
  } catch {
    currentHostname = '';
    currentTabId = null;
  }
}

async function notifyCurrentTab() {
  if (currentTabId === null) return;

  try {
    await browser.tabs.sendMessage(currentTabId, {
      type: 'APPLY_SETTINGS',
      settings,
    });
  } catch {
    // Content script may not be loaded on this tab
  }
}

function updateStatus() {
  const { statusText, statusBar, addCurrentButton, currentSiteName } = getElements();

  if (!currentHostname) {
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

    const canAdd =
      !settings.customBlacklist.includes(currentHostname) &&
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
  const { enabledCheckbox, intensitySlider, intensityValue, presetCheckboxes } = getElements();

  enabledCheckbox.checked = settings.enabled;
  intensitySlider.value = String(settings.intensity);
  intensityValue.textContent = String(settings.intensity);

  presetCheckboxes.forEach((checkbox) => {
    const preset = checkbox.dataset.preset as PresetKey;
    if (preset in DEFAULT_SETTINGS) {
      checkbox.checked = settings.enabledPresets.includes(preset);
    }
  });

  renderBlacklist();
  updateStatus();
}

function renderBlacklist() {
  const { blacklistItems, blacklistCount, addSiteButton } = getElements();

  blacklistItems.innerHTML = '';

  settings.customBlacklist.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'blacklist-item';

    const span = document.createElement('span');
    span.textContent = site; // Safe: textContent escapes HTML

    const button = document.createElement('button');
    button.textContent = '\u00D7'; // &times;
    button.dataset.index = String(index);

    item.appendChild(span);
    item.appendChild(button);
    blacklistItems.appendChild(item);
  });

  blacklistCount.textContent = `(${settings.customBlacklist.length}/${MAX_BLACKLIST_FREE})`;
  addSiteButton.disabled = settings.customBlacklist.length >= MAX_BLACKLIST_FREE;
}

async function addSite(hostname: string) {
  const sanitized = sanitizeHostname(hostname);
  if (!sanitized) return false;

  if (settings.customBlacklist.length >= MAX_BLACKLIST_FREE) return false;
  if (settings.customBlacklist.includes(sanitized)) return false;

  settings.customBlacklist.push(sanitized);
  await saveSettings(settings);
  renderBlacklist();
  updateStatus();
  notifyCurrentTab();
  return true;
}

async function removeSite(index: number) {
  if (index < 0 || index >= settings.customBlacklist.length) return;

  settings.customBlacklist.splice(index, 1);
  await saveSettings(settings);
  renderBlacklist();
  updateStatus();
  notifyCurrentTab();
}

function setupListeners() {
  const {
    enabledCheckbox,
    intensitySlider,
    intensityValue,
    presetCheckboxes,
    addCurrentButton,
    addSiteButton,
    newSiteInput,
    blacklistItems,
  } = getElements();

  // Main toggle
  enabledCheckbox.addEventListener('change', async () => {
    settings.enabled = enabledCheckbox.checked;
    await saveSettings(settings);
    updateStatus();
    notifyCurrentTab();
  });

  // Intensity slider
  intensitySlider.addEventListener('input', () => {
    intensityValue.textContent = intensitySlider.value;
  });

  intensitySlider.addEventListener('change', async () => {
    const value = parseInt(intensitySlider.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      settings.intensity = value;
      await saveSettings(settings);
      notifyCurrentTab();
    }
  });

  // Presets
  presetCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', async () => {
      const preset = checkbox.dataset.preset;
      if (!preset) return;

      const presetKey = preset as PresetKey;
      if (checkbox.checked) {
        if (!settings.enabledPresets.includes(presetKey)) {
          settings.enabledPresets.push(presetKey);
        }
      } else {
        settings.enabledPresets = settings.enabledPresets.filter((p) => p !== presetKey);
      }

      await saveSettings(settings);
      updateStatus();
      notifyCurrentTab();
    });
  });

  // Add current site
  addCurrentButton.addEventListener('click', async () => {
    if (currentHostname) {
      await addSite(currentHostname);
    }
  });

  // Add site manually
  addSiteButton.addEventListener('click', async () => {
    const site = newSiteInput.value;
    if (await addSite(site)) {
      newSiteInput.value = '';
    }
  });

  newSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSiteButton.click();
    }
  });

  // Remove site (event delegation)
  blacklistItems.addEventListener('click', async (e) => {
    const button = (e.target as HTMLElement).closest('button');
    if (button?.dataset.index) {
      const index = parseInt(button.dataset.index, 10);
      if (!isNaN(index)) {
        await removeSite(index);
      }
    }
  });
}

init();
