<?php
declare(strict_types=1);
namespace App\Controller;

use App\Core\{Db, Request, Response};
use App\Repository\SettingsRepository;
use App\Service\ImageService;

/** منوی زنده؛ هیچ کش یا ذخیره‌ی موقتی ندارد. */
final class PublicMenuController
{
    public function show(Request $r, array $p): void
    {
        $s = SettingsRepository::present(SettingsRepository::raw());
        $rows = Db::q('SELECT c.id AS cid, c.title AS ctitle, i.* FROM categories c JOIN items i ON i.category_id = c.id
                       WHERE c.is_active = 1 ORDER BY c.sort_order, c.id, i.sort_order, i.id')->fetchAll();
        $cats = [];
        foreach ($rows as $row) {
            $cid = (int)$row['cid'];
            $cats[$cid] ??= ['id' => $cid, 'title' => $row['ctitle'], 'items' => []];
            $img = $row['image'];
            $cats[$cid]['items'][] = [
                'id' => (int)$row['id'], 'title' => $row['title'], 'description' => $row['description'],
                'price' => (int)$row['price'], 'image' => ImageService::url($img),
                'thumb' => $img ? ImageService::url(ImageService::thumbName($img)) : null,
                'isAvailable' => (bool)$row['is_available'], 'isFeatured' => (bool)$row['is_featured'],
            ];
        }
        Response::json([
            'generatedAt' => gmdate('Y-m-d\TH:i:s\Z'),
            'settings' => $s,
            'categories' => array_values($cats),
        ]);
    }
}
