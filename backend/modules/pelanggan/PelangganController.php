<?php

class PelangganController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /** GET /api/pelanggan - admin */
    public function index(): void
    {
        Session::requireLogin('admin');
        $stmt = $this->pdo->query(
            'SELECT id, nama, username, email, no_hp, alamat, created_at FROM pelanggan ORDER BY created_at DESC'
        );
        Response::success('OK', ['pelanggan' => $stmt->fetchAll()]);
    }

    /** GET /api/pelanggan/{id} - admin, atau pelanggan yang bersangkutan */
    public function show(array $params): void
    {
        $user = Session::requireLogin();
        $id = (int) ($params['id'] ?? 0);

        if ($user['table'] === 'pelanggan' && (int) $user['id'] !== $id) {
            Response::error('Akses ditolak.', 403);
        }

        $stmt = $this->pdo->prepare(
            'SELECT id, nama, username, email, no_hp, alamat, created_at FROM pelanggan WHERE id = :id LIMIT 1'
        );
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Pelanggan tidak ditemukan.', 404);
        }

        Response::success('OK', ['pelanggan' => $row]);
    }

    /** PUT /api/pelanggan/{id} - admin, atau pelanggan yang bersangkutan (edit profil) */
    public function update(array $params): void
    {
        $user = Session::requireLogin();
        $id = (int) ($params['id'] ?? 0);

        if ($user['table'] === 'pelanggan' && (int) $user['id'] !== $id) {
            Response::error('Akses ditolak.', 403);
        }

        $body = Request::body();
        $nama = trim((string) ($body['nama'] ?? ''));
        $noHp = trim((string) ($body['no_hp'] ?? ''));
        $alamat = trim((string) ($body['alamat'] ?? ''));

        if ($nama === '') {
            Response::error('Nama wajib diisi.', 422);
        }

        $stmt = $this->pdo->prepare(
            'UPDATE pelanggan SET nama = :nama, no_hp = :no_hp, alamat = :alamat WHERE id = :id'
        );
        $stmt->execute([':nama' => $nama, ':no_hp' => $noHp, ':alamat' => $alamat, ':id' => $id]);

        Response::success('Data pelanggan berhasil diperbarui.');
    }

    /** DELETE /api/pelanggan/{id} - admin */
    public function destroy(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);

        $stmt = $this->pdo->prepare('DELETE FROM pelanggan WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Pelanggan tidak ditemukan.', 404);
        }

        Response::success('Pelanggan berhasil dihapus.');
    }
}
