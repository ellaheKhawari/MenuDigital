<?php
declare(strict_types=1);

use App\Controller\{AuthController, CategoryController, HealthController, ItemController, PublicMenuController, SettingsController, UploadController};
use App\Core\Router;
use App\Security\Middleware as M;

return static function (Router $r): void {
    $admin = [[M::class, 'requireAuth'], [M::class, 'origin'], [M::class, 'csrf']];
    $origin = [[M::class, 'origin']];
    $h = static fn(string $c, string $m) => static fn($req, $p) => (new $c())->$m($req, $p);

    $r->add('GET', '/health', $h(HealthController::class, 'show'));
    $r->add('GET', '/public/menu', $h(PublicMenuController::class, 'show'));

    $r->add('POST', '/auth/login', $h(AuthController::class, 'login'), $origin);
    $r->add('POST', '/auth/logout', $h(AuthController::class, 'logout'), $origin);
    $r->add('GET', '/auth/me', $h(AuthController::class, 'me'));
    $r->add('PATCH', '/admin/password', $h(AuthController::class, 'changePassword'), $admin);

    $r->add('GET', '/admin/categories', $h(CategoryController::class, 'index'), $admin);
    $r->add('POST', '/admin/categories', $h(CategoryController::class, 'store'), $admin);
    $r->add('PUT', '/admin/categories/reorder', $h(CategoryController::class, 'reorder'), $admin);
    $r->add('PATCH', '/admin/categories/{id}', $h(CategoryController::class, 'update'), $admin);
    $r->add('DELETE', '/admin/categories/{id}', $h(CategoryController::class, 'destroy'), $admin);

    $r->add('GET', '/admin/items', $h(ItemController::class, 'index'), $admin);
    $r->add('POST', '/admin/items', $h(ItemController::class, 'store'), $admin);
    $r->add('PUT', '/admin/items/reorder', $h(ItemController::class, 'reorder'), $admin);
    $r->add('GET', '/admin/items/{id}', $h(ItemController::class, 'show'), $admin);
    $r->add('PATCH', '/admin/items/{id}', $h(ItemController::class, 'update'), $admin);
    $r->add('PATCH', '/admin/items/{id}/availability', $h(ItemController::class, 'availability'), $admin);
    $r->add('DELETE', '/admin/items/{id}', $h(ItemController::class, 'destroy'), $admin);

    $r->add('POST', '/admin/upload', $h(UploadController::class, 'store'), $admin);
    $r->add('GET', '/admin/settings', $h(SettingsController::class, 'show'), $admin);
    $r->add('PATCH', '/admin/settings', $h(SettingsController::class, 'update'), $admin);
};
