<?php
declare(strict_types=1);
namespace App\Repository;

use App\Core\{Db, HttpException};
use App\Service\ImageService;

final class CategoryRepository
{
    private static function present(array $r): array
    {
        return ['id' => (int)$r['id'], 'title' => $r['title'], 'isActive' => (bool)$r['is_active'], 'itemCount' => (int)($r['item_count'] ?? 0)];
    }

    public static function all(): array
    {
        $rows = Db::q('SELECT c.*, COUNT(i.id) AS item_count FROM categories c LEFT JOIN items i ON i.category_id = c.id GROUP BY c.id ORDER BY c.sort_order, c.id')->fetchAll();
        return array_map([self::class, 'present'], $rows);
    }

    public static function find(int $id): ?array
    {
        $r = Db::q('SELECT c.*, (SELECT COUNT(*) FROM items WHERE category_id = c.id) AS item_count FROM categories c WHERE c.id = ?', [$id])->fetch();
        return $r ? self::present($r) : null;
    }

    public static function exists(int $id): bool
    {
        return (bool)Db::q('SELECT 1 FROM categories WHERE id = ?', [$id])->fetchColumn();
    }

    public static function create(string $title, bool $active): array
    {
        $order = (int)Db::q('SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories')->fetchColumn();
        Db::q('INSERT INTO categories (title, is_active, sort_order) VALUES (?, ?, ?)', [$title, (int)$active, $order]);
        return self::find((int)Db::pdo()->lastInsertId());
    }

    public static function update(int $id, array $d): array
    {
        $set = [];
        $args = [];
        if (array_key_exists('title', $d)) { $set[] = 'title = ?'; $args[] = $d['title']; }
        if (array_key_exists('isActive', $d)) { $set[] = 'is_active = ?'; $args[] = (int)$d['isActive']; }
        $args[] = $id;
        Db::q('UPDATE categories SET ' . implode(', ', $set) . ' WHERE id = ?', $args);
        return self::find($id);
    }

    public static function delete(int $id): void
    {
        $files = Db::q('SELECT image FROM items WHERE category_id = ? AND image IS NOT NULL', [$id])->fetchAll(\PDO::FETCH_COLUMN);
        Db::transaction(fn() => Db::q('DELETE FROM categories WHERE id = ?', [$id]));
        foreach ($files as $f) { // بعد از commit
            ImageService::delete($f);
        }
    }

    public static function reorder(array $ids): void
    {
        $all = array_map('intval', Db::q('SELECT id FROM categories')->fetchAll(\PDO::FETCH_COLUMN));
        $a = $ids; $b = $all; sort($a); sort($b);
        if ($a !== $b) {
            throw new HttpException(422, 'داده‌ی نامعتبر', ['ids' => 'فهرست باید دقیقاً شامل همه‌ی دسته‌ها بدون تکرار باشد']);
        }
        Db::transaction(function () use ($ids) {
            foreach ($ids as $i => $id) {
                Db::q('UPDATE categories SET sort_order = ? WHERE id = ?', [$i + 1, $id]);
            }
        });
    }
}
