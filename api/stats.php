<?php
// Government dashboard numbers (staff only).
// GET ?route=Toril  -> per-route counts + that route's searches per hour today
require __DIR__ . '/bootstrap.php';

require_staff();

$pdo = db();

$rows = $pdo->query(
    "SELECT route,
            CAST(SUM(type = 'search'   AND created_at >= NOW() - INTERVAL 10 MINUTE) AS UNSIGNED) AS m10,
            CAST(SUM(type = 'search'   AND created_at >= NOW() - INTERVAL 1 HOUR)    AS UNSIGNED) AS hr,
            CAST(SUM(type = 'search'   AND created_at >= CURDATE())                  AS UNSIGNED) AS s_today,
            CAST(SUM(type = 'boarding' AND created_at >= CURDATE())                  AS UNSIGNED) AS b_today
     FROM events
     WHERE created_at >= NOW() - INTERVAL 1 DAY
     GROUP BY route"
)->fetchAll();

foreach ($rows as &$r) {
    foreach (['m10', 'hr', 's_today', 'b_today'] as $k) {
        $r[$k] = (int) $r[$k];
    }
}
unset($r);

$route = substr((string) ($_GET['route'] ?? ''), 0, 60);

$q = $pdo->prepare(
    "SELECT HOUR(created_at) AS h, COUNT(*) AS n
     FROM events
     WHERE type = 'search' AND route = ? AND created_at >= CURDATE()
     GROUP BY h"
);
$q->execute([$route]);

$hours = [];

foreach ($q->fetchAll() as $h) {
    $hours[(string) $h['h']] = (int) $h['n'];
}

respond(['rows' => $rows, 'hours' => (object) $hours]);
