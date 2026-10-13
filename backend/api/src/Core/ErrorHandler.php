<?php
declare(strict_types=1);
namespace App\Core;

final class ErrorHandler
{
    public static function register(): void
    {
        set_exception_handler([self::class, 'handle']);
        set_error_handler(static function (int $no, string $str, string $file, int $line): bool {
            if (!(error_reporting() & $no)) {
                return false;
            }
            if (in_array($no, [E_DEPRECATED, E_USER_DEPRECATED, E_NOTICE, E_USER_NOTICE], true)) {
                Logger::log('warning', "$str @ $file:$line");
                return true;
            }
            throw new \ErrorException($str, 0, $no, $file, $line);
        });
        register_shutdown_function(static function (): void {
            $e = error_get_last();
            if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
                Logger::log('critical', $e['message'] . ' @ ' . $e['file'] . ':' . $e['line']);
                Response::error(500, 'خطای داخلی سرور');
            }
        });
    }

    public static function handle(\Throwable $e): void
    {
        if ($e instanceof HttpException) {
            Response::error($e->status, $e->getMessage(), $e->errors, $e->headers);
            return;
        }
        Logger::log('error', get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine() . "\n" . $e->getTraceAsString());
        Response::error(500, 'خطای داخلی سرور');
    }
}
