<?php
declare(strict_types=1);
namespace App\Core;

final class Request
{
    private const MAX_BODY = 1048576;
    public readonly string $method;
    public readonly string $path;
    public readonly array $query;

    public function __construct()
    {
        $m = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
        if ($m === 'POST') {
            $o = strtoupper((string)($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ?? ''));
            if (in_array($o, ['PUT', 'PATCH', 'DELETE'], true)) {
                $m = $o;
            }
        }
        $this->method = $m;
        $uri = (string)(parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/');
        $base = rtrim(dirname((string)($_SERVER['SCRIPT_NAME'] ?? '')), '/\\');
        if ($base !== '' && str_starts_with($uri, $base)) {
            $uri = substr($uri, strlen($base));
        }
        $this->path = '/' . trim(rawurldecode($uri), '/');
        $this->query = $_GET;
    }

    public function header(string $name): ?string
    {
        $v = $_SERVER['HTTP_' . strtoupper(str_replace('-', '_', $name))] ?? null;
        return is_string($v) ? $v : null;
    }

    public function ip(): string
    {
        $h = Config::get('trusted_proxy_header');
        if (is_string($h) && !empty($_SERVER[$h])) {
            return trim(explode(',', (string)$_SERVER[$h])[0]);
        }
        return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    }

    public function json(): array
    {
        if (stripos((string)($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) {
            throw new HttpException(415, 'Content-Type باید application/json باشد');
        }
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > self::MAX_BODY) {
            throw new HttpException(413, 'حجم درخواست بیش از حد مجاز است');
        }
        $raw = (string)file_get_contents('php://input', false, null, 0, self::MAX_BODY + 1);
        if (strlen($raw) > self::MAX_BODY) {
            throw new HttpException(413, 'حجم درخواست بیش از حد مجاز است');
        }
        try {
            $d = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            throw new HttpException(400, 'بدنه‌ی JSON نامعتبر است');
        }
        if (!is_array($d)) {
            throw new HttpException(400, 'بدنه‌ی JSON نامعتبر است');
        }
        return $d;
    }
}
