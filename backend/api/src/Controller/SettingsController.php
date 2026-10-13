<?php
declare(strict_types=1);
namespace App\Controller;

use App\Core\{HttpException, Request, Response, Validator};
use App\Repository\SettingsRepository as Settings;
use App\Service\ImageService;

final class SettingsController
{
    public function show(Request $r, array $p): void { Response::json(Settings::present(Settings::raw())); }

    public function update(Request $r, array $p): void
    {
        $d = Validator::make($r->json(), [
            'name' => ['type' => 'string', 'min' => 1, 'max' => 100, 'collapse' => true, 'label' => 'نام کافه'],
            'phone' => ['type' => 'string', 'nullable' => true, 'regex' => '/^[0-9+\-\s()]{5,20}$/', 'label' => 'تلفن'],
            'address' => ['type' => 'string', 'nullable' => true, 'max' => 255, 'label' => 'آدرس'],
            'instagram' => ['type' => 'string', 'nullable' => true, 'regex' => '/^[A-Za-z0-9._]{1,30}$/', 'label' => 'اینستاگرام'],
            'workingHours' => ['type' => 'string', 'nullable' => true, 'max' => 255, 'label' => 'ساعت کاری'],
            'logo' => ['type' => 'string', 'nullable' => true, 'regex' => '/^[a-f0-9]{24}\.(webp|jpg)$/', 'label' => 'لوگو'],
            'themeColor' => ['type' => 'string', 'regex' => '/^#[0-9a-fA-F]{6}$/', 'label' => 'رنگ برند'],
        ]);
        if (!empty($d['logo']) && !ImageService::exists($d['logo'])) {
            throw new HttpException(422, 'داده‌ی نامعتبر', ['logo' => 'فایل لوگو وجود ندارد']);
        }
        $old = Settings::raw()['logo'];
        $res = Settings::update($d);
        if (array_key_exists('logo', $d) && $old !== null && $old !== $d['logo']) {
            ImageService::delete($old);
        }
        Response::json($res);
    }
}
