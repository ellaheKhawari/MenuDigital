<?php
declare(strict_types=1);
namespace App\Security;

use App\Core\Db;

final class RateLimiter
{
    private const MAX = 5;
    private const WINDOW = 900; // ۱۵ دقیقه

    /** ثانیه‌های باقی‌مانده تا آزاد شدن؛ ۰ یعنی مجازه. */
    public static function retryAfter(string $ip): int
    {
        $s = Db::q('SELECT COUNT(*) c, MIN(created_at) m FROM login_attempts WHERE ip = ? AND created_at > (NOW() - INTERVAL 15 MINUTE)', [$ip])->fetch();
        if ((int)$s['c'] < self::MAX) {
            return 0;
        }
        return max(1, strtotime($s['m'] . ' UTC') + self::WINDOW - time());
    }

    public static function fail(string $ip): void { Db::q('INSERT INTO login_attempts (ip) VALUES (?)', [$ip]); }

    public static function clear(string $ip): void { Db::q('DELETE FROM login_attempts WHERE ip = ?', [$ip]); }
}
