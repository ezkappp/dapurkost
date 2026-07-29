<?php

class Auth
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Login pakai username ATAU email (satu field "identifier"), sesuai
     * form frontend yang memakai field email.
     */
    public function authenticate(string $identifier, string $password, string $table = 'pelanggan'): array
    {
        $allowedTables = ['admin', 'pelanggan'];

        if (!in_array($table, $allowedTables, true)) {
            throw new InvalidArgumentException('Table tidak valid untuk autentikasi.');
        }

        $sql = "SELECT id, nama, username, email, password_hash FROM {$table}
                WHERE username = :identifier1 OR email = :identifier2 LIMIT 1";
        $statement = $this->pdo->prepare($sql);
        $statement->execute([':identifier1' => $identifier, ':identifier2' => $identifier]);
        $user = $statement->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Akun tidak ditemukan.',
            ];
        }

        if (!password_verify($password, $user['password_hash'])) {
            return [
                'success' => false,
                'message' => 'Password salah.',
            ];
        }

        return [
            'success' => true,
            'message' => 'Autentikasi berhasil.',
            'user' => [
                'id' => (int) $user['id'],
                'nama' => $user['nama'],
                'username' => $user['username'],
                'email' => $user['email'],
                'table' => $table,
            ],
        ];
    }

    /**
     * Registrasi akun baru. $table menentukan target tabel ('admin' atau
     * 'pelanggan'). $data minimal berisi: nama, username, email, password.
     * Untuk pelanggan boleh tambahkan no_hp, alamat. Untuk admin boleh
     * tambahkan role ('admin'/'super_admin', default 'admin').
     */
    public function register(array $data, string $table = 'pelanggan'): array
    {
        $allowedTables = ['admin', 'pelanggan'];

        if (!in_array($table, $allowedTables, true)) {
            throw new InvalidArgumentException('Table tidak valid untuk registrasi.');
        }

        $cek = $this->pdo->prepare("SELECT id FROM {$table} WHERE username = :username OR email = :email LIMIT 1");
        $cek->execute([':username' => $data['username'], ':email' => $data['email']]);

        if ($cek->fetch()) {
            return [
                'success' => false,
                'message' => 'Username atau email sudah terdaftar.',
            ];
        }

        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

        if ($table === 'admin') {
            $role = in_array($data['role'] ?? 'admin', ['admin', 'super_admin'], true) ? $data['role'] : 'admin';

            $stmt = $this->pdo->prepare(
                'INSERT INTO admin (nama, username, email, password_hash, role)
                 VALUES (:nama, :username, :email, :password_hash, :role)'
            );
            $stmt->execute([
                ':nama' => $data['nama'],
                ':username' => $data['username'],
                ':email' => $data['email'],
                ':password_hash' => $passwordHash,
                ':role' => $role,
            ]);
        } else {
            $stmt = $this->pdo->prepare(
                'INSERT INTO pelanggan (nama, username, email, password_hash, no_hp, alamat)
                 VALUES (:nama, :username, :email, :password_hash, :no_hp, :alamat)'
            );
            $stmt->execute([
                ':nama' => $data['nama'],
                ':username' => $data['username'],
                ':email' => $data['email'],
                ':password_hash' => $passwordHash,
                ':no_hp' => $data['no_hp'] ?? null,
                ':alamat' => $data['alamat'] ?? null,
            ]);
        }

        return [
            'success' => true,
            'id' => (int) $this->pdo->lastInsertId(),
        ];
    }
}
