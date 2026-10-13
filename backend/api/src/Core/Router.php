<?php
declare(strict_types=1);
namespace App\Core;

final class Router
{
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler, array $middleware = []): void
    {
        $re = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>\d+)', $pattern) . '$#';
        $this->routes[] = [$method, $re, $handler, $middleware];
    }

    public function dispatch(Request $req): void
    {
        $allowed = [];
        foreach ($this->routes as [$method, $re, $handler, $middleware]) {
            if (!preg_match($re, $req->path, $m)) {
                continue;
            }
            if ($method !== $req->method) {
                $allowed[] = $method;
                continue;
            }
            $params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
            foreach ($middleware as $mw) {
                $mw($req);
            }
            $handler($req, $params);
            return;
        }
        if ($allowed) {
            throw new HttpException(405, 'متد مجاز نیست', [], ['Allow' => implode(', ', array_unique($allowed))]);
        }
        throw new HttpException(404, 'مسیر پیدا نشد');
    }
}
