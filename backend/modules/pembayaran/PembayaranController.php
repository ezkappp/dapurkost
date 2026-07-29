<?php

class PembayaranController
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /** GET /api/pembayaran - admin */
    public function index(): void
    {
        Session::requireLogin('admin');
        $sql = 'SELECT pb.*, ps.pelanggan_id, pl.nama AS nama_pelanggan
                FROM pembayaran pb
                JOIN pesanan ps ON ps.id = pb.pesanan_id
                JOIN pelanggan pl ON pl.id = ps.pelanggan_id
                ORDER BY pb.created_at DESC';
        $stmt = $this->pdo->query($sql);
        Response::success('OK', ['pembayaran' => $stmt->fetchAll()]);
    }

    /** POST /api/pembayaran - pelanggan (submit bukti bayar) */
    public function store(): void
    {
        $user = Session::requireLogin('pelanggan');
        $body = Request::body();

        $pesananId = (int) ($body['pesanan_id'] ?? 0);
        $metode = $body['metode_pembayaran'] ?? 'transfer';
        $buktiTransfer = trim((string) ($body['bukti_transfer'] ?? ''));

        if (!in_array($metode, ['transfer', 'cash'], true)) {
            Response::error('Metode pembayaran tidak valid.', 422);
        }

        $stmtPesanan = $this->pdo->prepare('SELECT total_harga, pelanggan_id FROM pesanan WHERE id = :id LIMIT 1');
        $stmtPesanan->execute([':id' => $pesananId]);
        $pesanan = $stmtPesanan->fetch();

        if (!$pesanan || (int) $pesanan['pelanggan_id'] !== (int) $user['id']) {
            Response::error('Pesanan tidak ditemukan.', 404);
        }

        $cekAda = $this->pdo->prepare('SELECT id FROM pembayaran WHERE pesanan_id = :id');
        $cekAda->execute([':id' => $pesananId]);

        if ($cekAda->fetch()) {
            Response::error('Pesanan ini sudah memiliki data pembayaran.', 409);
        }

        $stmt = $this->pdo->prepare(
            "INSERT INTO pembayaran (pesanan_id, metode_pembayaran, nominal, bukti_transfer, status)
             VALUES (:pesanan_id, :metode, :nominal, :bukti, 'pending')"
        );
        $stmt->execute([
            ':pesanan_id' => $pesananId,
            ':metode' => $metode,
            ':nominal' => $pesanan['total_harga'],
            ':bukti' => $buktiTransfer,
        ]);

        Response::success('Bukti pembayaran berhasil dikirim, menunggu verifikasi admin.', [
            'id' => (int) $this->pdo->lastInsertId(),
        ], 201);
    }

    /** DELETE /api/pembayaran/{id} - admin */
    public function destroy(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);

        $stmt = $this->pdo->prepare('DELETE FROM pembayaran WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Pembayaran tidak ditemukan.', 404);
        }

        Response::success('Pembayaran berhasil dihapus.');
    }

    /** PUT /api/pembayaran/{id}/verifikasi - admin */
    public function verifikasi(array $params): void
    {
        Session::requireLogin('admin');
        $id = (int) ($params['id'] ?? 0);
        $body = Request::body();
        $status = $body['status'] ?? '';

        if (!in_array($status, ['terverifikasi', 'ditolak'], true)) {
            Response::error('Status verifikasi tidak valid.', 422);
        }

        $stmtCek = $this->pdo->prepare('SELECT pesanan_id FROM pembayaran WHERE id = :id LIMIT 1');
        $stmtCek->execute([':id' => $id]);
        $pembayaran = $stmtCek->fetch();

        if (!$pembayaran) {
            Response::error('Pembayaran tidak ditemukan.', 404);
        }

        $this->pdo->beginTransaction();

        try {
            $stmt = $this->pdo->prepare(
                'UPDATE pembayaran SET status = :status, tanggal_bayar = :tanggal WHERE id = :id'
            );
            $stmt->execute([
                ':status' => $status,
                ':tanggal' => $status === 'terverifikasi' ? date('Y-m-d') : null,
                ':id' => $id,
            ]);

            $statusPesanan = $status === 'terverifikasi' ? 'dibayar' : 'dibatalkan';
            $stmtUpdatePesanan = $this->pdo->prepare('UPDATE pesanan SET status = :status WHERE id = :id');
            $stmtUpdatePesanan->execute([':status' => $statusPesanan, ':id' => $pembayaran['pesanan_id']]);

            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            Response::error('Gagal memproses verifikasi: ' . $e->getMessage(), 500);
        }

        Response::success('Status pembayaran berhasil diperbarui.');
    }
}
