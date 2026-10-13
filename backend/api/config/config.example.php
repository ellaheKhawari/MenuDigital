<?php
declare(strict_types=1);
// کپی کن به config.php و مقادیر را پر کن. config.php نباید در گیت باشد.
return [
    'env' => 'dev', // dev | production
    'db' => ['host' => '127.0.0.1', 'name' => 'cafe_menu', 'user' => 'root', 'pass' => ''],
    'cookie_secure' => false, // در production حتماً true
    'allowed_origins' => ['http://localhost:5173'],
    // 'trusted_proxy_header' => 'HTTP_CF_CONNECTING_IP', // فقط پشت Cloudflare
    // 'paths' => ['uploads' => '/abs/path/uploads', 'storage' => '/abs/path/storage'],
];
