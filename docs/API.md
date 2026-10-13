# مرجع API (نسخه‌ی پیاده‌شده)
همه‌ی پاسخ‌ها JSON و `Cache-Control: no-store`. موفق: `{ "data": ... }` (۲۰۴ بدون بدنه). خطا: `{ "statusCode", "message", "errors"?: { field: "پیام" } }`.
تغییرات (غیر GET): هدر `X-CSRF-Token` (از `login`/`me`) + کوکی session `cm_sid`؛ بدنه `application/json` حداکثر ۱MB. اگه هاست PATCH/DELETE رو می‌بنده: `POST` + `X-HTTP-Method-Override`.

| متد و مسیر | دسترسی | توضیح |
|---|---|---|
| GET `/health` | عمومی | `{status:"ok",db:true}` یا ۵۰۳ |
| GET `/public/menu` | عمومی | `{generatedAt, settings:{name,logo,phone,instagram,address,workingHours,themeColor}, categories:[{id,title,items:[{id,title,description,price,image,thumb,isAvailable,isFeatured}]}]}` فقط دسته‌های فعال و غیرخالی |
| POST `/auth/login` | عمومی + Origin | `{email,password}` ← `{admin,csrfToken}`؛ ۴۰۱ پیام یکسان؛ ۴۲۹ + `Retry-After` بعد از ۵ شکست در ۱۵ دقیقه |
| GET `/auth/me` | ادمین | `{admin,csrfToken}` |
| POST `/auth/logout` | — | ۲۰۴ |
| PATCH `/admin/password` | ادمین | `{currentPassword,newPassword(≥۱۰)}` ← ۲۰۴ |
| GET/POST `/admin/categories` | ادمین | `{id,title,isActive,itemCount}`؛ ساخت: `{title(1..100),isActive?}` ← ۲۰۱ |
| PUT `/admin/categories/reorder` | ادمین | `{ids:[...]}` دقیقاً همه‌ی دسته‌ها بدون تکرار |
| PATCH/DELETE `/admin/categories/{id}` | ادمین | حذف: آیتم‌ها و عکس‌ها هم حذف می‌شن |
| GET `/admin/items?categoryId=` | ادمین | `image` مسیر کامل `/uploads/…` |
| POST `/admin/items` | ادمین | `{categoryId,title(1..120),description?(≤500),price(1..99999999),image?,isAvailable?,isFeatured?}` ← ۲۰۱ |
| GET/PATCH/DELETE `/admin/items/{id}` | ادمین | PATCH جزئی؛ `image` فقط نام فایل (`^[a-f0-9]{24}\.(webp\|jpg)$`) |
| PATCH `/admin/items/{id}/availability` | ادمین | `{isAvailable}` |
| PUT `/admin/items/reorder` | ادمین | `{categoryId,ids}` |
| POST `/admin/upload` | ادمین | multipart: `file` (≤۵MB؛ JPG/PNG/WebP) + `type=item\|logo` ← `{image:"نام‌فایل"}` ۲۰۱ |
| GET/PATCH `/admin/settings` | ادمین | `name,phone,address,instagram,workingHours,logo,themeColor(#rrggbb)` |

کدها: ۴۰۰ JSON خراب · ۴۰۱ ورود لازم · ۴۰۳ CSRF/Origin · ۴۰۴ · ۴۰۵ (`Allow`) · ۴۱۳ حجم · ۴۱۵ نوع · ۴۲۲ اعتبارسنجی · ۴۲۹ · ۵۰۰ (جزئیات فقط در لاگ).
عکس‌ها: آیتم ← ۸۰۰×۶۰۰ WebP + thumb ۴۰۰×۳۰۰ (`*_t.webp`)؛ لوگو ← حداکثر ۵۱۲px با شفافیت.
