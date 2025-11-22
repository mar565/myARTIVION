#!/usr/bin/env node

/**
 * MyARTIVION PWA Icon Generator
 * Generates PWA icons from the logo using sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'icons');
const logoPath = path.join(__dirname, 'images', 'myartivion-logo.svg');

async function generateIcons() {
  console.log('🎨 MyARTIVION PWA Icon Generator');
  console.log('================================\n');

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Created icons directory\n');
  }

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo file not found:', logoPath);
    process.exit(1);
  }

  console.log('📄 Loading logo from:', logoPath);
  console.log('🔄 Generating icons...\n');

  try {
    // Generate each size
    for (const size of sizes) {
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);

      // Create a white background and composite the logo on top
      await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([{
        input: await sharp(logoPath)
          .resize({
            width: Math.round(size * 0.9),
            height: Math.round(size * 0.9),
            fit: 'inside'
          })
          .toBuffer(),
        gravity: 'center'
      }])
      .png()
      .toFile(filepath);

      const stats = fs.statSync(filepath);
      console.log(`  ✅ ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log(`📁 Icons saved to: ${iconsDir}\n`);
    console.log('✨ Your PWA is now ready for installation!\n');
    console.log('Next steps:');
    console.log('  1. Start a local web server (e.g., python3 -m http.server)');
    console.log('  2. Open the app in Chrome/Edge');
    console.log('  3. Look for the "Install" button in the address bar\n');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run the generator
generateIcons().catch(console.error);
