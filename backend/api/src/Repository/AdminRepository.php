<?php
declare(strict_types=1);
namespace App\Repository;

use App\Core\Db;

final class AdminRepository
{
    public static function findByEmail(string $email): ?array
    {
        return Db::q('SELECT * FROM admins WHERE email = ?', [$email])->fetch() ?: null;
    }

    public static function find(int $id): ?array
    {
        return Db::q('SELECT * FROM admins WHERE id = ?', [$id])->fetch() ?: null;
    }

    public static function setPassword(int $id, string $hash): void
    {
        Db::q('UPDATE admins SET password_hash = ? WHERE id = ?', [$hash, $id]);
    }
}
