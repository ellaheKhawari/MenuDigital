<?php
declare(strict_types=1);
namespace App\Core;

use PDO;

final class Db
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo !== null) {
            return self::$pdo;
        }
        $d = (array)Config::get('db');
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $d['host'], $d['name']);
        return self::$pdo = new PDO($dsn, (string)$d['user'], (string)$d['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET time_zone = '+00:00'",
        ]);
    }

    public static function q(string $sql, array $args = []): \PDOStatement
    {
        $st = self::pdo()->prepare($sql);
        $st->execute($args);
        return $st;
    }

    public static function transaction(callable $fn): mixed
    {
        $p = self::pdo();
        $p->beginTransaction();
        try {
            $r = $fn($p);
            $p->commit();
            return $r;
        } catch (\Throwable $e) {
            if ($p->inTransaction()) {
                $p->rollBack();
            }
            throw $e;
        }
    }
}
