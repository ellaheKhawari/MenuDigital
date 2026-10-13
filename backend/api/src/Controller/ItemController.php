<?php
declare(strict_types=1);
namespace App\Controller;

use App\Core\{HttpException, Request, Response, Validator};
use App\Repository\{CategoryRepository, ItemRepository as Items};
use App\Service\ImageService;

final class ItemController
{
    private static function rules(bool $create): array
    {
        return [
            'categoryId' => ['required' => $create, 'type' => 'int', 'min' => 1, 'max' => 4294967295, 'label' => 'دسته'],
            'title' => ['required' => $create, 'type' => 'string', 'min' => 1, 'max' => 120, 'collapse' => true, 'label' => 'نام'],
            'description' => ['type' => 'string', 'max' => 500, 'nullable' => true, 'label' => 'توضیحات'],
            'price' => ['required' => $create, 'type' => 'int', 'min' => 1, 'max' => 99999999, 'label' => 'قیمت'],
            'image' => ['type' => 'string', 'nullable' => true, 'regex' => '/^[a-f0-9]{24}\.(webp|jpg)$/', 'label' => 'عکس'],
            'isAvailable' => ['type' => 'bool', 'label' => 'موجودی'],
            'isFeatured' => ['type' => 'bool', 'label' => 'پیشنهاد ویژه'],
        ];
    }

    private static function checkRefs(array $d): void
    {
        $e = [];
        if (isset($d['categoryId']) && !CategoryRepository::exists($d['categoryId'])) {
            $e['categoryId'] = 'دسته وجود ندارد';
        }
        if (!empty($d['image']) && !ImageService::exists($d['image'])) {
            $e['image'] = 'فایل عکس وجود ندارد';
        }
        if ($e) {
            throw new HttpException(422, 'داده‌ی نامعتبر', $e);
        }
    }

    private static function must(array $p): array
    {
        $row = Items::find((int)$p['id']);
        if ($row === null) {
            throw new HttpException(404, 'آیتم پیدا نشد');
        }
        return $row;
    }

    public function index(Request $r, array $p): void
    {
        $q = Validator::make($r->query, ['categoryId' => ['type' => 'int', 'min' => 1, 'max' => 4294967295, 'label' => 'دسته']]);
        Response::json(Items::all($q['categoryId'] ?? null));
    }

    public function show(Request $r, array $p): void { Response::json(Items::present(self::must($p))); }

    public function store(Request $r, array $p): void
    {
        $d = Validator::make($r->json(), self::rules(true));
        self::checkRefs($d);
        Response::json(Items::create($d), 201);
    }

    public function update(Request $r, array $p): void
    {
        $old = self::must($p);
        $d = Validator::make($r->json(), self::rules(false));
        if (!$d) {
            throw new HttpException(422, 'هیچ فیلدی برای تغییر ارسال نشد');
        }
        self::checkRefs($d);
        $res = Items::update((int)$old['id'], $d);
        if (array_key_exists('image', $d) && $old['image'] !== null && $old['image'] !== $d['image']) {
            ImageService::delete($old['image']); // فایل قدیمی بعد از موفقیت پاک می‌شه
        }
        Response::json($res);
    }

    public function availability(Request $r, array $p): void
    {
        $row = self::must($p);
        $d = Validator::make($r->json(), ['isAvailable' => ['required' => true, 'type' => 'bool', 'label' => 'موجودی']]);
        Response::json(Items::update((int)$row['id'], $d));
    }

    public function destroy(Request $r, array $p): void
    {
        Items::delete((int)self::must($p)['id']);
        Response::noContent();
    }

    public function reorder(Request $r, array $p): void
    {
        $d = Validator::make($r->json(), [
            'categoryId' => ['required' => true, 'type' => 'int', 'min' => 1, 'max' => 4294967295, 'label' => 'دسته'],
            'ids' => ['required' => true, 'type' => 'intlist', 'label' => 'ids'],
        ]);
        self::checkRefs(['categoryId' => $d['categoryId']]);
        Items::reorder($d['categoryId'], $d['ids']);
        Response::noContent();
    }
}
