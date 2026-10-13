<?php
declare(strict_types=1);

use App\Core\{Config, ErrorHandler, Response};

error_reporting(E_ALL);
ini_set('display_errors', '0');
date_default_timezone_set('UTC');

spl_autoload_register(static function (string $class): void {
    if (strncmp($class, 'App\\', 4) !== 0) {
        return;
    }
    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, 4)) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

$configFile = __DIR__ . '/../config/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"statusCode":500,"message":"سرور پیکربندی نشده است"}';
    exit;
}
Config::load(require $configFile);
ErrorHandler::register();

if (PHP_SAPI !== 'cli' && Config::get('env') === 'production') {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
    if (!$https) {
        Response::error(403, 'فقط از طریق HTTPS مجاز است');
        exit;
    }
}
