<?php

class PaketController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /** GET /api/paket - publik, dipakai frontend/customer/paket.html */
    public function index(): void
    {
        $stmt = $this->pdo->query('SELECT * FROM paket ORDER BY harga_paket ASC');
        Response::success('OK', ['paket' => $stmt->fetchAll()]);
    }

    /** GET /api/paket/{id} - publik */
    public function show(array $params): void
    {
        $id = (int) ($params['id'] ?? 0);
        $stmt = $this->pdo->prepare('SELECT * FROM paket WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Paket tidak ditemukan.', 404);
        }

        Response::success('OK', ['paket' => $row]);
    }

    /** POST /api/paket - admin */
    public function store(): void
    {
        Session::requireLogin('admin');
        $body = Request::body();
        $data = $this->validate($body);

        $stmt = $this->pdo->prepare(
            'INSERT INTO paket (nama, jenis, deskripsi, harga_paket, periode, durasi, estimasi_antar,
             menu_berganti, benefits, gratis_ongkir, konsultasi_menu, prioritas_pengiriman, status)
             VALUES (:nama, :jenis, :deskripsi, :harga_paket, :periode, :durasi, :estimasi_antar,
             :menu_berganti, :benefits, :gratis_ongkir, :konsultasi_menu, :prioritas_pengiriman, :status)'
        );
        $stmt->execute($data);

        Response::success('Paket berhasil ditambahkan.', ['id' => (int) $this->pdo->lastInsertId()], 201);
    }

    /** PUT /api/paket/{id} - admin */
    public function update(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);
        $body = Request::body();
        $data = $this->validate($body);
        $data[':id'] = $id;

        $cek = $this->pdo->prepare('SELECT id FROM paket WHERE id = :id');
        $cek->execute([':id' => $id]);

        if (!$cek->fetch()) {
            Response::error('Paket tidak ditemukan.', 404);
        }

        $stmt = $this->pdo->prepare(
            'UPDATE paket SET nama = :nama, jenis = :jenis, deskripsi = :deskripsi, harga_paket = :harga_paket,
             periode = :periode, durasi = :durasi, estimasi_antar = :estimasi_antar,
             menu_berganti = :menu_berganti, benefits = :benefits, gratis_ongkir = :gratis_ongkir,
             konsultasi_menu = :konsultasi_menu, prioritas_pengiriman = :prioritas_pengiriman,
             status = :status WHERE id = :id'
        );
        $stmt->execute($data);

        Response::success('Paket berhasil diperbarui.');
    }

    /** DELETE /api/paket/{id} - admin */
    public function destroy(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);

        $stmt = $this->pdo->prepare('DELETE FROM paket WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Paket tidak ditemukan.', 404);
        }

        Response::success('Paket berhasil dihapus.');
    }

    private function validate(array $body): array
    {
        $nama = trim((string) ($body['nama'] ?? ''));
        $jenis = trim((string) ($body['jenis'] ?? ''));
        $deskripsi = trim((string) ($body['deskripsi'] ?? ''));
        $harga = $body['harga_paket'] ?? null;
        $periode = trim((string) ($body['periode'] ?? ''));
        $durasi = trim((string) ($body['durasi'] ?? ''));
        $estimasiAntar = trim((string) ($body['estimasi_antar'] ?? ''));
        $menuBerganti = trim((string) ($body['menu_berganti'] ?? ''));
        $benefits = trim((string) ($body['benefits'] ?? ''));
        $gratisOngkir = !empty($body['gratis_ongkir']) ? 1 : 0;
        $konsultasiMenu = !empty($body['konsultasi_menu']) ? 1 : 0;
        $prioritasPengiriman = !empty($body['prioritas_pengiriman']) ? 1 : 0;
        $status = $body['status'] ?? 'aktif';

        if ($nama === '' || !is_numeric($harga) || (float) $harga < 0) {
            Response::error('Nama paket dan harga (angka positif) wajib diisi.', 422);
        }

        if (!in_array($status, ['aktif', 'nonaktif'], true)) {
            $status = 'aktif';
        }

        return [
            ':nama' => $nama,
            ':jenis' => $jenis !== '' ? $jenis : null,
            ':deskripsi' => $deskripsi,
            ':harga_paket' => (float) $harga,
            ':periode' => $periode,
            ':durasi' => $durasi,
            ':estimasi_antar' => $estimasiAntar,
            ':menu_berganti' => $menuBerganti,
            ':benefits' => $benefits,
            ':gratis_ongkir' => $gratisOngkir,
            ':konsultasi_menu' => $konsultasiMenu,
            ':prioritas_pengiriman' => $prioritasPengiriman,
            ':status' => $status,
        ];
    }
}
