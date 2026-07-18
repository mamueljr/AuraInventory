// Genera los iconos PWA con sharp (ImageMagick aplana los gradientes SVG).
// Uso: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

// `pad` controla la zona segura: los maskable exigen el contenido en el 80% central.
const iconSvg = (size, pad = 0) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs>
    <radialGradient id="aura" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="55%" stop-color="#7c5cf5"/>
      <stop offset="100%" stop-color="#4c2fd9"/>
    </radialGradient>
  </defs>
  <rect width="64" height="64" fill="url(#aura)"/>
  <g transform="translate(32 32) scale(${1 - pad}) translate(-32 -32)">
    <path d="M32 15 L46.5 49 h-8 l-2.9 -7.2 h-11.2 l-2.9 7.2 h-8 Z M32 27.6 l-3.2 7.9 h6.4 Z" fill="#fff"/>
  </g>
</svg>`

const out = new URL('../public/', import.meta.url).pathname
await mkdir(out, { recursive: true })

const targets = [
  { file: 'pwa-192.png', size: 192, pad: 0 },
  { file: 'pwa-512.png', size: 512, pad: 0 },
  { file: 'pwa-maskable-512.png', size: 512, pad: 0.18 },
  { file: 'apple-touch-icon.png', size: 180, pad: 0 },
]

for (const { file, size, pad } of targets) {
  await sharp(Buffer.from(iconSvg(size, pad)))
    .png()
    .toFile(out + file)
  console.log('✓', file)
}
