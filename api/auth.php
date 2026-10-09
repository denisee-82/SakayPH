<?php
// Staff accounts.
//   GET                                     -> {loggedIn, email}
//   POST {action:"login",  email, password}
//   POST {action:"signup", email, password, name, office, invite}
//   POST {action:"logout"}
require __DIR__ . '/bootstrap.php';

start_session();

function sign_in(int $id, string $email): void
{
    session_regenerate_id(true);
    $_SESSION['staff_id']    = $id;
    $_SESSION['staff_email'] = $email;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    respond([
        'loggedIn' => !empty($_SESSION['staff_id']),
        'email'    => $_SESSION['staff_email'] ?? null,
    ]);
}

$in     = json_body();
$action = $in['action'] ?? '';
$pdo    = db();

if ($action === 'logout') {
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 3600, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }

    session_destroy();
    respond(['ok' => true]);
}

$email = strtolower(trim((string) ($in['email'] ?? '')));
$pw    = (string) ($in['password'] ?? '');

if ($action === 'signup') {
    if (STAFF_INVITE_CODE === '') {
        fail('Sign-up is closed. Ask the administrator for an account.', 403);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
        fail('Enter a valid email.', 422);
    }

    if (strlen($pw) < 8) {
        fail('Password must be 8+ characters.', 422);
    }

    if (!hash_equals(STAFF_INVITE_CODE, (string) ($in['invite'] ?? ''))) {
        usleep(500000);
        fail('Wrong invite code.', 403);
    }

    try {
        $pdo->prepare('INSERT INTO staff (email, password_hash, name, office) VALUES (?, ?, ?, ?)')
            ->execute([
                $email,
                password_hash($pw, PASSWORD_DEFAULT),
                mb_substr(trim((string) ($in['name'] ?? '')), 0, 120),
                mb_substr(trim((string) ($in['office'] ?? '')), 0, 120),
            ]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            fail('Email already registered.', 409);
        }
        throw $e;
    }

    sign_in((int) $pdo->lastInsertId(), $email);
    respond(['ok' => true]);
}

if ($action === 'login') {
    $q = $pdo->prepare('SELECT id, password_hash FROM staff WHERE email = ?');
    $q->execute([$email]);
    $row = $q->fetch();

    if ($row) {
        $ok = password_verify($pw, $row['password_hash']);
    } else {
        password_hash($pw, PASSWORD_DEFAULT);   // same delay whether or not the email exists
        $ok = false;
    }

    if (!$ok) {
        usleep(500000);
        fail('Wrong email or password.', 401);
    }

    sign_in((int) $row['id'], $email);
    respond(['ok' => true]);
}

fail('Unknown action', 400);
