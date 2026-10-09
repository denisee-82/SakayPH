<?php
// Staff-only data tools used by the dashboard buttons.
//   POST {action:"demo",  events:[{type, route, ts(ms)}, ...]}
//   POST {action:"clear"}
require __DIR__ . '/bootstrap.php';

require_staff();

$in     = json_body();
$action = $in['action'] ?? '';
$pdo    = db();

if ($action === 'clear') {
    $pdo->exec('TRUNCATE TABLE events');
    respond(['ok' => true]);
}

if ($action === 'demo') {
    $events = $in['events'] ?? [];

    if (!is_array($events) || count($events) > 20000) {
        fail('Too many events', 422);
    }

    $now   = time();
    $clean = [];

    foreach ($events as $e) {
        $type  = $e['type'] ?? '';
        $route = trim((string) ($e['route'] ?? ''));
        $ts    = (int) floor(((float) ($e['ts'] ?? 0)) / 1000);

        if (!in_array($type, ['search', 'boarding'], true)) continue;
        if ($route === '' || mb_strlen($route) > 60) continue;
        if ($ts < $now - 3 * 86400 || $ts > $now + 60) continue;

        $clean[] = [$type, $route, $ts];
    }

    $pdo->beginTransaction();

    foreach (array_chunk($clean, 500) as $chunk) {
        $ph   = implode(',', array_fill(0, count($chunk), '(?, ?, FROM_UNIXTIME(CAST(? AS UNSIGNED)))'));
        $args = [];

        foreach ($chunk as $c) {
            array_push($args, $c[0], $c[1], $c[2]);
        }

        $pdo->prepare("INSERT INTO events (type, route, created_at) VALUES $ph")->execute($args);
    }

    $pdo->commit();
    respond(['ok' => true, 'inserted' => count($clean)]);
}

fail('Unknown action', 400);
