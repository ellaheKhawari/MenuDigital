<?php
// cron روزانه: php api/bin/backup.php  → storage/backups/db-YYYYmmdd-HHMM.sql.gz (۱۴ نسخه‌ی آخر)
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../src/bootstrap.php';

use App\Core\{Config, Db};

$pdo = Db::pdo();
$sql = "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n";
foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $t) {
    $sql .= "DROP TABLE IF EXISTS `$t`;\n" . $pdo->query("SHOW CREATE TABLE `$t`")->fetch(PDO::FETCH_NUM)[1] . ";\n";
    foreach ($pdo->query("SELECT * FROM `$t`", PDO::FETCH_ASSOC) as $row) {
        $vals = array_map(static fn($v) => $v === null ? 'NULL' : $pdo->quote((string)$v), $row);
        $sql .= "INSERT INTO `$t` VALUES (" . implode(',', $vals) . ");\n";
    }
}
$dir = Config::storagePath('backups');
if (!is_dir($dir)) mkdir($dir, 0700, true);
file_put_contents($dir . '/db-' . gmdate('Ymd-Hi') . '.sql.gz', gzencode($sql . "SET FOREIGN_KEY_CHECKS=1;\n", 9));
$files = glob($dir . '/db-*.sql.gz') ?: [];
sort($files);
foreach (array_slice($files, 0, max(0, count($files) - 14)) as $old) unlink($old);
echo "backup ok\n";
