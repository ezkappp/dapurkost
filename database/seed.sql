-- Seed data awal untuk development/testing.
-- Jalankan SETELAH database/dapurkost.sql (struktur tabel harus sudah ada),
-- dan SETELAH database/migration_paket.sql + database/migration_foto.sql
-- (kolom tambahan paket & kolom foto LONGTEXT dipakai di bawah).

USE dapurkost_db;

-- Akun admin default
--   email    : admin@dapurkost.id
--   username : admin
--   password : 123456
INSERT INTO admin (nama, username, email, password_hash, role)
VALUES (
    'Admin DapurKost',
    'admin',
    'admin@dapurkost.id',
    '$2b$10$ow5dIzQeUD1AAQJCbD0tIuSvZLh/TsvPV4bg4mdZwG2wwxggYQfam',
    'super_admin'
)
ON DUPLICATE KEY UPDATE nama = nama;

-- Contoh menu awal, lengkap dengan foto placeholder (ilustrasi SVG
-- sederhana, dibuat sendiri, bukan foto berhak cipta -- sekadar tampilan
-- awal supaya menu tidak polos. Ganti nanti lewat kelola-menu.html
-- dengan foto asli menu masing-masing.)
INSERT INTO menu (nama, deskripsi, harga, kategori, foto, status) VALUES
('Nasi Ayam Geprek', 'Ayam crispy dengan sambal bawang pedas.', 15000, 'makan-siang', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGM0UwIi8+CjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxNTAiIHJ4PSI3NSIgcnk9IjE4IiBmaWxsPSIjRDdDQ0M4Ii8+CjxwYXRoIGQ9Ik00MCAxNTAgUTQwIDEwMCAxMDAgOTUgUTE2MCAxMDAgMTYwIDE1MCBaIiBmaWxsPSIjRkFGQUZBIi8+CjxwYXRoIGQ9Ik01MCAxNTAgUTUwIDExMCAxMDAgMTA1IFExNTAgMTEwIDE1MCAxNTAgWiIgZmlsbD0iI0ZGRkZGRiIvPgo8ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTA1IiByeD0iNTAiIHJ5PSIxMCIgZmlsbD0iI0Y1RjVGNSIvPgo8ZWxsaXBzZSBjeD0iMTIwIiBjeT0iOTUiIHJ4PSIzMCIgcnk9IjIwIiBmaWxsPSIjRDI2OTFFIi8+CjxlbGxpcHNlIGN4PSIxMTUiIGN5PSI5MCIgcng9IjI1IiByeT0iMTYiIGZpbGw9IiNFMjk4NEEiLz4KPGNpcmNsZSBjeD0iMTA1IiBjeT0iODgiIHI9IjMiIGZpbGw9IiM4QjQ1MTMiLz4KPGNpcmNsZSBjeD0iMTI1IiBjeT0iOTIiIHI9IjMiIGZpbGw9IiM4QjQ1MTMiLz4KPGNpcmNsZSBjeD0iMTE1IiBjeT0iOTgiIHI9IjMiIGZpbGw9IiM4QjQ1MTMiLz4KPHBhdGggZD0iTTcwIDk1IFE3NSA4MCA2NSA3NSBRNzUgODIgNzIgOTIgWiIgZmlsbD0iI0M2MjgyOCIvPgo8cGF0aCBkPSJNNzggOTIgUTgzIDc1IDczIDY4IFE4MyA3NiA4MCA5MCBaIiBmaWxsPSIjRDMyRjJGIi8+Cjwvc3ZnPgo=', 'aktif'),
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan acar.', 15000, 'makan-siang', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGOEUxIi8+CjxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxNTAiIHJ4PSI3NSIgcnk9IjE4IiBmaWxsPSIjRDdDQ0M4Ii8+CjxwYXRoIGQ9Ik0zNSAxNTAgUTM1IDk1IDEwMCA5MCBRMTY1IDk1IDE2NSAxNTAgWiIgZmlsbD0iI0U2QTk0RiIvPgo8cGF0aCBkPSJNNDUgMTQ4IFE0NSAxMDUgMTAwIDEwMCBRMTU1IDEwNSAxNTUgMTQ4IFoiIGZpbGw9IiNEOTkyMkUiLz4KPGNpcmNsZSBjeD0iNzUiIGN5PSIxMTUiIHI9IjYiIGZpbGw9IiNDODU3MUEiLz4KPGNpcmNsZSBjeD0iOTUiIGN5PSIxMDUiIHI9IjUiIGZpbGw9IiNDODU3MUEiLz4KPGNpcmNsZSBjeD0iMTIwIiBjeT0iMTE4IiByPSI2IiBmaWxsPSIjQzg1NzFBIi8+CjxjaXJjbGUgY3g9IjExMCIgY3k9IjEzMCIgcj0iNSIgZmlsbD0iIzhCQzM0QSIvPgo8Y2lyY2xlIGN4PSI4MCIgY3k9IjEzMiIgcj0iNSIgZmlsbD0iIzhCQzM0QSIvPgo8ZWxsaXBzZSBjeD0iMTMwIiBjeT0iOTAiIHJ4PSIyMCIgcnk9IjE1IiBmaWxsPSIjRkZGRkZGIi8+CjxjaXJjbGUgY3g9IjEzMCIgY3k9IjkwIiByPSI3IiBmaWxsPSIjRkZDMTA3Ii8+Cjwvc3ZnPgo=', 'aktif'),
('Es Teh Manis', 'Teh manis dingin segar.', 4000, 'minuman', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTBGN0ZBIi8+CjxwYXRoIGQ9Ik03MCA2MCBMMTMwIDYwIEwxMjAgMTY1IFExMDAgMTc1IDgwIDE2NSBaIiBmaWxsPSIjQjI3MDRBIiBmaWxsLW9wYWNpdHk9IjAuODUiLz4KPHBhdGggZD0iTTcwIDYwIEwxMzAgNjAgTDEyNyA4MCBMNzMgODAgWiIgZmlsbD0iI0M4OEE1RiIgZmlsbC1vcGFjaXR5PSIwLjYiLz4KPGVsbGlwc2UgY3g9IjEwMCIgY3k9IjYwIiByeD0iMzAiIHJ5PSI4IiBmaWxsPSIjRkZGRkZGIiBmaWxsLW9wYWNpdHk9IjAuNSIvPgo8Y2lyY2xlIGN4PSI4NSIgY3k9IjEwMCIgcj0iNiIgZmlsbD0iI0UzRjJGRCIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPGNpcmNsZSBjeD0iMTA1IiBjeT0iMTIwIiByPSI3IiBmaWxsPSIjRTNGMkZEIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8Y2lyY2xlIGN4PSI5NSIgY3k9IjE0NSIgcj0iNSIgZmlsbD0iI0UzRjJGRCIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPHJlY3QgeD0iOTciIHk9IjMwIiB3aWR0aD0iNiIgaGVpZ2h0PSI0NSIgcng9IjMiIGZpbGw9IiNGNDQzMzYiLz4KPHJlY3QgeD0iOTMiIHk9IjI1IiB3aWR0aD0iMTQiIGhlaWdodD0iMTAiIHJ4PSI0IiBmaWxsPSIjRjQ0MzM2Ii8+Cjwvc3ZnPgo=', 'aktif')
ON DUPLICATE KEY UPDATE foto = VALUES(foto);

-- Contoh paket awal (field tambahan lihat database/migration_paket.sql).
-- Catatan: tabel `paket` tidak punya kolom foto (lihat database/dapurkost.sql),
-- jadi tampilan kartu paket di frontend memakai styling/ikon, bukan foto.
INSERT INTO paket (nama, jenis, deskripsi, harga_paket, periode, durasi, estimasi_antar, menu_berganti, benefits, gratis_ongkir, konsultasi_menu, prioritas_pengiriman, status) VALUES
('Paket Harian', 'favorit', '1x makan untuk 1 hari.', 15000, '/ 1x makan', '1 Hari', '± 45 Menit', 'Setiap Hari',
    'Cocok untuk coba-coba dulu\nTanpa kontrak jangka panjang\nBisa pesan kapan saja', 0, 0, 0, 'aktif'),
('Paket Mingguan', 'bestseller', '2x makan/hari selama 7 hari.', 95000, '/ 7 hari (2x makan/hari)', '7 Hari', '± 30 Menit', 'Setiap Hari',
    'Gratis ongkir seluruh area kost\nBisa ganti menu 2x dalam seminggu\nPrioritas jadwal pengantaran', 1, 0, 1, 'aktif'),
('Paket Bulanan', 'hemat', '2x makan/hari selama 30 hari.', 350000, '/ 30 hari (2x makan/hari)', '30 Hari', '± 30 Menit', 'Setiap Hari',
    'Harga per porsi paling murah\nKonsultasi menu mingguan gratis\nBebas pilih semua menu tersedia', 1, 1, 1, 'aktif')
ON DUPLICATE KEY UPDATE nama = nama;
