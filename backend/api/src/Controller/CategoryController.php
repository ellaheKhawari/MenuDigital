<?php
declare(strict_types=1);
namespace App\Controller;

use App\Core\{HttpException, Request, Response, Validator};
use App\Repository\CategoryRepository as Cats;

final class CategoryController
{
    private static function rules(bool $create): array
    {
        return [
            'title' => ['required' => $create, 'type' => 'string', 'min' => 1, 'max' => 100, 'collapse' => true, 'label' => 'عنوان'],
            'isActive' => ['type' => 'bool', 'label' => 'وضعیت'],
        ];
    }

    private static function must(array $p): int
    {
        $id = (int)$p['id'];
        if (!Cats::exists($id)) {
            throw new HttpException(404, 'دسته پیدا نشد');
        }
        return $id;
    }

    public function index(Request $r, array $p): void { Response::json(Cats::all()); }

    public function store(Request $r, array $p): void
    {
        $d = Validator::make($r->json(), self::rules(true));
        Response::json(Cats::create($d['title'], $d['isActive'] ?? true), 201);
    }

    public function update(Request $r, array $p): void
    {
        $id = self::must($p);
        $d = Validator::make($r->json(), self::rules(false));
        if (!$d) {
            throw new HttpException(422, 'هیچ فیلدی برای تغییر ارسال نشد');
        }
        Response::json(Cats::update($id, $d));
    }

    public function destroy(Request $r, array $p): void
    {
        Cats::delete(self::must($p));
        Response::noContent();
    }

    public function reorder(Request $r, array $p): void
    {
        $d = Validator::make($r->json(), ['ids' => ['required' => true, 'type' => 'intlist', 'label' => 'ids']]);
        Cats::reorder($d['ids']);
        Response::noContent();
    }
}
