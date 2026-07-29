<?php

class PesananController
{
    private PDO $pdo;

    private const STATUS_ALLOWED = ['menunggu_pembayaran', 'dibayar', 'diproses', 'selesai', 'dibatalkan'];

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /** GET /api/pesanan - admin: semua data, pelanggan: milik sendiri */
    public function index(): void
    {
        $user = Session::requireLogin();

        if ($user['table'] === 'admin') {
            $sql = 'SELECT p.*, pl.nama AS nama_pelanggan, pl.no_hp, pl.alamat, pk.nama AS nama_paket, m.nama AS nama_menu
                    FROM pesanan p
                    JOIN pelanggan pl ON pl.id = p.pelanggan_id
                    JOIN paket pk ON pk.id = p.paket_id
                    LEFT JOIN menu m ON m.id = p.menu_id
                    ORDER BY p.created_at DESC';
            $stmt = $this->pdo->query($sql);
        } else {
            $sql = 'SELECT p.*, pk.nama AS nama_paket, m.nama AS nama_menu
                    FROM pesanan p
                    JOIN paket pk ON pk.id = p.paket_id
                    LEFT JOIN menu m ON m.id = p.menu_id
                    WHERE p.pelanggan_id = :pid
                    ORDER BY p.created_at DESC';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':pid' => $user['id']]);
        }

        Response::success('OK', ['pesanan' => $stmt->fetchAll()]);
    }

    /** GET /api/pesanan/{id} */
    public function show(array $params): void
    {
        $user = Session::requireLogin();
        $id = (int) ($params['id'] ?? 0);

        $sql = 'SELECT p.*, pl.nama AS nama_pelanggan, pk.nama AS nama_paket, m.nama AS nama_menu
                FROM pesanan p
                JOIN pelanggan pl ON pl.id = p.pelanggan_id
                JOIN paket pk ON pk.id = p.paket_id
                LEFT JOIN menu m ON m.id = p.menu_id
                WHERE p.id = :id LIMIT 1';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) {
            Response::error('Pesanan tidak ditemukan.', 404);
        }

        if ($user['table'] === 'pelanggan' && (int) $row['pelanggan_id'] !== (int) $user['id']) {
            Response::error('Akses ditolak.', 403);
        }

        Response::success('OK', ['pesanan' => $row]);
    }

    /** POST /api/pesanan - pelanggan (checkout paket berlangganan) */
    public function store(): void
    {
        $user = Session::requireLogin('pelanggan');
        $body = Request::body();

        $paketId = (int) ($body['paket_id'] ?? 0);
        $menuId = (isset($body['menu_id']) && $body['menu_id'] !== '') ? (int) $body['menu_id'] : null;
        $jumlah = (int) ($body['jumlah'] ?? 1);
        $tanggalPesan = $body['tanggal_pesan'] ?? date('Y-m-d');

        if ($paketId <= 0 || $jumlah <= 0) {
            Response::error('Paket dan jumlah pesanan wajib valid.', 422);
        }

        $stmtPaket = $this->pdo->prepare("SELECT harga_paket FROM paket WHERE id = :id AND status = 'aktif' LIMIT 1");
        $stmtPaket->execute([':id' => $paketId]);
        $paket = $stmtPaket->fetch();

        if (!$paket) {
            Response::error('Paket tidak ditemukan atau tidak aktif.', 404);
        }

        $totalHarga = (float) $paket['harga_paket'] * $jumlah;

        $stmt = $this->pdo->prepare(
            "INSERT INTO pesanan (pelanggan_id, paket_id, menu_id, jumlah, total_harga, status, tanggal_pesan)
             VALUES (:pelanggan_id, :paket_id, :menu_id, :jumlah, :total_harga, 'menunggu_pembayaran', :tanggal_pesan)"
        );
        $stmt->execute([
            ':pelanggan_id' => $user['id'],
            ':paket_id' => $paketId,
            ':menu_id' => $menuId,
            ':jumlah' => $jumlah,
            ':total_harga' => $totalHarga,
            ':tanggal_pesan' => $tanggalPesan,
        ]);

        Response::success('Pesanan berhasil dibuat.', [
            'id' => (int) $this->pdo->lastInsertId(),
            'total_harga' => $totalHarga,
        ], 201);
    }

    /** PUT /api/pesanan/{id}/status - admin */
    public function updateStatus(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);
        $body = Request::body();
        $status = $body['status'] ?? '';

        if (!in_array($status, self::STATUS_ALLOWED, true)) {
            Response::error('Status tidak valid.', 422);
        }

        $cek = $this->pdo->prepare('SELECT id FROM pesanan WHERE id = :id');
        $cek->execute([':id' => $id]);

        if (!$cek->fetch()) {
            Response::error('Pesanan tidak ditemukan.', 404);
        }

        $stmt = $this->pdo->prepare('UPDATE pesanan SET status = :status WHERE id = :id');
        $stmt->execute([':status' => $status, ':id' => $id]);

        Response::success('Status pesanan berhasil diperbarui.');
    }
}
