-- Seed data awal untuk development/testing.
-- Jalankan SETELAH database/dapurkost.sql (struktur tabel harus sudah ada).
-- Tidak mengubah struktur tabel, hanya menambahkan 1 akun admin default
-- supaya login-admin.html bisa langsung dicoba.

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

-- Catatan: jalankan database/migration_paket.sql SEBELUM seed ini,
-- karena kolom tambahan pada tabel paket (jenis, periode, dst) dipakai di bawah.

-- Contoh menu awal
INSERT INTO menu (nama, deskripsi, harga, kategori, status) VALUES
('Nasi Ayam Geprek', 'Ayam crispy dengan sambal bawang pedas.', 15000, 'makan-siang', 'aktif'),
('Nasi Goreng Spesial', 'Nasi goreng dengan telur, ayam, dan acar.', 15000, 'makan-siang', 'aktif'),
('Es Teh Manis', 'Teh manis dingin segar.', 4000, 'minuman', 'aktif')
ON DUPLICATE KEY UPDATE nama = nama;

-- Contoh paket awal (field tambahan lihat database/migration_paket.sql)
INSERT INTO paket (nama, jenis, deskripsi, harga_paket, periode, durasi, estimasi_antar, menu_berganti, benefits, gratis_ongkir, konsultasi_menu, prioritas_pengiriman, status) VALUES
('Paket Harian', 'favorit', '1x makan untuk 1 hari.', 15000, '/ 1x makan', '1 Hari', '± 45 Menit', 'Setiap Hari',
    'Cocok untuk coba-coba dulu\nTanpa kontrak jangka panjang\nBisa pesan kapan saja', 0, 0, 0, 'aktif'),
('Paket Mingguan', 'bestseller', '2x makan/hari selama 7 hari.', 95000, '/ 7 hari (2x makan/hari)', '7 Hari', '± 30 Menit', 'Setiap Hari',
    'Gratis ongkir seluruh area kost\nBisa ganti menu 2x dalam seminggu\nPrioritas jadwal pengantaran', 1, 0, 1, 'aktif'),
('Paket Bulanan', 'hemat', '2x makan/hari selama 30 hari.', 350000, '/ 30 hari (2x makan/hari)', '30 Hari', '± 30 Menit', 'Setiap Hari',
    'Harga per porsi paling murah\nKonsultasi menu mingguan gratis\nBebas pilih semua menu tersedia', 1, 1, 1, 'aktif')
ON DUPLICATE KEY UPDATE nama = nama;
