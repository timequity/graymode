import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, existsSync, rmSync } from 'fs';

const watch = process.argv.includes('--watch');

// Clean dist
if (existsSync('dist')) {
  rmSync('dist', { recursive: true });
}
mkdirSync('dist/popup', { recursive: true });
mkdirSync('dist/icons', { recursive: true });

// Build config
const buildOptions = {
  bundle: true,
  minify: !watch,
  sourcemap: watch,
  target: 'chrome100',
  format: 'esm',
};

// Build entries
async function build() {
  // Background
  await esbuild.build({
    ...buildOptions,
    entryPoints: ['src/background.ts'],
    outfile: 'dist/background.js',
  });

  // Content script
  await esbuild.build({
    ...buildOptions,
    entryPoints: ['src/content.ts'],
    outfile: 'dist/content.js',
  });

  // Popup
  await esbuild.build({
    ...buildOptions,
    entryPoints: ['src/popup/popup.ts'],
    outfile: 'dist/popup/popup.js',
  });

  // Copy static files
  copyFileSync('manifest.json', 'dist/manifest.json');
  copyFileSync('src/popup/popup.html', 'dist/popup/popup.html');
  copyFileSync('src/popup/popup.css', 'dist/popup/popup.css');
  copyFileSync('src/content.css', 'dist/content.css');

  // Copy icons if exist
  ['icon-16.png', 'icon-48.png', 'icon-128.png'].forEach(icon => {
    if (existsSync(`public/icons/${icon}`)) {
      copyFileSync(`public/icons/${icon}`, `dist/icons/${icon}`);
    }
  });

  console.log('Build complete!');
}

if (watch) {
  // Watch mode
  const ctx = await esbuild.context({
    ...buildOptions,
    entryPoints: [
      'src/background.ts',
      'src/content.ts',
      'src/popup/popup.ts',
    ],
    outdir: 'dist',
  });
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build();
}
