<?php
declare(strict_types=1);
namespace App\Controller;

use App\Core\{HttpException, Request, Response};
use App\Service\ImageService;

final class UploadController
{
    public function store(Request $r, array $p): void
    {
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0 && !$_FILES && !$_POST) {
            throw new HttpException(413, 'حجم عکس زیاد است (حداکثر ۵ مگابایت)'); // post_max_size رد شده
        }
        $type = $_POST['type'] ?? '';
        if (!in_array($type, ['item', 'logo'], true)) {
            throw new HttpException(422, 'داده‌ی نامعتبر', ['type' => 'نوع باید item یا logo باشد']);
        }
        if (!isset($_FILES['file']) || !is_array($_FILES['file']) || is_array($_FILES['file']['error'])) {
            throw new HttpException(422, 'داده‌ی نامعتبر', ['file' => 'فایل الزامی است']);
        }
        Response::json(['image' => ImageService::store($_FILES['file'], $type)], 201);
    }
}
