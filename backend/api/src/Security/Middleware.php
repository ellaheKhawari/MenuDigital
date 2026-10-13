<?php
declare(strict_types=1);
namespace App\Security;

use App\Core\{Config, HttpException, Request};

final class Middleware
{
    public static function requireAuth(Request $r): void { Auth::admin(); }

    public static function csrf(Request $r): void { Csrf::verify($r); }

    public static function origin(Request $r): void
    {
        if ($r->method === 'GET') {
            return;
        }
        $o = $r->header('Origin');
        if ($o === null || $o === '') {
            return;
        }
        $host = (string)parse_url($o, PHP_URL_HOST);
        $port = parse_url($o, PHP_URL_PORT);
        $originHost = $port ? "$host:$port" : $host;
        if (strcasecmp($originHost, (string)($_SERVER['HTTP_HOST'] ?? '')) === 0) {
            return;
        }
        if (in_array($o, (array)Config::get('allowed_origins', []), true)) {
            return;
        }
        throw new HttpException(403, 'مبدأ درخواست مجاز نیست');
    }
}
