<?php
declare(strict_types=1);
namespace App\Security;

use App\Core\{HttpException, Request};

final class Csrf
{
    public static function token(): string
    {
        Auth::start();
        return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    }

    public static function verify(Request $r): void
    {
        if ($r->method === 'GET') {
            return;
        }
        Auth::start();
        $sent = $r->header('X-CSRF-Token') ?? '';
        $real = (string)($_SESSION['csrf'] ?? '');
        if ($real === '' || !hash_equals($real, $sent)) {
            throw new HttpException(403, 'توکن امنیتی نامعتبر است');
        }
    }
}
