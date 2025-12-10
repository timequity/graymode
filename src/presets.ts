// Preset categories for distracting sites
export const PRESETS = {
  social: {
    name: 'Social Media',
    sites: [
      'twitter.com',
      'x.com',
      'facebook.com',
      'instagram.com',
      'tiktok.com',
      'linkedin.com',
      'threads.net',
    ],
  },
  video: {
    name: 'Video',
    sites: [
      'youtube.com',
      'twitch.tv',
      'netflix.com',
      'vimeo.com',
      'dailymotion.com',
    ],
  },
  news: {
    name: 'News & Forums',
    sites: [
      'reddit.com',
      'news.ycombinator.com',
      'cnn.com',
      'bbc.com',
      'nytimes.com',
    ],
  },
  messengers: {
    name: 'Messengers',
    sites: [
      'web.telegram.org',
      'web.whatsapp.com',
      'discord.com',
      'slack.com',
      'messenger.com',
    ],
  },
};

export type PresetKey = keyof typeof PRESETS;

export interface Settings {
  enabled: boolean;
  intensity: number; // 50-100
  enabledPresets: PresetKey[];
  customBlacklist: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  intensity: 100,
  enabledPresets: [],
  customBlacklist: [],
};

export function isDistractingSite(hostname: string, settings: Settings): boolean {
  // Check custom blacklist
  if (settings.customBlacklist.some(site => hostname.includes(site))) {
    return true;
  }

  // Check enabled presets
  for (const presetKey of settings.enabledPresets) {
    const preset = PRESETS[presetKey];
    if (preset.sites.some(site => hostname.includes(site))) {
      return true;
    }
  }

  return false;
}
