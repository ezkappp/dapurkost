# DapurKost

Aplikasi pemesanan makanan berlangganan (kost/kos-kosan) — backend PHP native + MySQL, frontend HTML/JS (customer & admin).

## Tech Stack

- **Backend**: PHP Native (tanpa framework), REST API (JSON)
- **Database**: MySQL / MariaDB
- **Frontend**: HTML, CSS, JavaScript (vanilla), Bootstrap 5
- **Server (lokal)**: Laragon (Apache + mod_rewrite)
- **Deploy**: Docker (Railway)

## Struktur Folder

```
dapurkost/
├── backend/
│   ├── config/database.php   # koneksi DB (baca env var kalau ada, fallback lokal)
│   ├── core/                 # Router, Request, Response, Session, Database
│   ├── modules/               # Auth, Menu, Paket, Pelanggan, Pesanan, Pembayaran, Laporan
│   └── public/
│       ├── index.php         # entry point + daftar semua rute API
│       └── .htaccess         # rewrite rule (butuh mod_rewrite aktif)
├── frontend/
│   ├── customer/              # halaman pelanggan (home, menu, paket, checkout, dst)
│   ├── admin/                  # halaman admin (dashboard, kelola menu/paket, laporan, dst)
│   └── assets/js/api.js       # helper terpusat untuk memanggil REST API
├── database/
│   ├── dapurkost.sql          # struktur tabel utama
│   ├── migration_paket.sql    # tambahan kolom tabel paket
│   ├── migration_foto.sql     # perbesar kolom foto/bukti_transfer (base64)
│   └── seed.sql               # data awal (admin default + contoh menu/paket)
├── Dockerfile                 # build image untuk deploy (Railway)
└── entrypoint.sh              # set Apache listen ke $PORT saat runtime
```

## Setup Lokal (Laragon)

1. Extract project ke `C:\laragon\www\dapurkost`
2. Start Laragon (Apache + MySQL)
3. Pastikan mod_rewrite aktif: Laragon → Apache → `httpd.conf` → baris
   `LoadModule rewrite_module modules/mod_rewrite.so` tidak boleh diawali `#`
4. Import database **berurutan** (phpMyAdmin atau `mysql -u root`):
   ```
   dapurkost.sql → migration_paket.sql → migration_foto.sql → seed.sql
   ```
5. Cek `backend/config/database.php` — default sudah cocok untuk Laragon
   (`root` tanpa password), tidak perlu diubah untuk lokal
6. Akses:
   - Backend check: `http://localhost/dapurkost/backend/public/`
   - Customer: `http://localhost/dapurkost/frontend/customer/home.html`
   - Admin: `http://localhost/dapurkost/frontend/admin/login-admin.html`

### Login admin default
- Username: `admin`
- Password: `123456`

## Deploy ke Railway (Docker, satu service)

1. Push project ini ke GitHub repo
2. Railway → New Project → **Deploy from GitHub repo** (Railway otomatis pakai `Dockerfile`)
3. Tambah **New → Database → MySQL** di project yang sama
4. Di service PHP → tab **Variables** → **Add Reference** → hubungkan
   `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`
   dari service MySQL
5. Konek ke MySQL Railway (pakai connection string dari tombol **Connect**),
   import SQL berurutan seperti di atas
6. Setelah deploy, test domain publik yang diberikan Railway:
   - `https://<domain>/backend/public/` → harus muncul JSON sukses
   - `https://<domain>/frontend/customer/home.html`

## Keterbatasan yang Diketahui

- Tabel `pelanggan` belum punya kolom status aktif/nonaktif — toggle di admin bersifat kosmetik saja
- Checkout hanya mendukung paket berlangganan (bukan pesan menu à la carte satuan), sesuai desain skema `pesanan`
- Foto menu & bukti transfer pembayaran disimpan sebagai base64 string di database (bukan file upload sungguhan) — cukup untuk demo, tapi kalau mau production sebaiknya diganti ke upload file + folder `/uploads`

## Modul & Endpoint API

| Modul | Endpoint |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Menu | `GET/POST /api/menu`, `GET/PUT/DELETE /api/menu/{id}` |
| Paket | `GET/POST /api/paket`, `GET/PUT/DELETE /api/paket/{id}` |
| Pelanggan | `GET /api/pelanggan`, `GET/PUT/DELETE /api/pelanggan/{id}` |
| Pesanan | `GET/POST /api/pesanan`, `GET /api/pesanan/{id}`, `PUT /api/pesanan/{id}/status` |
| Pembayaran | `GET/POST /api/pembayaran`, `PUT /api/pembayaran/{id}/verifikasi`, `DELETE /api/pembayaran/{id}` |
| Laporan | `GET /api/laporan/ringkasan`, `/pendapatan-bulanan`, `/pesanan-mingguan`, `/menu-terlaris`, `/paket-favorit` |
