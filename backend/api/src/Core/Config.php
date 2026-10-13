<?php
declare(strict_types=1);
namespace App\Core;

final class Config
{
    private static array $c = [];

    public static function load(array $c): void { self::$c = $c; }

    public static function get(string $key, mixed $default = null): mixed
    {
        $v = self::$c;
        foreach (explode('.', $key) as $k) {
            if (!is_array($v) || !array_key_exists($k, $v)) {
                return $default;
            }
            $v = $v[$k];
        }
        return $v;
    }

    public static function storagePath(string $sub = ''): string
    {
        $base = (string)self::get('paths.storage', dirname(__DIR__, 2) . '/storage');
        return $sub === '' ? $base : $base . '/' . $sub;
    }

    public static function uploadsPath(): string
    {
        return (string)self::get('paths.uploads', dirname(__DIR__, 3) . '/uploads');
    }
}
