<?php
// Commuter page: how many searches per route (public, counts only).
require __DIR__ . '/bootstrap.php';

$rows = db()->query(
    "SELECT route,
            CAST(SUM(created_at >= NOW() - INTERVAL 10 MINUTE) AS UNSIGNED) AS m10,
            COUNT(*) AS hr
     FROM events
     WHERE type = 'search' AND created_at >= NOW() - INTERVAL 1 HOUR
     GROUP BY route"
)->fetchAll();

$out = [];

foreach ($rows as $r) {
    $out[$r['route']] = ['m10' => (int) $r['m10'], 'hr' => (int) $r['hr']];
}

respond(['routes' => (object) $out]);
