import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const sizes = [16, 48, 128];

async function generateIcons() {
  for (const size of sizes) {
    const svgPath = join(iconsDir, `icon-${size}.svg`);
    const pngPath = join(iconsDir, `icon-${size}.png`);

    const svg = readFileSync(svgPath);

    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    console.log(`✓ Generated icon-${size}.png`);
  }

  console.log('\nAll icons generated!');
}

generateIcons().catch(console.error);
