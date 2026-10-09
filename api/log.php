<?php
// Commuter page: record one search or boarding tap.
// POST {"type":"search"|"boarding","route":"Toril"}
require __DIR__ . '/bootstrap.php';

$in    = json_body();
$type  = $in['type'] ?? '';
$route = trim((string) ($in['route'] ?? ''));

if (!in_array($type, ['search', 'boarding'], true)) {
    fail('Bad type', 422);
}

if ($route === '' || mb_strlen($route) > 60) {
    fail('Bad route', 422);
}

throttle();

db()->prepare('INSERT INTO events (type, route) VALUES (?, ?)')
    ->execute([$type, $route]);

respond(['ok' => true]);
