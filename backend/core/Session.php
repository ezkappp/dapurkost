<?php

class Session
{
    private const NAME = 'dapurkost_session';

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        session_name(self::NAME);
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }

    public static function login(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user'] = $user;
    }

    public static function logout(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(self::NAME, '', time() - 42000, $params['path']);
        }

        session_destroy();
    }

    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    /**
     * Wajibkan user sudah login. Jika $table diisi ('admin'/'pelanggan'),
     * user harus login dari tabel tersebut, kalau tidak akses ditolak.
     */
    public static function requireLogin(?string $table = null): array
    {
        $user = self::user();

        if (!$user) {
            Response::error('Anda harus login terlebih dahulu.', 401);
        }

        if ($table !== null && ($user['table'] ?? null) !== $table) {
            Response::error('Akses ditolak untuk peran ini.', 403);
        }

        return $user;
    }
}
