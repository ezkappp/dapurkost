/* ==================== api.js ====================
   Helper terpusat untuk memanggil REST API backend DapurKost.
   Tahap ini baru mengaktifkan endpoint /api/auth/* (login, register,
   logout, me). Endpoint lain (menu, paket, dst) menyusul di tahap
   berikutnya, tapi helper generic apiFetch() sudah reusable untuk itu.

   PENTING: sesuaikan API_BASE_URL kalau struktur folder server kamu
   berbeda dari struktur project ini:
     dapurkost-git/
       backend/public/index.php
       frontend/admin/*.html      <-- 2 folder di bawah root project
       frontend/customer/*.html   <-- 2 folder di bawah root project
   ==================================================== */

const API_BASE_URL = "../../backend/public";

/**
 * Panggil endpoint backend. Otomatis kirim/terima JSON dan sertakan cookie
 * session (credentials: 'include') supaya status login dikenali antar-request.
 *
 * @param {string} path - contoh: "/api/auth/login"
 * @param {object} options - { method, body }
 * @returns {Promise<object>} response JSON dari backend
 */
async function apiFetch(path, options = {}) {
    const config = {
        method: options.method || "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    };

    if (options.body !== undefined) {
        config.body = JSON.stringify(options.body);
    }

    let response;

    try {
        response = await fetch(API_BASE_URL + path, config);
    } catch (err) {
        throw new Error("Tidak bisa menghubungi server. Pastikan backend PHP sudah berjalan.");
    }

    let data;

    try {
        data = await response.json();
    } catch (err) {
        throw new Error("Server memberikan respons yang tidak valid.");
    }

    if (!response.ok || data.success === false) {
        const message = data && data.message ? data.message : "Terjadi kesalahan pada server.";
        const error = new Error(message);
        error.status = response.status;
        error.payload = data;
        throw error;
    }

    return data;
}

const DapurKostAPI = {
    login: (identifier, password, table) =>
        apiFetch("/api/auth/login", { method: "POST", body: { identifier, password, table } }),
    logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
    me: () => apiFetch("/api/auth/me"),
    register: (data, table) => apiFetch("/api/auth/register", { method: "POST", body: { ...data, table } }),

    getMenu: () => apiFetch("/api/menu"),
    getMenuById: (id) => apiFetch(`/api/menu/${id}`),
    createMenu: (data) => apiFetch("/api/menu", { method: "POST", body: data }),
    updateMenu: (id, data) => apiFetch(`/api/menu/${id}`, { method: "PUT", body: data }),
    deleteMenu: (id) => apiFetch(`/api/menu/${id}`, { method: "DELETE" }),

    getPaket: () => apiFetch("/api/paket"),
    getPaketById: (id) => apiFetch(`/api/paket/${id}`),
    createPaket: (data) => apiFetch("/api/paket", { method: "POST", body: data }),
    updatePaket: (id, data) => apiFetch(`/api/paket/${id}`, { method: "PUT", body: data }),
    deletePaket: (id) => apiFetch(`/api/paket/${id}`, { method: "DELETE" }),

    getPelanggan: () => apiFetch("/api/pelanggan"),
    getPelangganById: (id) => apiFetch(`/api/pelanggan/${id}`),
    updatePelanggan: (id, data) => apiFetch(`/api/pelanggan/${id}`, { method: "PUT", body: data }),
    deletePelanggan: (id) => apiFetch(`/api/pelanggan/${id}`, { method: "DELETE" }),

    getPesanan: () => apiFetch("/api/pesanan"),
    getPesananById: (id) => apiFetch(`/api/pesanan/${id}`),
    createPesanan: (data) => apiFetch("/api/pesanan", { method: "POST", body: data }),
    updatePesananStatus: (id, status) =>
        apiFetch(`/api/pesanan/${id}/status`, { method: "PUT", body: { status } }),

    getPembayaran: () => apiFetch("/api/pembayaran"),
    createPembayaran: (data) => apiFetch("/api/pembayaran", { method: "POST", body: data }),
    verifikasiPembayaran: (id, status) =>
        apiFetch(`/api/pembayaran/${id}/verifikasi`, { method: "PUT", body: { status } }),
    deletePembayaran: (id) => apiFetch(`/api/pembayaran/${id}`, { method: "DELETE" }),

    getLaporanRingkasan: () => apiFetch("/api/laporan/ringkasan"),
    getLaporanPendapatanBulanan: () => apiFetch("/api/laporan/pendapatan-bulanan"),
    getLaporanPesananMingguan: () => apiFetch("/api/laporan/pesanan-mingguan"),
    getLaporanMenuTerlaris: () => apiFetch("/api/laporan/menu-terlaris"),
    getLaporanPaketFavorit: () => apiFetch("/api/laporan/paket-favorit"),
};
