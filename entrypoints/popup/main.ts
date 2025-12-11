import { Settings, PresetKey, DEFAULT_SETTINGS } from '@/utils/presets';
import { loadSettings, saveSettings } from '@/utils/storage';

const MAX_BLACKLIST_FREE = 5;

let settings: Settings = DEFAULT_SETTINGS;

// DOM elements
const enabledCheckbox = document.getElementById('enabled') as HTMLInputElement;
const intensitySlider = document.getElementById('intensity') as HTMLInputElement;
const intensityValue = document.getElementById('intensity-value') as HTMLSpanElement;
const blacklistItems = document.getElementById('blacklist-items') as HTMLDivElement;
const blacklistCount = document.getElementById('blacklist-count') as HTMLSpanElement;
const newSiteInput = document.getElementById('new-site') as HTMLInputElement;
const addSiteButton = document.getElementById('add-site') as HTMLButtonElement;

// Preset checkboxes
const presetCheckboxes = document.querySelectorAll<HTMLInputElement>('[data-preset]');

async function init() {
  settings = await loadSettings();
  render();
  setupListeners();
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
  });

  // Intensity
  intensitySlider.addEventListener('input', () => {
    intensityValue.textContent = intensitySlider.value;
  });

  intensitySlider.addEventListener('change', async () => {
    settings.intensity = Number(intensitySlider.value);
    await saveSettings(settings);
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
    });
  });

  // Add site
  addSiteButton.addEventListener('click', async () => {
    const site = newSiteInput.value.trim().toLowerCase();
    if (site && settings.customBlacklist.length < MAX_BLACKLIST_FREE) {
      // Remove protocol and www
      const cleanSite = site.replace(/^(https?:\/\/)?(www\.)?/, '');
      if (!settings.customBlacklist.includes(cleanSite)) {
        settings.customBlacklist.push(cleanSite);
        await saveSettings(settings);
        renderBlacklist();
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
    }
  });
}

init();
