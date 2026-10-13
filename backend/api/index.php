<?php
declare(strict_types=1);
require __DIR__ . '/src/bootstrap.php';

use App\Core\{Request, Router};

$router = new Router();
(require __DIR__ . '/src/routes.php')($router);
$router->dispatch(new Request());
