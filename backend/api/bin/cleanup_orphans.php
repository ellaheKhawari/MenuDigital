<?php
// cron هفتگی: php api/bin/cleanup_orphans.php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../src/bootstrap.php';

use App\Core\{Config, Db};
use App\Service\ImageService;

$used = [];
foreach (Db::q('SELECT image FROM items WHERE image IS NOT NULL UNION SELECT logo FROM settings WHERE logo IS NOT NULL')->fetchAll(PDO::FETCH_COLUMN) as $f) {
    $used[$f] = true;
    $used[ImageService::thumbName($f)] = true;
}
$dir = Config::uploadsPath();
$removed = 0;
foreach (scandir($dir) ?: [] as $f) {
    if (!preg_match('/^[a-f0-9]{24}(_t)?\.(webp|jpg)$/', $f) || isset($used[$f])) continue;
    if (filemtime("$dir/$f") < time() - 86400) { unlink("$dir/$f"); $removed++; }
}
$old = Db::q('DELETE FROM login_attempts WHERE created_at < (NOW() - INTERVAL 24 HOUR)')->rowCount();
echo "removed files: $removed, old login attempts: $old\n";
