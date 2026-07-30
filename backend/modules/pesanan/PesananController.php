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
                    LEFT JOIN paket pk ON pk.id = p.paket_id
                    LEFT JOIN menu m ON m.id = p.menu_id
                    ORDER BY p.created_at DESC';
            $stmt = $this->pdo->query($sql);
        } else {
            $sql = 'SELECT p.*, pk.nama AS nama_paket, m.nama AS nama_menu
                    FROM pesanan p
                    LEFT JOIN paket pk ON pk.id = p.paket_id
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
                LEFT JOIN paket pk ON pk.id = p.paket_id
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

    /**
     * POST /api/pesanan - pelanggan checkout.
     * Mode 1 (paket): body { paket_id, jumlah, tanggal_pesan }
     * Mode 2 (keranjang menu satuan): body { items: [{menu_id, jumlah}, ...], tanggal_pesan }
     *   -> tiap item di keranjang dibuat jadi satu baris pesanan terpisah
     *      (paket_id NULL, menu_id terisi), supaya tetap konsisten dengan
     *      struktur tabel `pesanan` yang sudah ada (1 baris = 1 jenis item).
     */
    public function store(): void
    {
        $user = Session::requireLogin('pelanggan');
        $body = Request::body();

        if (isset($body['items']) && is_array($body['items']) && count($body['items']) > 0) {
            $this->storeKeranjangMenu($user, $body);

            return;
        }

        $this->storePaket($user, $body);
    }

    /** Checkout via paket berlangganan (satu baris pesanan) */
    private function storePaket(array $user, array $body): void
    {
        $paketId = (int) ($body['paket_id'] ?? 0);
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
             VALUES (:pelanggan_id, :paket_id, NULL, :jumlah, :total_harga, 'menunggu_pembayaran', :tanggal_pesan)"
        );
        $stmt->execute([
            ':pelanggan_id' => $user['id'],
            ':paket_id' => $paketId,
            ':jumlah' => $jumlah,
            ':total_harga' => $totalHarga,
            ':tanggal_pesan' => $tanggalPesan,
        ]);

        Response::success('Pesanan berhasil dibuat.', [
            'id' => (int) $this->pdo->lastInsertId(),
            'total_harga' => $totalHarga,
        ], 201);
    }

    /** Checkout via keranjang menu satuan (bisa lebih dari satu jenis menu sekaligus) */
    private function storeKeranjangMenu(array $user, array $body): void
    {
        $tanggalPesan = $body['tanggal_pesan'] ?? date('Y-m-d');
        $items = $body['items'];

        // Validasi semua item dulu sebelum insert apa pun, biar tidak
        // setengah-setengah kalau ada satu item yang tidak valid.
        $itemsValid = [];

        foreach ($items as $item) {
            $menuId = (int) ($item['menu_id'] ?? 0);
            $jumlah = (int) ($item['jumlah'] ?? 1);

            if ($menuId <= 0 || $jumlah <= 0) {
                Response::error('Ada item di keranjang yang tidak valid.', 422);
            }

            $stmtMenu = $this->pdo->prepare("SELECT harga FROM menu WHERE id = :id AND status = 'aktif' LIMIT 1");
            $stmtMenu->execute([':id' => $menuId]);
            $menu = $stmtMenu->fetch();

            if (!$menu) {
                Response::error("Menu dengan id {$menuId} tidak ditemukan atau tidak aktif.", 404);
            }

            $itemsValid[] = [
                'menu_id' => $menuId,
                'jumlah' => $jumlah,
                'total_harga' => (float) $menu['harga'] * $jumlah,
            ];
        }

        $this->pdo->beginTransaction();

        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO pesanan (pelanggan_id, paket_id, menu_id, jumlah, total_harga, status, tanggal_pesan)
                 VALUES (:pelanggan_id, NULL, :menu_id, :jumlah, :total_harga, 'menunggu_pembayaran', :tanggal_pesan)"
            );

            $idTerbuat = [];
            $totalGabungan = 0;

            foreach ($itemsValid as $item) {
                $stmt->execute([
                    ':pelanggan_id' => $user['id'],
                    ':menu_id' => $item['menu_id'],
                    ':jumlah' => $item['jumlah'],
                    ':total_harga' => $item['total_harga'],
                    ':tanggal_pesan' => $tanggalPesan,
                ]);
                $idTerbuat[] = (int) $this->pdo->lastInsertId();
                $totalGabungan += $item['total_harga'];
            }

            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            Response::error('Gagal membuat pesanan: ' . $e->getMessage(), 500);

            return;
        }

        Response::success('Pesanan berhasil dibuat.', [
            'ids' => $idTerbuat,
            'total_harga' => $totalGabungan,
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
