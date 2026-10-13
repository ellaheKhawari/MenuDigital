<?php
declare(strict_types=1);
namespace App\Controller;

use App\Core\{Db, Request, Response};

final class HealthController
{
    public function show(Request $r, array $p): void
    {
        try {
            Db::q('SELECT 1');
            Response::json(['status' => 'ok', 'db' => true]);
        } catch (\Throwable) {
            Response::error(503, 'پایگاه داده در دسترس نیست');
        }
    }
}
