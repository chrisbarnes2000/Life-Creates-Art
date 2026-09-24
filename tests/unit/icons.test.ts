import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

test('Theme-adaptive SVG icon exists and contains color scheme media queries', () => {
  const svgPath = path.join(process.cwd(), 'public/icon.svg');
  assert.ok(fs.existsSync(svgPath), 'public/icon.svg must exist');
  
  const content = fs.readFileSync(svgPath, 'utf-8');
  assert.ok(content.includes('<svg'), 'must contain svg root element');
  assert.ok(content.includes('viewBox="0 0 512 512"'), 'must specify 512x512 viewBox');
  assert.ok(content.includes('prefers-color-scheme: dark'), 'must support prefers-color-scheme dark mode');
  assert.ok(content.includes('paintLight'), 'must have light theme gradients');
  assert.ok(content.includes('paintDark'), 'must have dark theme gradients');
});

test('Master raster icons are vibrant and never rendered as black squares', async () => {
  const iconPaths = [
    path.join(process.cwd(), 'public/icon.png'),
    path.join(process.cwd(), 'public/icon-192.png'),
    path.join(process.cwd(), 'public/apple-icon.png'),
  ];

  for (const filePath of iconPaths) {
    const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
    let nonBlackCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      if (r > 20 || g > 20 || b > 20) {
        nonBlackCount++;
      }
    }
    const nonBlackRatio = nonBlackCount / (info.width * info.height);
    // Over 75% of the squircle must contain vibrant non-black pixels (remaining is transparent corner padding)
    assert.ok(
      nonBlackRatio > 0.75,
      `Icon at ${filePath} must be vibrant non-black (actual ratio: ${(nonBlackRatio * 100).toFixed(1)}%)`
    );
  }
});

test('Master raster icons have correct dimensions and formats', async () => {
  const icon512Path = path.join(process.cwd(), 'public/icon.png');
  const icon192Path = path.join(process.cwd(), 'public/icon-192.png');
  const appleIconPath = path.join(process.cwd(), 'public/apple-icon.png');
  const faviconPath = path.join(process.cwd(), 'public/favicon.ico');

  assert.ok(fs.existsSync(icon512Path), 'icon.png must exist');
  assert.ok(fs.existsSync(icon192Path), 'icon-192.png must exist');
  assert.ok(fs.existsSync(appleIconPath), 'apple-icon.png must exist');
  assert.ok(fs.existsSync(faviconPath), 'favicon.ico must exist');

  const meta512 = await sharp(icon512Path).metadata();
  assert.strictEqual(meta512.width, 512);
  assert.strictEqual(meta512.height, 512);
  assert.strictEqual(meta512.format, 'png');

  const meta192 = await sharp(icon192Path).metadata();
  assert.strictEqual(meta192.width, 192);
  assert.strictEqual(meta192.height, 192);
  assert.strictEqual(meta192.format, 'png');

  const metaApple = await sharp(appleIconPath).metadata();
  assert.strictEqual(metaApple.width, 180);
  assert.strictEqual(metaApple.height, 180);
  assert.strictEqual(metaApple.format, 'png');

  const icoStat = fs.statSync(faviconPath);
  assert.ok(icoStat.size > 0, 'favicon.ico must not be empty');
});

test('site.webmanifest references valid png and svg icon entries', () => {
  const manifestPath = path.join(process.cwd(), 'public/site.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'manifest must exist');

  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(raw);
  assert.ok(Array.isArray(manifest.icons), 'icons must be an array');

  const hasSvg = manifest.icons.some(
    (i: { type: string; src: string }) => i.type === 'image/svg+xml' && i.src === '/icon.svg'
  );
  assert.ok(hasSvg, 'manifest must declare /icon.svg');

  const hasPng = manifest.icons.some(
    (i: { type: string; src: string }) => i.type === 'image/png' && i.src === '/icon.png'
  );
  assert.ok(hasPng, 'manifest must declare /icon.png with image/png');

  const hasJpeg = manifest.icons.some((i: { type: string }) => i.type === 'image/jpeg');
  assert.strictEqual(hasJpeg, false, 'manifest icons must not reference invalid image/jpeg');
});

test('OpenGraph social share image has high-resolution 1200x630 dimensions', async () => {
  const ogPath = path.join(process.cwd(), 'public/opengraph-image.png');
  assert.ok(fs.existsSync(ogPath), 'opengraph-image.png must exist');

  const meta = await sharp(ogPath).metadata();
  assert.strictEqual(meta.width, 1200);
  assert.strictEqual(meta.height, 630);
  assert.strictEqual(meta.format, 'png');
});
