<?php
declare(strict_types=1);
namespace App\Controller;

use App\Core\{HttpException, Request, Response, Validator};
use App\Repository\AdminRepository;
use App\Security\{Auth, Csrf, RateLimiter};

final class AuthController
{
    public function login(Request $r, array $p): void
    {
        $in = Validator::make($r->json(), [
            'email' => ['required' => true, 'type' => 'string', 'email' => true, 'max' => 190, 'label' => 'ایمیل'],
            'password' => ['required' => true, 'type' => 'string', 'max' => 200, 'label' => 'رمز عبور'],
        ]);
        $ip = $r->ip();
        $wait = RateLimiter::retryAfter($ip);
        if ($wait > 0) {
            throw new HttpException(429, 'تلاش‌های ناموفق زیاد بود؛ کمی بعد دوباره امتحان کن', [], ['Retry-After' => (string)$wait]);
        }
        $admin = Auth::attempt($in['email'], $in['password']);
        if ($admin === null) {
            RateLimiter::fail($ip);
            throw new HttpException(401, 'ایمیل یا رمز اشتباه است');
        }
        RateLimiter::clear($ip);
        Auth::login($admin);
        Response::json(['admin' => ['id' => (int)$admin['id'], 'email' => $admin['email']], 'csrfToken' => Csrf::token()]);
    }

    public function me(Request $r, array $p): void
    {
        $a = Auth::admin();
        Response::json(['admin' => ['id' => (int)$a['id'], 'email' => $a['email']], 'csrfToken' => Csrf::token()]);
    }

    public function logout(Request $r, array $p): void
    {
        Auth::logout();
        Response::noContent();
    }

    public function changePassword(Request $r, array $p): void
    {
        $a = Auth::admin();
        $in = Validator::make($r->json(), [
            'currentPassword' => ['required' => true, 'type' => 'string', 'max' => 200, 'label' => 'رمز فعلی'],
            'newPassword' => ['required' => true, 'type' => 'string', 'min' => 10, 'max' => 200, 'label' => 'رمز جدید'],
        ]);
        if (!password_verify($in['currentPassword'], $a['password_hash'])) {
            throw new HttpException(422, 'داده‌ی نامعتبر', ['currentPassword' => 'رمز فعلی اشتباه است']);
        }
        if ($in['newPassword'] === $in['currentPassword']) {
            throw new HttpException(422, 'داده‌ی نامعتبر', ['newPassword' => 'رمز جدید باید با رمز فعلی فرق کند']);
        }
        AdminRepository::setPassword((int)$a['id'], Auth::hash($in['newPassword']));
        session_regenerate_id(true);
        Response::noContent();
    }
}
