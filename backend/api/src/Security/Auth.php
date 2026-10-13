<?php
declare(strict_types=1);
namespace App\Security;

use App\Core\{Config, HttpException};
use App\Repository\AdminRepository;

final class Auth
{
    private const LIFETIME = 1209600; // ۱۴ روز

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        $path = Config::storagePath('sessions');
        if (!is_dir($path)) {
            @mkdir($path, 0700, true);
        }
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.gc_maxlifetime', (string)self::LIFETIME);
        ini_set('session.gc_probability', '1');
        ini_set('session.gc_divisor', '100');
        session_save_path($path);
        session_name('cm_sid');
        session_set_cookie_params([
            'lifetime' => self::LIFETIME, 'path' => '/',
            'secure' => (bool)Config::get('cookie_secure', false),
            'httponly' => true, 'samesite' => 'Lax',
        ]);
        session_start();
    }

    private static function algo(): string|int
    {
        return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
    }

    private static function opts(): array
    {
        return self::algo() === PASSWORD_BCRYPT ? ['cost' => 12] : [];
    }

    public static function hash(string $password): string
    {
        return password_hash($password, self::algo(), self::opts());
    }

    /** ادمین یا null؛ همیشه یک password_verify انجام می‌شه تا زمان پاسخ یکسان بمونه. */
    public static function attempt(string $email, string $password): ?array
    {
        static $dummy = null;
        $admin = AdminRepository::findByEmail($email);
        $hash = $admin['password_hash'] ?? ($dummy ??= self::hash('dummy-password'));
        $ok = password_verify($password, $hash);
        if ($admin === null || !$ok) {
            return null;
        }
        if (password_needs_rehash($hash, self::algo(), self::opts())) {
            AdminRepository::setPassword((int)$admin['id'], self::hash($password));
        }
        return $admin;
    }

    public static function login(array $admin): void
    {
        self::start();
        session_regenerate_id(true);
        $_SESSION['admin_id'] = (int)$admin['id'];
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }

    public static function logout(): void
    {
        self::start();
        $_SESSION = [];
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax']);
        session_destroy();
    }

    public static function admin(): array
    {
        self::start();
        $id = $_SESSION['admin_id'] ?? null;
        $admin = is_int($id) ? AdminRepository::find($id) : null;
        if ($admin === null) {
            throw new HttpException(401, 'ابتدا وارد شوید');
        }
        return $admin;
    }
}
