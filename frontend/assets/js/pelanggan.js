/* ==================== pelanggan.js ====================
   Script khusus halaman pelanggan-admin.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) sudah dimuat lebih dulu.
   ==================================================== */

// Pencarian + filter status sederhana (client-side, data dummy)
const searchInput = document.getElementById("searchPelanggan");
const filterStatus = document.getElementById("filterStatus");
const tabel = document.getElementById("tabelPelanggan");
const emptyState = document.getElementById("emptyState");

function terapkanFilter(){
    const kataKunci = searchInput.value.toLowerCase().trim();
    const status = filterStatus.value;
    const baris = tabel.querySelectorAll("tbody tr");
    let jumlahTampil = 0;

    baris.forEach(function(tr){
        const teks = tr.innerText.toLowerCase();
        const statusBaris = tr.dataset.status;
        const cocokKataKunci = teks.includes(kataKunci);
        const cocokStatus = (status === "semua") || (status === statusBaris);

        if(cocokKataKunci && cocokStatus){
            tr.style.display = "";
            jumlahTampil++;
        } else {
            tr.style.display = "none";
        }
    });

    emptyState.classList.toggle("d-none", jumlahTampil !== 0);
}

searchInput.addEventListener("input", terapkanFilter);
filterStatus.addEventListener("change", terapkanFilter);

/* ==================== AMBIL DATA DARI BARIS ==================== */
function ambilDataBaris(tr){
    return {
        id: tr.children[0].innerText.trim(),
        nama: tr.querySelector(".pelanggan-nama-text strong").innerText.trim(),
        join: tr.querySelector(".pelanggan-nama-text small").innerText.trim(),
        email: tr.children[2].innerText.trim(),
        hp: tr.children[3].innerText.trim(),
        alamat: tr.children[4].innerText.trim(),
        status: tr.dataset.status
    };
}

/* ==================== DETAIL (ICON MATA) ==================== */
const detailModal = new bootstrap.Modal(document.getElementById("detailModal"));

tabel.addEventListener("click", function(e){
    const btnDetail = e.target.closest('[title="Detail"]');
    if(!btnDetail) return;

    const tr = btnDetail.closest("tr");
    const data = ambilDataBaris(tr);

    document.getElementById("detailAvatar").textContent = data.nama.charAt(0);
    document.getElementById("detailNama").textContent = data.nama;
    document.getElementById("detailJoin").textContent = data.join;
    document.getElementById("detailId").textContent = data.id;
    document.getElementById("detailEmail").textContent = data.email;
    document.getElementById("detailHp").textContent = data.hp;
    document.getElementById("detailAlamat").textContent = data.alamat;
    document.getElementById("detailStatus").innerHTML = data.status === "aktif"
        ? '<span class="badge badge-aktif">Aktif</span>'
        : '<span class="badge badge-nonaktif">Nonaktif</span>';

    detailModal.show();
});

/* ==================== EDIT ==================== */
const editModal = new bootstrap.Modal(document.getElementById("editModal"));
let editingRow = null;

tabel.addEventListener("click", function(e){
    const btnEdit = e.target.closest('[title="Edit"]');
    if(!btnEdit) return;

    const tr = btnEdit.closest("tr");
    editingRow = tr;
    const data = ambilDataBaris(tr);

    document.getElementById("editNama").value = data.nama;
    document.getElementById("editEmail").value = data.email;
    document.getElementById("editHp").value = data.hp;
    document.getElementById("editAlamat").value = data.alamat;
    document.getElementById("editStatus").value = data.status;

    editModal.show();
});

// TODO Backend: PUT /api/admin/pelanggan/{id}
document.getElementById("editForm").addEventListener("submit", function(e){
    e.preventDefault();
    if(!editingRow) return;

    const namaBaru = document.getElementById("editNama").value;
    const emailBaru = document.getElementById("editEmail").value;
    const hpBaru = document.getElementById("editHp").value;
    const alamatBaru = document.getElementById("editAlamat").value;
    const statusBaru = document.getElementById("editStatus").value;

    // update tampilan baris
    editingRow.querySelector(".pelanggan-nama-text strong").textContent = namaBaru;
    editingRow.querySelector(".avatar-sm").textContent = namaBaru.charAt(0);
    editingRow.children[2].textContent = emailBaru;
    editingRow.children[3].textContent = hpBaru;
    editingRow.children[4].textContent = alamatBaru;

    editingRow.dataset.status = statusBaru;
    editingRow.children[5].innerHTML = statusBaru === "aktif"
        ? '<span class="badge badge-aktif">Aktif</span>'
        : '<span class="badge badge-nonaktif">Nonaktif</span>';

    editModal.hide();
    editingRow = null;
    tampilkanToast("Data pelanggan berhasil diperbarui!", "success");
});

/* ==================== HAPUS (Bootstrap Modal) ==================== */
// TODO Backend: DELETE /api/admin/pelanggan/{id}
let barisPelangganAkanDihapus = null;
const deletePelangganModal = new bootstrap.Modal(document.getElementById("deletePelangganModal"));

tabel.addEventListener("click", function(e){
    const btnHapus = e.target.closest(".btn-danger[title='Hapus']");
    if(!btnHapus) return;

    const tr = btnHapus.closest("tr");
    const data = ambilDataBaris(tr);

    barisPelangganAkanDihapus = tr;
    document.getElementById("deletePelangganName").textContent = `"${data.nama}"`;
    deletePelangganModal.show();
});

document.getElementById("confirmDeletePelangganBtn").addEventListener("click", function(){
    if(!barisPelangganAkanDihapus) return;
    barisPelangganAkanDihapus.remove();
    terapkanFilter();
    deletePelangganModal.hide();
    tampilkanToast("Pelanggan berhasil dihapus!", "danger");
    barisPelangganAkanDihapus = null;
});
