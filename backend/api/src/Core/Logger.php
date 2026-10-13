<?php
declare(strict_types=1);
namespace App\Core;

final class Logger
{
    private static ?string $rid = null;

    public static function rid(): string { return self::$rid ??= bin2hex(random_bytes(4)); }

    public static function log(string $level, string $msg): void
    {
        $dir = Config::storagePath('logs');
        if (!is_dir($dir)) {
            @mkdir($dir, 0700, true);
        }
        @file_put_contents(
            $dir . '/app-' . gmdate('Y-m') . '.log',
            sprintf("[%s] [%s] %s: %s\n", gmdate('c'), self::rid(), $level, $msg),
            FILE_APPEND | LOCK_EX
        );
    }
}
