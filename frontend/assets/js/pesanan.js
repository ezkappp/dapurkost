/* ==================== pesanan.js ====================
   Script khusus halaman pesanan-admin.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) sudah dimuat lebih dulu.
   ==================================================== */

// Pencarian + filter status (client-side, data dummy)
const searchInput = document.getElementById("searchPesanan");
const filterStatus = document.getElementById("filterStatus");
const tabel = document.getElementById("tabelPesanan");
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

// Badge status mapping (warna kontras, lihat assets/css/admin.css)
const statusInfo = {
    menunggu:   { label: "Menunggu",   kelas: "badge-menunggu" },
    diproses:   { label: "Diproses",   kelas: "badge-diproses" },
    dikirim:    { label: "Dikirim",    kelas: "badge-dikirim" },
    selesai:    { label: "Selesai",    kelas: "badge-selesai" },
    dibatalkan: { label: "Dibatalkan", kelas: "badge-dibatalkan" }
};

function formatRupiah(angka){
    return "Rp " + Number(angka).toLocaleString("id-ID");
}

// MODAL DETAIL
let barisAktif = null;

function tampilkanDetail(btn){

    const tr = btn.closest("tr");

    document.getElementById("detailId").innerText = "#" + tr.dataset.id;
    document.getElementById("detailNama").innerText = tr.dataset.nama;
    document.getElementById("detailPaket").innerText = tr.dataset.paket;
    document.getElementById("detailTanggal").innerText = tr.dataset.tanggal;
    document.getElementById("detailHp").innerText = tr.dataset.hp;
    document.getElementById("detailAlamat").innerText = tr.dataset.alamat;
    document.getElementById("detailTotal").innerText = formatRupiah(tr.dataset.total);

    const menuWrap = document.getElementById("detailMenu");
    menuWrap.innerHTML = "";

    tr.dataset.menu.split(",").forEach(function(item){
        const pill = document.createElement("span");
        pill.className = "menu-pill";
        pill.innerText = item.trim();
        menuWrap.appendChild(pill);
    });

    const catatanRow = document.getElementById("detailCatatanRow");
    if(tr.dataset.catatan && tr.dataset.catatan.trim() !== ""){
        document.getElementById("detailCatatan").innerText = tr.dataset.catatan;
        catatanRow.style.display = "";
    } else {
        catatanRow.style.display = "none";
    }

}

// MODAL UPDATE STATUS
function bukaUpdateStatus(btn){

    const tr = btn.closest("tr");
    barisAktif = tr;

    document.getElementById("statusId").innerText = "#" + tr.dataset.id;
    document.getElementById("statusNama").innerText = tr.dataset.nama;
    document.getElementById("statusCatatan").value = tr.dataset.catatan || "";

    document.querySelectorAll(".status-option").forEach(function(opt){
        opt.classList.remove("selected");
        const radio = opt.querySelector("input[type='radio']");
        radio.checked = (opt.dataset.value === tr.dataset.status);
        if(radio.checked){
            opt.classList.add("selected");
        }
    });

}

document.querySelectorAll(".status-option").forEach(function(opt){

    opt.addEventListener("click", function(){
        document.querySelectorAll(".status-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        opt.querySelector("input[type='radio']").checked = true;
    });

});

function simpanStatus(){

    if(!barisAktif){
        return;
    }

    const dipilih = document.querySelector(".status-option input[name='statusBaru']:checked");

    if(!dipilih){
        tampilkanToast("Silakan pilih status terlebih dahulu.", "warning");
        return;
    }

    const statusBaru = dipilih.value;
    const info = statusInfo[statusBaru];
    const catatanBaru = document.getElementById("statusCatatan").value.trim();

    // TODO Backend: PUT /api/admin/pesanan/{id}/status  body: { status: statusBaru, catatan: catatanBaru }
    barisAktif.dataset.status = statusBaru;
    barisAktif.dataset.catatan = catatanBaru;

    const statusCell = barisAktif.querySelector("td:nth-child(6)");
    const badgeCell = statusCell.querySelector(".badge");
    badgeCell.className = "badge " + info.kelas;
    badgeCell.innerText = info.label;

    // Tampilkan/hapus indikator catatan kecil di bawah badge status
    let catatanInfo = statusCell.querySelector(".catatan-info");
    if(catatanBaru !== ""){
        if(!catatanInfo){
            catatanInfo = document.createElement("div");
            catatanInfo.className = "catatan-info";
            statusCell.appendChild(catatanInfo);
        }
        catatanInfo.innerHTML = `<i class="bi bi-chat-left-text"></i> ${catatanBaru}`;
    } else if(catatanInfo){
        catatanInfo.remove();
    }

    const modalEl = document.getElementById("statusModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    terapkanFilter();
    tampilkanToast(`Status pesanan berhasil diperbarui menjadi "${info.label}"!`, "success");

}
