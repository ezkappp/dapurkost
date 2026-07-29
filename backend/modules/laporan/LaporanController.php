<?php

class LaporanController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /** GET /api/laporan/ringkasan - admin */
    public function ringkasan(): void
    {
        Session::requireLogin('admin');

        $pendapatan = $this->pdo
            ->query("SELECT COALESCE(SUM(nominal), 0) FROM pembayaran WHERE status = 'terverifikasi'")
            ->fetchColumn();

        $totalPesanan = $this->pdo->query('SELECT COUNT(*) FROM pesanan')->fetchColumn();
        $totalPelanggan = $this->pdo->query('SELECT COUNT(*) FROM pelanggan')->fetchColumn();
        $menuAktif = $this->pdo->query("SELECT COUNT(*) FROM menu WHERE status = 'aktif'")->fetchColumn();
        $pesananMenunggu = $this->pdo
            ->query("SELECT COUNT(*) FROM pesanan WHERE status = 'menunggu_pembayaran'")
            ->fetchColumn();

        Response::success('OK', [
            'pendapatan' => (float) $pendapatan,
            'total_pesanan' => (int) $totalPesanan,
            'total_pelanggan' => (int) $totalPelanggan,
            'menu_aktif' => (int) $menuAktif,
            'pesanan_menunggu' => (int) $pesananMenunggu,
        ]);
    }

    /** GET /api/laporan/pendapatan-bulanan - admin */
    public function pendapatanBulanan(): void
    {
        Session::requireLogin('admin');

        $sql = "SELECT DATE_FORMAT(tanggal_bayar, '%Y-%m') AS bulan, SUM(nominal) AS total
                FROM pembayaran
                WHERE status = 'terverifikasi' AND tanggal_bayar IS NOT NULL
                GROUP BY bulan
                ORDER BY bulan ASC";
        $stmt = $this->pdo->query($sql);
        Response::success('OK', ['pendapatan_bulanan' => $stmt->fetchAll()]);
    }

    /** GET /api/laporan/pesanan-mingguan - admin (7 hari terakhir) */
    public function pesananMingguan(): void
    {
        Session::requireLogin('admin');

        $sql = "SELECT DATE(created_at) AS tanggal, COUNT(*) AS jumlah
                FROM pesanan
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                GROUP BY tanggal
                ORDER BY tanggal ASC";
        $stmt = $this->pdo->query($sql);
        Response::success('OK', ['pesanan_mingguan' => $stmt->fetchAll()]);
    }

    /** GET /api/laporan/menu-terlaris - admin */
    public function menuTerlaris(): void
    {
        Session::requireLogin('admin');

        $sql = 'SELECT m.nama, COUNT(p.id) AS jumlah_pesanan
                FROM pesanan p
                JOIN menu m ON m.id = p.menu_id
                GROUP BY m.id, m.nama
                ORDER BY jumlah_pesanan DESC
                LIMIT 10';
        $stmt = $this->pdo->query($sql);
        Response::success('OK', ['menu_terlaris' => $stmt->fetchAll()]);
    }

    /** GET /api/laporan/paket-favorit - admin */
    public function paketFavorit(): void
    {
        Session::requireLogin('admin');

        $sql = 'SELECT pk.nama, COUNT(p.id) AS total_pemesan
                FROM pesanan p
                JOIN paket pk ON pk.id = p.paket_id
                GROUP BY pk.id, pk.nama
                ORDER BY total_pemesan DESC';
        $stmt = $this->pdo->query($sql);
        Response::success('OK', ['paket_favorit' => $stmt->fetchAll()]);
    }
}
