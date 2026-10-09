<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(array $data, int $code = 200)
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $msg, int $code = 400)
{
    respond(['error' => $msg], $code);
}

// anything unexpected: log the detail, show the user nothing sensitive
set_exception_handler(function (Throwable $e) {
    error_log('[sakayph] ' . $e);
    respond(['error' => 'Server error'], 500);
});

function db(): PDO
{
    static $pdo = null;

    if ($pdo) {
        return $pdo;
    }

    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET time_zone = '" . DB_TIMEZONE . "'",
        ]
    );

    return $pdo;
}

// POST with a JSON body. Browsers can't send application/json from another
// site without permission, so this also blocks cross-site form attacks.
function json_body(): array
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        fail('POST required', 405);
    }

    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        fail('JSON required', 415);
    }

    $data = json_decode(file_get_contents('php://input') ?: '', true);

    if (!is_array($data)) {
        fail('Bad JSON', 400);
    }

    return $data;
}

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name('sakayph');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => !empty($_SERVER['HTTPS']),
    ]);
    session_start();
}

function require_staff(): int
{
    start_session();

    if (empty($_SESSION['staff_id'])) {
        fail('Please log in', 401);
    }

    return (int) $_SESSION['staff_id'];
}

// simple anti-spam: at most $max writes per minute per IP
function throttle(int $max = 40): void
{
    $ip = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', RATE_SALT);
    $pdo = db();

    $pdo->prepare(
        "INSERT INTO rate_limits (ip_hash, window_start, hits)
         VALUES (?, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00'), 1)
         ON DUPLICATE KEY UPDATE hits = hits + 1"
    )->execute([$ip]);

    $q = $pdo->prepare(
        "SELECT hits FROM rate_limits
         WHERE ip_hash = ? AND window_start = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:00')"
    );
    $q->execute([$ip]);

    if ((int) $q->fetchColumn() > $max) {
        fail('Too many requests. Please slow down.', 429);
    }

    if (random_int(1, 100) === 1) {
        $pdo->exec("DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL 1 HOUR");
    }
}
