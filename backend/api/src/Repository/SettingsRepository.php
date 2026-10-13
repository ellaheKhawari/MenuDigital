<?php
declare(strict_types=1);
namespace App\Repository;

use App\Core\Db;
use App\Service\ImageService;

final class SettingsRepository
{
    private const COLS = ['name' => 'name', 'phone' => 'phone', 'address' => 'address', 'instagram' => 'instagram',
        'workingHours' => 'working_hours', 'logo' => 'logo', 'themeColor' => 'theme_color'];

    public static function raw(): array
    {
        $r = Db::q('SELECT * FROM settings WHERE id = 1')->fetch();
        if (!$r) {
            Db::q('INSERT INTO settings (id) VALUES (1)');
            $r = Db::q('SELECT * FROM settings WHERE id = 1')->fetch();
        }
        return $r;
    }

    public static function present(array $r): array
    {
        return ['name' => $r['name'], 'phone' => $r['phone'], 'address' => $r['address'], 'instagram' => $r['instagram'],
            'workingHours' => $r['working_hours'], 'logo' => ImageService::url($r['logo']), 'themeColor' => $r['theme_color']];
    }

    public static function update(array $d): array
    {
        $set = [];
        $args = [];
        foreach (self::COLS as $k => $col) {
            if (array_key_exists($k, $d)) { $set[] = "$col = ?"; $args[] = $d[$k]; }
        }
        if ($set) {
            Db::q('UPDATE settings SET ' . implode(', ', $set) . ' WHERE id = 1', $args);
        }
        return self::present(self::raw());
    }
}
