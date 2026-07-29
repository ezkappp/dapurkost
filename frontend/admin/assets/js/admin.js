/* ==========================================================
   DapurKost - Admin Panel Shared Script
   Dipakai bersama oleh seluruh halaman admin.
   ========================================================== */

/* ==================== TOAST HELPER ====================
   Dipakai di semua halaman admin (login, register, dashboard,
   kelola menu, kelola paket, pesanan, pelanggan, pembayaran, laporan).
*/
function tampilkanToast(pesan, tipe){
    tipe = tipe || "success";
    const warna = { success:"bg-success", danger:"bg-danger", warning:"bg-warning text-dark", info:"bg-info text-dark" };
    const toastEl = document.getElementById("appToast");
    if(!toastEl){ return; }
    toastEl.className = "toast align-items-center border-0 " + (tipe === "warning" ? "" : "text-white ") + (warna[tipe] || warna.success);
    document.getElementById("appToastBody").textContent = pesan;
    new bootstrap.Toast(toastEl, { delay: 3000 }).show();
}

/* ==================== FORMAT RUPIAH ====================
   Dipakai di kelola menu, kelola paket, pesanan, laporan.
*/
function formatRupiah(angka){
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

/* ==================== KONFIRMASI AKSI (MODAL) ====================
   Pengganti window.confirm() bawaan browser.
   Dipakai untuk aksi yang butuh persetujuan user (hapus, verifikasi, dsb).
   Membutuhkan markup modal id="confirmModal" di halaman terkait.

   Contoh pemakaian:
   konfirmasiAksi("Yakin ingin menghapus data ini?", function(){
       // aksi setelah user menekan tombol konfirmasi
   });
*/
function konfirmasiAksi(pesan, onConfirm, opsi){
    opsi = opsi || {};

    const modalEl = document.getElementById("confirmModal");
    if(!modalEl){
        // fallback: jika modal tidak ada di halaman ini, langsung jalankan aksi
        if(onConfirm){ onConfirm(); }
        return;
    }

    document.getElementById("confirmModalBody").textContent = pesan;

    const confirmBtn = document.getElementById("confirmModalBtn");
    confirmBtn.textContent = opsi.btnLabel || "Ya, Lanjutkan";
    confirmBtn.className = "btn px-4 " + (opsi.btnClass || "btn-danger");

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    function handleConfirm(){
        confirmBtn.removeEventListener("click", handleConfirm);
        modal.hide();
        if(onConfirm){ onConfirm(); }
    }

    confirmBtn.addEventListener("click", handleConfirm);
    modal.show();
}

/* ==================== NOTIFIKASI ==================== */

const btnReadAll = document.getElementById("readAllNotif");

if (btnReadAll) {

    btnReadAll.addEventListener("click", function () {

        // badge angka di icon lonceng
        const badgeNotif = document.querySelector(".badge-notif");

        if (badgeNotif) {
            badgeNotif.style.display = "none";
        }

        // badge "4 Baru"
        const badgeBaru = document.querySelector(".dropdown-menu .badge");

        if (badgeBaru) {
            badgeBaru.textContent = "0 Baru";
            badgeBaru.classList.remove("bg-danger");
            badgeBaru.classList.add("bg-secondary");
        }

        // semua notif menjadi sudah dibaca
        document.querySelectorAll(".notif-item").forEach(function(item){

            item.style.opacity = "0.6";

            item.style.background = "#f8f9fa";

        });

        tampilkanToast(
            "Semua notifikasi telah ditandai sudah dibaca.",
            "success"
        );

    });

}
