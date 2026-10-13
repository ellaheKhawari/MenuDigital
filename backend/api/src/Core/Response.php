<?php
declare(strict_types=1);
namespace App\Core;

final class Response
{
    private const FLAGS = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR;

    public static function json(mixed $data, int $status = 200): void
    {
        self::send($status, json_encode(['data' => $data], self::FLAGS));
    }

    public static function noContent(): void { self::send(204, ''); }

    public static function error(int $status, string $message, array $errors = [], array $headers = []): void
    {
        $b = ['statusCode' => $status, 'message' => $message];
        if ($errors) {
            $b['errors'] = $errors;
        }
        self::send($status, json_encode($b, self::FLAGS), $headers);
    }

    private static function send(int $status, string $body, array $headers = []): void
    {
        if (headers_sent()) {
            return;
        }
        http_response_code($status);
        if ($status !== 204) {
            header('Content-Type: application/json; charset=utf-8');
        }
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        foreach ($headers as $k => $v) {
            header($k . ': ' . $v);
        }
        echo $body;
    }
}
