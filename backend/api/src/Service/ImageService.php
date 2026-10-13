<?php
declare(strict_types=1);
namespace App\Service;

use App\Core\{Config, HttpException, Logger};

final class ImageService
{
    private const NAME_RE = '/^[a-f0-9]{24}\.(webp|jpg)$/';

    public static function url(?string $file): ?string { return $file ? '/uploads/' . $file : null; }

    public static function thumbName(string $file): string { return preg_replace('/\.(webp|jpg)$/', '_t.$1', $file) ?? $file; }

    public static function exists(string $file): bool
    {
        return preg_match(self::NAME_RE, $file) === 1 && is_file(Config::uploadsPath() . '/' . $file);
    }

    public static function delete(?string $file): void
    {
        if ($file === null || preg_match(self::NAME_RE, $file) !== 1) {
            return;
        }
        $dir = Config::uploadsPath() . '/';
        foreach ([$file, self::thumbName($file)] as $f) {
            if (is_file($dir . $f)) {
                @unlink($dir . $f);
            }
        }
    }

    private static function bytes(string $v): int
    {
        $v = trim($v);
        if ($v === '-1') return PHP_INT_MAX;
        $n = (int)$v;
        return match (strtolower(substr($v, -1))) { 'g' => $n << 30, 'm' => $n << 20, 'k' => $n << 10, default => $n };
    }

    /** @return string نام فایل ذخیره‌شده */
    public static function store(array $f, string $type): string
    {
        $err = (int)($f['error'] ?? UPLOAD_ERR_NO_FILE);
        if ($err !== UPLOAD_ERR_OK) {
            throw match ($err) {
                UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => new HttpException(413, 'حجم عکس زیاد است (حداکثر ۵ مگابایت)'),
                UPLOAD_ERR_PARTIAL => new HttpException(400, 'آپلود ناقص ماند؛ دوباره تلاش کن'),
                UPLOAD_ERR_NO_FILE => new HttpException(422, 'فایلی انتخاب نشده است', ['file' => 'فایل الزامی است']),
                default => new HttpException(500, 'خطای داخلی سرور'),
            };
        }
        $tmp = (string)$f['tmp_name'];
        if (!is_uploaded_file($tmp) && !(PHP_SAPI === 'cli-server' && is_file($tmp))) {
            throw new HttpException(400, 'آپلود نامعتبر است');
        }
        if ((int)$f['size'] > 5 * 1024 * 1024) {
            throw new HttpException(413, 'حجم عکس زیاد است (حداکثر ۵ مگابایت)');
        }
        $bin = (string)file_get_contents($tmp);
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bin);
        if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            throw new HttpException(415, 'فقط عکس JPG، PNG یا WebP مجاز است');
        }
        $info = @getimagesizefromstring($bin);
        if ($info === false) {
            throw new HttpException(422, 'فایل تصویر معتبر نیست');
        }
        [$w, $h] = $info;
        if ($w < 1 || $h < 1 || $w > 8000 || $h > 8000 || $w * $h > 40_000_000
            || $w * $h * 5 > self::bytes((string)ini_get('memory_limit')) * 0.6) {
            throw new HttpException(422, 'عکس خیلی بزرگ است');
        }
        $src = @imagecreatefromstring($bin);
        if ($src === false) {
            throw new HttpException(422, 'فایل تصویر معتبر نیست');
        }
        if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
            $src = self::orient($src, $tmp);
        }
        return $type === 'logo' ? self::saveLogo($src) : self::saveItem($src);
    }

    private static function orient(\GdImage $im, string $path): \GdImage
    {
        $ex = @exif_read_data($path);
        $deg = match ((int)($ex['Orientation'] ?? 1)) { 3 => 180, 6 => -90, 8 => 90, default => 0 };
        if ($deg === 0) return $im;
        return imagerotate($im, $deg, 0) ?: $im;
    }

    private static function encode(\GdImage $im, string $path, int $q, bool $webp): void
    {
        $ok = $webp ? imagewebp($im, $path, $q) : imagejpeg($im, $path, max($q, 82));
        if (!$ok) {
            throw new \RuntimeException('image write failed');
        }
    }

    private static function resample(\GdImage $src, int $sx, int $sy, int $sw, int $sh, int $dw, int $dh, bool $alpha = false): \GdImage
    {
        $d = imagecreatetruecolor($dw, $dh);
        if ($alpha) {
            imagealphablending($d, false);
            imagesavealpha($d, true);
            imagefill($d, 0, 0, imagecolorallocatealpha($d, 0, 0, 0, 127));
        } else {
            imagefill($d, 0, 0, imagecolorallocate($d, 255, 255, 255));
        }
        imagecopyresampled($d, $src, 0, 0, $sx, $sy, $dw, $dh, $sw, $sh);
        return $d;
    }

    private static function saveItem(\GdImage $src): string
    {
        $webp = function_exists('imagewebp');
        if (!$webp) Logger::log('warning', 'imagewebp missing; saving JPEG');
        $w = imagesx($src); $h = imagesy($src);
        // ترکیب روی پس‌زمینه‌ی سفید (PNG شفاف)
        $flat = self::resample($src, 0, 0, $w, $h, $w, $h);
        if ($w * 3 > $h * 4) { $cw = (int)round($h * 4 / 3); $ch = $h; } else { $cw = $w; $ch = (int)round($w * 3 / 4); }
        $cx = intdiv($w - $cw, 2); $cy = intdiv($h - $ch, 2);
        $mw = min(800, $cw); $tw = min(400, $cw);
        $main = self::resample($flat, $cx, $cy, $cw, $ch, $mw, (int)round($mw * 3 / 4));
        $thumb = self::resample($flat, $cx, $cy, $cw, $ch, $tw, (int)round($tw * 3 / 4));
        $name = bin2hex(random_bytes(12)) . ($webp ? '.webp' : '.jpg');
        $dir = Config::uploadsPath() . '/';
        $paths = [$dir . $name, $dir . self::thumbName($name)];
        try {
            self::encode($main, $paths[0], 80, $webp);
            self::encode($thumb, $paths[1], 75, $webp);
        } catch (\Throwable $e) {
            foreach ($paths as $p) { if (is_file($p)) @unlink($p); }
            throw $e;
        }
        return $name;
    }

    private static function saveLogo(\GdImage $src): string
    {
        $webp = function_exists('imagewebp');
        $w = imagesx($src); $h = imagesy($src);
        $s = min(1, 512 / max($w, $h));
        $dw = max(1, (int)round($w * $s)); $dh = max(1, (int)round($h * $s));
        $out = self::resample($src, 0, 0, $w, $h, $dw, $dh, $webp);
        $name = bin2hex(random_bytes(12)) . ($webp ? '.webp' : '.jpg');
        $path = Config::uploadsPath() . '/' . $name;
        try {
            self::encode($out, $path, 85, $webp);
        } catch (\Throwable $e) {
            if (is_file($path)) @unlink($path);
            throw $e;
        }
        return $name;
    }
}
