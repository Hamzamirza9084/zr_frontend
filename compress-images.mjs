import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, 'public', 'Images');

async function compressImages() {
  console.log('🔧 Compressing images...\n');

  // 1. Compress royal.png (2.7MB) → WebP (~150KB) + JPEG fallback
  try {
    const royalInput = join(publicDir, 'royal.png');
    
    // WebP version (primary)
    await sharp(royalInput)
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(publicDir, 'royal.webp'));
    console.log('✅ royal.png → royal.webp (compressed)');

    // JPEG fallback
    await sharp(royalInput)
      .resize(800, null, { withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toFile(join(publicDir, 'royal-optimized.jpg'));
    console.log('✅ royal.png → royal-optimized.jpg (fallback)');
  } catch (e) {
    console.error('❌ Error compressing royal.png:', e.message);
  }

  // 2. Compress logo.png (7MB) → WebP (~100KB)
  try {
    const logoInput = join(publicDir, 'logo.png');
    
    await sharp(logoInput)
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(publicDir, 'logo.webp'));
    console.log('✅ logo.png → logo.webp (compressed)');

    await sharp(logoInput)
      .resize(400, null, { withoutEnlargement: true })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(join(publicDir, 'logo-optimized.png'));
    console.log('✅ logo.png → logo-optimized.png (compressed PNG fallback)');
  } catch (e) {
    console.error('❌ Error compressing logo.png:', e.message);
  }

  // 3. Check SVG logo size — if > 100KB, warn user
  try {
    const svgInput = join(publicDir, 'svglogo.svg');
    const svgContent = readFileSync(svgInput, 'utf8');
    const svgSizeKB = (Buffer.byteLength(svgContent, 'utf8') / 1024).toFixed(1);
    console.log(`\nℹ️  svglogo.svg is ${svgSizeKB}KB`);
    if (svgSizeKB > 100) {
      console.log('⚠️  SVG is very large. Consider re-exporting from design tool with optimized settings.');
      // Create a rasterized WebP fallback of the SVG for the favicon/header
      await sharp(join(publicDir, 'svglogo.svg'), { density: 150 })
        .resize(64, 64)
        .webp({ quality: 80 })
        .toFile(join(publicDir, 'svglogo-64.webp'));
      console.log('✅ svglogo.svg → svglogo-64.webp (small raster fallback for header)');
      
      await sharp(join(publicDir, 'svglogo.svg'), { density: 150 })
        .resize(64, 64)
        .png({ compressionLevel: 9 })
        .toFile(join(publicDir, 'favicon.png'));
      console.log('✅ svglogo.svg → favicon.png (favicon)');
    }
  } catch (e) {
    console.error('❌ Error processing svglogo.svg:', e.message);
  }

  console.log('\n🎉 Image compression complete!');
}

compressImages();
