-- Migration tambahan (ADDITIF, tidak menghapus/mengubah kolom lama) untuk
-- mendukung field yang sudah dipakai di frontend/admin/kelola-paket.html
-- (jenis, periode, durasi, estimasi antar, menu berganti, benefit, dan
-- fitur tambahan ongkir/konsultasi/prioritas) yang sebelumnya belum ada
-- di database/dapurkost.sql.
--
-- Jalankan SETELAH database/dapurkost.sql, SEBELUM database/seed.sql.

USE dapurkost_db;

ALTER TABLE paket
    ADD COLUMN jenis VARCHAR(20) NULL AFTER nama,
    ADD COLUMN periode VARCHAR(50) NULL AFTER harga_paket,
    ADD COLUMN durasi VARCHAR(50) NULL AFTER periode,
    ADD COLUMN estimasi_antar VARCHAR(50) NULL AFTER durasi,
    ADD COLUMN menu_berganti VARCHAR(50) NULL AFTER estimasi_antar,
    ADD COLUMN benefits TEXT NULL AFTER menu_berganti,
    ADD COLUMN gratis_ongkir TINYINT(1) NOT NULL DEFAULT 0 AFTER benefits,
    ADD COLUMN konsultasi_menu TINYINT(1) NOT NULL DEFAULT 0 AFTER gratis_ongkir,
    ADD COLUMN prioritas_pengiriman TINYINT(1) NOT NULL DEFAULT 0 AFTER konsultasi_menu,
    ADD UNIQUE KEY unique_paket_nama (nama);

-- Unique key kecil di atas juga dipakai supaya database/seed.sql idempotent
-- (tidak dobel insert kalau dijalankan lebih dari sekali).

ALTER TABLE menu
    ADD UNIQUE KEY unique_menu_nama (nama);
