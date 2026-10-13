# قالب منوی دیجیتال کافه

```
frontend/   Vite + React + TS + Tailwind 4  (منوی عمومی + پنل /admin)
backend/    PHP 8.2+ بدون framework و Composer + MariaDB
  api/      می‌شه public_html/api      uploads/  می‌شه public_html/uploads
  sql/      001_schema.sql, 002_seed_dev.sql     tools/  make_admin_sql.php
  deploy/   root.htaccess, user.ini              tests/  smoke.py, api.http, dev-router.php
```

## اجرای محلی (XAMPP)
1. PHP 8.2+ با افزونه‌های `gd, mbstring, fileinfo, exif, pdo_mysql` (و `zip`) فعال باشه.
2. در phpMyAdmin دیتابیس `cafe_menu` (utf8mb4_unicode_ci) بساز و `backend/sql/001_schema.sql` و (فقط محلی) `002_seed_dev.sql` رو Import کن.
3. `backend/api/config/config.example.php` رو کپی کن به `config.php` و مقادیر دیتابیس رو بذار.
4. ادمین بساز (روی کامپیوتر خودت) و خروجی رو در phpMyAdmin اجرا کن:
   `php backend/tools/make_admin_sql.php you@example.com "رمز-حداقل-۱۰-کاراکتری"`
5. Virtual Host با `DocumentRoot` برابر پوشه‌ی `backend/` (مثلاً `cafe.test`، `AllowOverride All`، `mod_rewrite` فعال)؛ یا بدون Apache:
   `php -S 127.0.0.1:8080 -t backend backend/tests/dev-router.php` و آدرس proxy در `frontend/vite.config.ts` رو عوض کن.
6. `cd frontend && cp .env.example .env && npm install && npm run dev` ← `http://localhost:5173` (منو) و `/admin` (پنل).

## تست
`python3 backend/tests/smoke.py http://127.0.0.1:8080 backend/uploads` (۷۷ تست: هسته، auth/CSRF/rate-limit، CRUD، آپلود، منوی زنده).
اگه سرور داخلی PHP می‌زنی: `php -d upload_max_filesize=8M -d post_max_size=10M -S ...`

## نکته‌ها
- session به‌صورت lazy شروع می‌شه (روی `/public/menu` هیچ session ای ساخته نمی‌شه).
- `api/bin/cleanup_orphans.php` (cron هفتگی) و `api/bin/backup.php` (cron روزانه) فقط از CLI اجرا می‌شن.
- `deploy/root.htaccess` → `public_html/.htaccess`، و `deploy/user.ini` فقط اگه از پنل هاست نمی‌شه PHP رو تنظیم کرد.
- در production: `env=production`، `cookie_secure=true`، و `config.php` رو هرگز در گیت نذار.
