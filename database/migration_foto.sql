-- Migration tambahan (ADDITIF): perbesar kolom yang menyimpan data gambar
-- base64 dari VARCHAR(255) menjadi LONGTEXT, supaya tidak truncated /
-- error "Data too long for column" saat upload foto menu atau bukti
-- transfer pembayaran (keduanya sekarang disimpan sebagai base64 string,
-- bukan file upload beneran).
--
-- Jalankan SETELAH database/migration_paket.sql.

USE dapurkost_db;

ALTER TABLE menu
    MODIFY COLUMN foto LONGTEXT NULL;

ALTER TABLE pembayaran
    MODIFY COLUMN bukti_transfer LONGTEXT NULL;
