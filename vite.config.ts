import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  build: {
    lib: {
      entry: {
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts'),
        'popup/popup': resolve(__dirname, 'src/popup/popup.ts'),
      },
      formats: ['es'],
      fileName: (format, name) => `${name}.js`,
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
      },
    },
  },
  plugins: [
    {
      name: 'copy-files',
      closeBundle() {
        // Copy manifest
        copyFileSync('manifest.json', 'dist/manifest.json');

        // Copy popup HTML and CSS
        mkdirSync('dist/popup', { recursive: true });
        copyFileSync('src/popup/popup.html', 'dist/popup/popup.html');
        copyFileSync('src/popup/popup.css', 'dist/popup/popup.css');

        // Copy content CSS
        copyFileSync('src/content.css', 'dist/content.css');

        // Copy icons if exist
        if (existsSync('public/icons')) {
          mkdirSync('dist/icons', { recursive: true });
          ['icon-16.png', 'icon-48.png', 'icon-128.png'].forEach(icon => {
            if (existsSync(`public/icons/${icon}`)) {
              copyFileSync(`public/icons/${icon}`, `dist/icons/${icon}`);
            }
          });
        }
      },
    },
  ],
});
