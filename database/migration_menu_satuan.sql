-- Migration tambahan (ADDITIF): izinkan pesanan tanpa paket berlangganan,
-- supaya pelanggan bisa checkout menu satuan langsung dari keranjang
-- (sebelumnya paket_id wajib diisi, jadi checkout keranjang menu selalu
-- diblokir). Kolom menu_id sudah nullable sejak awal, sekarang paket_id
-- juga dibuat nullable dengan pola yang sama.
--
-- Jalankan SETELAH database/migration_foto.sql.

USE dapurkost_db;

ALTER TABLE pesanan
    MODIFY COLUMN paket_id INT NULL;
