import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'GrayMode',
    version: '1.0.0',
    description: 'Focus better by turning distracting sites grayscale',
    permissions: ['storage', 'activeTab'],
    host_permissions: ['<all_urls>'],
  },
});
