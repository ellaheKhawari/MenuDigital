// node scripts/generate-qr.mjs [https://menu.example.ir]
// خروجی در scripts/out: qr.svg، qr.png (۲۰۰۰px) و qr-a6.svg (قالب چاپ A6)
// آدرس: آرگومان ← متغیر SITE_URL ← siteUrl در src/config/cafe.config.ts
import QRCode from 'qrcode'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const fromConfig = readFileSync(new URL('../src/config/cafe.config.ts', import.meta.url), 'utf8').match(/siteUrl:\s*'([^']+)'/)?.[1]
const url = process.argv[2] ?? process.env.SITE_URL ?? fromConfig
if (!url || !/^https:\/\/[^\s?#]+$/.test(url)) {
  console.error('آدرس باید https و بدون پارامتر/هش باشد، مثل https://menu.cafename.ir'); process.exit(1)
}
const opt = { errorCorrectionLevel: 'M', margin: 4, color: { dark: '#000000', light: '#ffffff' } } // quiet zone = ۴ ماژول
const out = new URL('./out/', import.meta.url)
mkdirSync(out, { recursive: true })

const svg = await QRCode.toString(url, { ...opt, type: 'svg' })
writeFileSync(new URL('qr.svg', out), svg)
await QRCode.toFile(new URL('qr.png', out).pathname, url, { ...opt, width: 2000 })

// قالب A6 (۱۰۵×۱۴۸ میلی‌متر): QR حدود ۷۰mm (بسیار بزرگ‌تر از حداقل ۳۰mm)
const b64 = Buffer.from(svg).toString('base64')
writeFileSync(new URL('qr-a6.svg', out), `<svg xmlns="http://www.w3.org/2000/svg" width="105mm" height="148mm" viewBox="0 0 105 148">
  <rect width="105" height="148" fill="#fffaf4"/>
  <text x="52.5" y="26" text-anchor="middle" font-family="Vazirmatn, Tahoma, sans-serif" font-size="9" font-weight="800" fill="#6e3416">برای دیدن منو اسکن کنید</text>
  <rect x="17.500" y="38" width="70" height="70" rx="3" fill="#fff"/>
  <image x="17.500" y="38" width="70" height="70" href="data:image/svg+xml;base64,${b64}"/>
  <text x="52.5" y="122" text-anchor="middle" font-family="Tahoma, sans-serif" font-size="4.2" fill="#565448" direction="ltr">${url.replace('https://', '')}</text>
</svg>
`)
console.log('ساخته شد:', url, '→ scripts/out/{qr.svg,qr.png,qr-a6.svg}')
