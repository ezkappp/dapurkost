<?php

class AuthController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * POST /api/auth/login
     * body: { identifier (username/email), password, table? } - table default 'pelanggan'
     */
    public function login(): void
    {
        $body = Request::body();
        $identifier = trim((string) ($body['identifier'] ?? $body['username'] ?? $body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $table = in_array($body['table'] ?? '', ['admin', 'pelanggan'], true) ? $body['table'] : 'pelanggan';

        if ($identifier === '' || $password === '') {
            Response::error('Email/username dan password wajib diisi.', 422);
        }

        $auth = new Auth($this->pdo);

        try {
            $result = $auth->authenticate($identifier, $password, $table);
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 422);

            return;
        }

        if (!$result['success']) {
            Response::error($result['message'], 401);
        }

        Session::login($result['user']);
        Response::success('Login berhasil.', ['user' => $result['user']]);
    }

    /** POST /api/auth/logout */
    public function logout(): void
    {
        Session::logout();
        Response::success('Logout berhasil.');
    }

    /** GET /api/auth/me */
    public function me(): void
    {
        $user = Session::user();

        if (!$user) {
            Response::error('Belum login.', 401);
        }

        Response::success('OK', ['user' => $user]);
    }

    /**
     * POST /api/auth/register
     * body: { nama, username, email, password, confirm_password, table?, no_hp?, alamat? }
     * table default 'pelanggan' (dipakai frontend/customer/register.html).
     * table='admin' dipakai frontend/admin/register.html.
     */
    public function register(): void
    {
        $body = Request::body();
        $table = in_array($body['table'] ?? '', ['admin', 'pelanggan'], true) ? $body['table'] : 'pelanggan';

        $nama = trim((string) ($body['nama'] ?? ''));
        $username = trim((string) ($body['username'] ?? ''));
        $email = trim((string) ($body['email'] ?? ''));
        $password = (string) ($body['password'] ?? '');
        $confirmPassword = (string) ($body['confirm_password'] ?? $password);

        if ($nama === '' || $username === '' || $email === '') {
            Response::error('Nama, username, dan email wajib diisi.', 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Format email tidak valid.', 422);
        }

        if (strlen($password) < 6) {
            Response::error('Password minimal 6 karakter.', 422);
        }

        if ($password !== $confirmPassword) {
            Response::error('Konfirmasi password tidak sama.', 422);
        }

        $auth = new Auth($this->pdo);

        $result = $auth->register([
            'nama' => $nama,
            'username' => $username,
            'email' => $email,
            'password' => $password,
            'no_hp' => $body['no_hp'] ?? null,
            'alamat' => $body['alamat'] ?? null,
            'role' => $body['role'] ?? 'admin',
        ], $table);

        if (!$result['success']) {
            Response::error($result['message'], 409);
        }

        Response::success('Registrasi berhasil, silakan login.', ['id' => $result['id']], 201);
    }
}
