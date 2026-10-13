# راه‌اندازی کافه‌ی جدید (فاز ۱۴)
۱. از `main` شاخه‌ی `cafe/<name>` بساز.
۲. تم: `themes/base` ← کپی به `themes/<name>`؛ `tokens.css` و فونت و (در صورت نیاز) اسلات‌ها؛ ثبت در `themes/registry.ts`.
۳. `src/config/cafe.config.ts` (نام، نام کوتاه، رنگ‌های مانیفست، `siteUrl`) و آیکن‌های `public/icons` (۱۹۲، ۵۱۲، maskable-۵۱۲ با حاشیه‌ی امن، ۱۸۰ apple-touch).
۴. `.env.production`: `VITE_THEME=<name>` (و `VITE_API_BASE`، در صورت لزوم `VITE_USE_METHOD_OVERRIDE`). توسعه بدون بک‌اند: `VITE_MOCK_MENU=true`.
۵. `pnpm test` و `pnpm build` پاس بشه.
۶. هاست/دامنه/SSL/دیتابیس جدید؛ `sql/001_schema.sql` (و 00X بعدی) + ادمین؛ آپلود `backend/api` با `config.php` مخصوص این نصب؛ آپلود build.
۷. تست پذیرش کوتاه: لاگین، دسته و آیتم با عکس، دیده شدن در منو، «عدم کش» (`TESTING.md` سطح ۴)، آدرس‌های ممنوعه، QR (`pnpm qr https://…`، حداقل ۳ گوشی، چاپ آزمایشی ۳×۳ سانتی‌متر یا بیشتر).
۸. cron بکاپ، تحویل `ADMIN_GUIDE.md`، ثبت تاریخ تمدید.
