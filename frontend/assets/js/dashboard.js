/* ==================== dashboard.js ====================
   Script khusus halaman dashboard-admin.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) sudah dimuat lebih dulu.
   ==================================================== */

/* ==================== PROFIL DROPDOWN ==================== */
const profileTrigger = document.getElementById("profileTrigger");
const profileDropdown = document.getElementById("profileDropdown");

profileTrigger.addEventListener("click", function(e){
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
});

// Tutup dropdown kalau klik di luar
document.addEventListener("click", function(e){
    if(!profileDropdown.contains(e.target) && e.target !== profileTrigger){
        profileDropdown.classList.remove("show");
    }
});

/* ==================== SIMPAN PROFIL ==================== */
// TODO Backend: PUT /api/admin/profil {nama, email, hp}
document.getElementById("profilForm").addEventListener("submit", function(e){
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById("profilModal")).hide();
    tampilkanToast("Profil berhasil diperbarui!", "success");
});

/* ==================== SIMPAN PASSWORD ==================== */
// TODO Backend: PUT /api/admin/password {password_lama, password_baru}
document.getElementById("passwordForm").addEventListener("submit", function(e){
    e.preventDefault();

    const baru = document.getElementById("passBaru").value;
    const konfirmasi = document.getElementById("passKonfirmasi").value;

    if(baru !== konfirmasi){
        tampilkanToast("Password baru dan konfirmasi tidak sama!", "danger");
        return;
    }

    document.getElementById("passwordForm").reset();
    bootstrap.Modal.getInstance(document.getElementById("passwordModal")).hide();
    tampilkanToast("Password berhasil diubah!", "success");
});

/* ==================== SIMPAN PENGATURAN ==================== */
// TODO Backend: PUT /api/admin/pengaturan {notif_email, notif_pesanan, notif_pembayaran}
document.getElementById("pengaturanForm").addEventListener("submit", function(e){
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById("pengaturanModal")).hide();
    tampilkanToast("Pengaturan berhasil disimpan!", "success");
});
