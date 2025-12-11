import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'GrayMode',
    version: '1.0.0',
    description: 'Focus better by turning distracting sites grayscale',
    permissions: ['storage', 'activeTab', 'tabs'],
    host_permissions: ['<all_urls>'],
    icons: {
      16: 'icons/icon-16.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    action: {
      default_icon: {
        16: 'icons/icon-16.png',
        48: 'icons/icon-48.png',
      },
    },
  },
});
