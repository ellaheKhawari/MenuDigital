<?php
declare(strict_types=1);
namespace App\Repository;

use App\Core\{Db, HttpException};
use App\Service\ImageService;

final class ItemRepository
{
    public static function present(array $r): array
    {
        return [
            'id' => (int)$r['id'], 'categoryId' => (int)$r['category_id'], 'title' => $r['title'],
            'description' => $r['description'], 'price' => (int)$r['price'], 'image' => ImageService::url($r['image']),
            'isAvailable' => (bool)$r['is_available'], 'isFeatured' => (bool)$r['is_featured'],
        ];
    }

    public static function all(?int $categoryId): array
    {
        $sql = 'SELECT * FROM items' . ($categoryId ? ' WHERE category_id = ?' : '') . ' ORDER BY sort_order, id';
        return array_map([self::class, 'present'], Db::q($sql, $categoryId ? [$categoryId] : [])->fetchAll());
    }

    /** ردیف خام (image فقط نام فایل) */
    public static function find(int $id): ?array
    {
        return Db::q('SELECT * FROM items WHERE id = ?', [$id])->fetch() ?: null;
    }

    private static function nextOrder(int $categoryId): int
    {
        return (int)Db::q('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM items WHERE category_id = ?', [$categoryId])->fetchColumn();
    }

    public static function create(array $d): array
    {
        Db::q('INSERT INTO items (category_id, title, description, price, image, is_available, is_featured, sort_order) VALUES (?,?,?,?,?,?,?,?)', [
            $d['categoryId'], $d['title'], $d['description'] ?? null, $d['price'], $d['image'] ?? null,
            (int)($d['isAvailable'] ?? true), (int)($d['isFeatured'] ?? false), self::nextOrder($d['categoryId']),
        ]);
        return self::present(self::find((int)Db::pdo()->lastInsertId()));
    }

    public static function update(int $id, array $d): array
    {
        $map = ['title' => 'title', 'description' => 'description', 'price' => 'price', 'image' => 'image'];
        $set = [];
        $args = [];
        foreach ($map as $k => $col) {
            if (array_key_exists($k, $d)) { $set[] = "$col = ?"; $args[] = $d[$k]; }
        }
        foreach (['isAvailable' => 'is_available', 'isFeatured' => 'is_featured'] as $k => $col) {
            if (array_key_exists($k, $d)) { $set[] = "$col = ?"; $args[] = (int)$d[$k]; }
        }
        if (array_key_exists('categoryId', $d)) {
            $set[] = 'category_id = ?'; $args[] = $d['categoryId'];
            $set[] = 'sort_order = ?'; $args[] = self::nextOrder($d['categoryId']);
        }
        $args[] = $id;
        Db::q('UPDATE items SET ' . implode(', ', $set) . ' WHERE id = ?', $args);
        return self::present(self::find($id));
    }

    public static function delete(int $id): void
    {
        $file = self::find($id)['image'] ?? null;
        Db::transaction(fn() => Db::q('DELETE FROM items WHERE id = ?', [$id]));
        ImageService::delete($file);
    }

    public static function reorder(int $categoryId, array $ids): void
    {
        $all = array_map('intval', Db::q('SELECT id FROM items WHERE category_id = ?', [$categoryId])->fetchAll(\PDO::FETCH_COLUMN));
        $a = $ids; $b = $all; sort($a); sort($b);
        if ($a !== $b) {
            throw new HttpException(422, 'داده‌ی نامعتبر', ['ids' => 'فهرست باید دقیقاً شامل همه‌ی آیتم‌های این دسته بدون تکرار باشد']);
        }
        Db::transaction(function () use ($ids, $categoryId) {
            foreach ($ids as $i => $id) {
                Db::q('UPDATE items SET sort_order = ? WHERE id = ? AND category_id = ?', [$i + 1, $id, $categoryId]);
            }
        });
    }
}
