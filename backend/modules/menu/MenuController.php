<?php

class MenuController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /** GET /api/menu - publik, dipakai frontend/customer/menu.html */
    public function index(): void
    {
        $stmt = $this->pdo->query('SELECT * FROM menu ORDER BY created_at DESC');
        Response::success('OK', ['menu' => $stmt->fetchAll()]);
    }

    /** GET /api/menu/{id} - publik */
    public function show(array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $stmt = $this->pdo->prepare('SELECT * FROM menu WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Menu tidak ditemukan.', 404);
        }

        Response::success('OK', ['menu' => $row]);
    }

    /** POST /api/menu - admin */
    public function store(): void
    {
        Session::requireLogin('admin');
        $body = Request::body();
        [$nama, $deskripsi, $harga, $kategori, $foto, $status] = $this->validate($body);

        $stmt = $this->pdo->prepare(
            'INSERT INTO menu (nama, deskripsi, harga, kategori, foto, status)
             VALUES (:nama, :deskripsi, :harga, :kategori, :foto, :status)'
        );
        $stmt->execute([
            ':nama' => $nama,
            ':deskripsi' => $deskripsi,
            ':harga' => $harga,
            ':kategori' => $kategori,
            ':foto' => $foto,
            ':status' => $status,
        ]);

        Response::success('Menu berhasil ditambahkan.', ['id' => (int) $this->pdo->lastInsertId()], 201);
    }

    /** PUT /api/menu/{id} - admin */
    public function update(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);
        $body = Request::body();
        [$nama, $deskripsi, $harga, $kategori, $foto, $status] = $this->validate($body);

        $cek = $this->pdo->prepare('SELECT id FROM menu WHERE id = :id');
        $cek->execute([':id' => $id]);

        if (!$cek->fetch()) {
            Response::error('Menu tidak ditemukan.', 404);
        }

        $stmt = $this->pdo->prepare(
            'UPDATE menu SET nama = :nama, deskripsi = :deskripsi, harga = :harga,
             kategori = :kategori, foto = :foto, status = :status WHERE id = :id'
        );
        $stmt->execute([
            ':nama' => $nama,
            ':deskripsi' => $deskripsi,
            ':harga' => $harga,
            ':kategori' => $kategori,
            ':foto' => $foto,
            ':status' => $status,
            ':id' => $id,
        ]);

        Response::success('Menu berhasil diperbarui.');
    }

    /** DELETE /api/menu/{id} - admin */
    public function destroy(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);

        $stmt = $this->pdo->prepare('DELETE FROM menu WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Menu tidak ditemukan.', 404);
        }

        Response::success('Menu berhasil dihapus.');
    }

    private function validate(array $body): array
    {
        $nama = trim((string) ($body['nama'] ?? ''));
        $deskripsi = trim((string) ($body['deskripsi'] ?? ''));
        $harga = $body['harga'] ?? null;
        $kategori = trim((string) ($body['kategori'] ?? ''));
        $foto = trim((string) ($body['foto'] ?? ''));
        $status = $body['status'] ?? 'aktif';

        if ($nama === '' || !is_numeric($harga) || (float) $harga < 0) {
            Response::error('Nama menu dan harga (angka positif) wajib diisi.', 422);
        }

        if (!in_array($status, ['aktif', 'nonaktif'], true)) {
            $status = 'aktif';
        }

        return [$nama, $deskripsi, (float) $harga, $kategori, $foto, $status];
    }
}
