/* ===================================================
   ADMIN.JS - Shared script DapurKost Admin Panel
   Berisi: Toast helper, wiring notifikasi & logout,
   dan utilitas yang dipakai bersama di seluruh halaman admin.
   Dimuat SETELAH bootstrap.bundle.min.js dan SEBELUM
   script khusus tiap halaman (mis. pesanan.js, menu.js, dll).
   =================================================== */

/* ==================== TOAST HELPER ==================== */
/**
 * Menampilkan Bootstrap Toast sebagai feedback aksi (tambah/edit/hapus/dll).
 * @param {string} pesan - teks yang ditampilkan
 * @param {"success"|"danger"|"warning"|"info"} tipe
 */
function tampilkanToast(pesan, tipe){
    tipe = tipe || "success";
    const warna = {
        success: "bg-success",
        danger: "bg-danger",
        warning: "bg-warning text-dark",
        info: "bg-info text-dark"
    };
    const toastEl = document.getElementById("appToast");
    if(!toastEl) return;
    toastEl.className = "toast align-items-center border-0 " +
        (tipe === "warning" ? "" : "text-white ") +
        (warna[tipe] || warna.success);
    const body = document.getElementById("appToastBody");
    if(body) body.textContent = pesan;
    new bootstrap.Toast(toastEl, { delay: 3000 }).show();
}

/* ==================== NOTIFIKASI: "LIHAT SEMUA" ====================
   Placeholder navigasi untuk item dropdown notifikasi yang belum
   punya halaman pusat notifikasi tersendiri. */
document.addEventListener("DOMContentLoaded", function(){

    document.querySelectorAll(".dropdown-item.text-center[href='#']").forEach(function(link){
        link.addEventListener("click", function(e){
            e.preventDefault();
            tampilkanToast("Halaman pusat notifikasi akan segera hadir.", "info");
        });
    });

    /* Avatar yang belum dibungkus dropdown profil (halaman selain dashboard)
       tetap bisa dibuka jika halaman menyediakan modal #profilModal. */
    document.querySelectorAll(".avatar[data-bs-toggle='modal']").forEach(function(av){
        av.style.cursor = "pointer";
    });

});
