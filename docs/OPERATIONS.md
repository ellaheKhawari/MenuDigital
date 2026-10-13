# عملیات: دیپلوی، بکاپ، بازیابی
## دیپلوی (فاز ۱۲)
۱. DNS و هاست: PHP 8.2+ با `gd(webp), mbstring, fileinfo, exif, pdo_mysql, zip`؛ SSL رایگان.
۲. دیتابیس + کاربر در پنل هاست؛ `001_schema.sql` رو Import کن (**بدون** seed)؛ ادمین: `php backend/tools/make_admin_sql.php email "رمز"` روی کامپیوتر خودت ← خروجی رو در phpMyAdmin اجرا کن.
۳. آپلود `backend/api` به `public_html/api`، با `config.php` واقعی (`env=production`, `cookie_secure=true`). پوشه‌ها ۷۵۵، فایل‌ها ۶۴۴، `api/storage` و زیرپوشه‌ها ۷۰۰؛ هیچ‌چیز ۷۷۷ نه.
۴. `.env.production` همین کافه ← `pnpm build` ← محتوای `dist/` در `public_html`؛ سپس `backend/uploads` و `backend/deploy/root.htaccess` (→ `.htaccess` ریشه) و در صورت نیاز `user.ini`. پوشه‌های `api` و `uploads` رو در آپدیت‌های بعدی جایگزین نکن.
۵. بعد از تست SSL ریدایرکت HTTPS؛ بعد از پایداری HSTS (در `.htaccess` کامنت شده).
**تست بعد از دیپلوی:** `/api/config/config.php`، `/api/storage/`، `/uploads/test.php` باید ۴۰۳/۴۰۴ بدن؛ `/api/health`؛ لاگین؛ ساخت آیتم با عکس؛ دیده شدن در منو؛ QR؛ اینترنت موبایل ایرانی بدون VPN.

## مشکلات رایج
| علامت | علت / راه‌حل |
|---|---|
| ۵۰۰ روی همه‌ی `/api` | نسخه‌ی PHP یا `config.php` ← `api/storage/logs/app-*.log` |
| ۴۰۴ روی `/admin/login` بعد از refresh | قانون SPA در `.htaccess` اعمال نمی‌شه ← `AllowOverride`/`mod_rewrite` |
| بعد از چند دقیقه خارج می‌شه | `session.gc_maxlifetime` / مسیر session مشترک (در `api/storage/sessions` ذخیره می‌شه) |
| آپلود ۴۱۳ | `upload_max_filesize`/`post_max_size` (`user.ini` یا پنل) |
| عکس‌ها JPEG ذخیره می‌شن | GD بدون WebP ← از پشتیبانی بخواه |
| PATCH/DELETE ۴۰۳/۴۰۵ | mod_security ← `VITE_USE_METHOD_OVERRIDE=true` و build دوباره |
| تغییر منو دیر دیده می‌شه | کش LiteSpeed/CDN روی `/api` ← استثنا کن |

## بکاپ (فاز ۱۳)
cron روزانه: `php /home/USER/public_html/api/bin/backup.php` ← `api/storage/backups/db-*.sql.gz` (۱۴ نسخه) + `uploads-*.zip` هفتگی (۴ نسخه).
cron هفتگی: `php /home/USER/public_html/api/bin/cleanup_orphans.php` (عکس‌های بی‌صاحب بیش از ۲۴ ساعت، login_attempts و لاگ‌های >۶ ماه).
ماهی یک بار یک نسخه از دیتابیس و uploads رو روی کامپیوتر خودت هم دانلود کن.
**بازیابی:** دیتابیس خالی بساز ← `zcat db-….sql.gz | mysql dbname` (یا Import همان فایل در phpMyAdmin) ← محتوای `uploads-….zip` رو در `uploads/` باز کن ← `/api/public/menu` رو چک کن. (بازیابی روی دیتابیس تست در توسعه آزموده شده: ۴ دسته، ۱۰ آیتم، ادمین و تنظیمات برگشتن.)

## تمدید و ارتقا
تاریخ تمدید دامنه و هاست رو یادداشت کن. قبل از ارتقای PHP: بکاپ + بررسی `/api/health` و آپلود عکس بعدش. تغییر آدرس منو ← QR رو دوباره بساز و چاپ‌ها رو عوض کن.
