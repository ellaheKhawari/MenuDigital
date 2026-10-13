# اعمال این بسته روی پروژه‌ی فعلی (بدون دانلود دوباره‌ی کل پروژه)

۱. محتوای این zip رو روی پوشه‌ی پروژه کپی کن (فایل‌های هم‌نام جایگزین می‌شن؛ `docs/` جدیده).
۲. در پوشه‌ی `frontend` فقط سه پکیج جدید نصب کن (بقیه همون node_modules قبلی):
```
pnpm add -D vite-plugin-pwa qrcode vitest
```
۳. در `frontend/package.json` بخش `scripts` این دو خط رو اضافه کن:
```
"test": "vitest run",
"qr": "node scripts/generate-qr.mjs"
```
۴. تأیید: `pnpm test` (۱۰ تست) و `pnpm build` (باید «PWA ... precache» چاپ کنه).

## چی عوض شده
| فایل | تغییر |
|---|---|
| `frontend/vite.config.ts` | PWA (فقط precache، `/api` همیشه NetworkOnly)، proxy قابل تنظیم با `API_PROXY` در `.env`، proxy برای `preview` |
| `frontend/src/config/cafe.config.ts` | نام، رنگ‌های مانیفست و `siteUrl` برای QR |
| `frontend/public/icons/*.png` | آیکن‌های موقت (۱۹۲، ۵۱۲، maskable، apple-touch) ← برای هر کافه جایگزین کن |
| `frontend/index.html` | apple-touch-icon و theme-color |
| `frontend/scripts/generate-qr.mjs` | تولید QR (SVG، PNG ۲۰۰۰px، قالب A6) |
| `frontend/vitest.config.ts`، `src/lib/*.test.ts` | تست واحد |
| `backend/api/bin/backup.php` | + zip هفتگی عکس‌ها (۴ نسخه‌ی آخر) |
| `backend/api/bin/cleanup_orphans.php` | + پاک‌سازی لاگ‌های بیش از ۶ ماه |
