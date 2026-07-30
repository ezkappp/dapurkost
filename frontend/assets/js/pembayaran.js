/* ==================== pembayaran.js ====================
   Script khusus halaman pembayaran-admin.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) dan
   assets/js/api.js (DapurKostAPI) sudah dimuat lebih dulu.
   ==================================================== */

// Format angka jadi "RpX.XXX.XXX" (fungsi ini tidak ada di admin.js,
// jadi didefinisikan di sini juga—sama seperti pola di menu.js/paket.js/laporan.js/pesanan.js)
function formatRupiah(angka){
    if(!angka) return "Rp0";
    return "Rp" + Math.round(angka).toLocaleString("id-ID");
}

// Data pembayaran dimuat dari backend (GET /api/pembayaran)
let pembayaranList = [];

const searchInput = document.getElementById("searchPembayaran");
const filterStatus = document.getElementById("filterStatus");
const filterMetode = document.getElementById("filterMetode");
const tabel = document.getElementById("tabelPembayaran");
const emptyState = document.getElementById("emptyState");

// Mapping status UI (singkat) <-> enum backend (tabel `pembayaran`)
const statusUiToBackend = { menunggu: "pending", terverifikasi: "terverifikasi", ditolak: "ditolak" };
const statusBackendToUi = { pending: "menunggu", terverifikasi: "terverifikasi", ditolak: "ditolak" };

function badgeStatus(status){
    if(status === "terverifikasi") return '<span class="badge badge-selesai">Terverifikasi</span>';
    if(status === "ditolak") return '<span class="badge badge-dibatalkan">Ditolak</span>';
    return '<span class="badge badge-menunggu">Menunggu Verifikasi</span>';
}

function formatTanggal(tanggalStr){
    if(!tanggalStr) return "-";
    const d = new Date(tanggalStr.replace(" ", "T"));
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

/* ==================== MUAT DATA DARI BACKEND ==================== */
async function loadPembayaran(){
    try {
        const res = await DapurKostAPI.getPembayaran();
        pembayaranList = (res.data.pembayaran || []).map(function(row){
            return {
                id: row.id,
                idPesanan: row.pesanan_id,
                nama: row.nama_pelanggan || "-",
                metode: row.metode_pembayaran, // 'transfer' atau 'cash'
                total: Number(row.nominal),
                tanggal: formatTanggal(row.created_at),
                statusKey: statusBackendToUi[row.status] || "menunggu",
                buktiTransfer: row.bukti_transfer || ""
            };
        });
        renderTabel();
    } catch (err) {
        tampilkanToast(err.message || "Gagal memuat data pembayaran dari server.", "danger");
    }
}

/* ==================== RENDER TABEL ==================== */
function renderTabel(){
    const tbody = tabel.querySelector("tbody");

    tbody.innerHTML = pembayaranList.map(function(p){
        const inisial = (p.nama || "-").charAt(0).toUpperCase();
        const labelMetode = p.metode === "transfer" ? "Transfer Bank" : "Cash";
        const tombolVerifikasi = p.statusKey === "menunggu"
            ? `<button class="btn btn-outline-success" title="Verifikasi"><i class="bi bi-check-circle"></i></button>`
            : "";

        return `
        <tr data-status="${p.statusKey}" data-metode="${p.metode}" data-id="${p.id}">
            <td>#PB${String(p.id).padStart(4, '0')}</td>
            <td>#DK${String(p.idPesanan).padStart(4, '0')}</td>
            <td>
                <div class="nama-cell">
                    <div class="avatar-sm">${inisial}</div>
                    <strong>${p.nama}</strong>
                </div>
            </td>
            <td class="metode-cell">${labelMetode}</td>
            <td>${formatRupiah(p.total)}</td>
            <td>${p.tanggal}</td>
            <td>${badgeStatus(p.statusKey)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-outline-dark" title="Detail"><i class="bi bi-eye"></i></button>
                    ${tombolVerifikasi}
                    <button class="btn btn-danger" title="Hapus"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join("");

    terapkanFilter();
}

function terapkanFilter(){

    const kataKunci = searchInput.value.toLowerCase().trim();
    const status = filterStatus.value;
    const metode = filterMetode.value;
    const baris = tabel.querySelectorAll("tbody tr");
    let jumlahTampil = 0;

    baris.forEach(function(tr){

        const teks = tr.innerText.toLowerCase();
        const statusBaris = tr.dataset.status;
        const metodeBaris = tr.dataset.metode;

        const cocokKataKunci = teks.includes(kataKunci);
        const cocokStatus = (status === "semua") || (status === statusBaris);
        const cocokMetode = (metode === "semua") || (metode === metodeBaris);

        if(cocokKataKunci && cocokStatus && cocokMetode){

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
filterMetode.addEventListener("change", terapkanFilter);

/* ==================== AMBIL DATA DARI BARIS ==================== */
function ambilDataBaris(tr){
    const id = Number(tr.dataset.id);
    return pembayaranList.find(function(p){ return p.id === id; });
}

/* ==================== DETAIL (ICON MATA) ==================== */
const detailModal = new bootstrap.Modal(document.getElementById("detailModal"));

tabel.addEventListener("click", function(e){
    const btnDetail = e.target.closest('[title="Detail"]');
    if(!btnDetail) return;

    const tr = btnDetail.closest("tr");
    const data = ambilDataBaris(tr);
    if(!data) return;

    document.getElementById("detailAvatar").textContent = data.nama.charAt(0).toUpperCase();
    document.getElementById("detailNama").textContent = data.nama;
    document.getElementById("detailTanggal").textContent = data.tanggal;
    document.getElementById("detailIdPembayaran").textContent = "#PB" + String(data.id).padStart(4, '0');
    document.getElementById("detailIdPesanan").textContent = "#DK" + String(data.idPesanan).padStart(4, '0');
    document.getElementById("detailMetode").textContent = data.metode === "transfer" ? "Transfer Bank" : "Cash";
    document.getElementById("detailTotal").textContent = formatRupiah(data.total);
    document.getElementById("detailStatus").innerHTML = badgeStatus(data.statusKey);

    detailModal.show();
});

/* ==================== VERIFIKASI / TOLAK (Bootstrap Modal Konfirmasi) ==================== */
const verifyModal = new bootstrap.Modal(document.getElementById("verifyModal"));
let pembayaranAkanDiverifikasi = null;

tabel.addEventListener("click", function(e){
    const btnVerif = e.target.closest('[title="Verifikasi"]');
    if(!btnVerif) return;

    const tr = btnVerif.closest("tr");
    const data = ambilDataBaris(tr);
    if(!data) return;

    pembayaranAkanDiverifikasi = data;

    document.getElementById("verifyNama").textContent = data.nama;
    document.getElementById("verifyNominal").textContent = formatRupiah(data.total);
    document.getElementById("verifyTanggal").textContent = data.tanggal;
    document.getElementById("verifyStatus").innerHTML = badgeStatus(data.statusKey);

    verifyModal.show();
});

async function terapkanVerifikasi(statusBaruUi){
    if(!pembayaranAkanDiverifikasi) return;

    const data = pembayaranAkanDiverifikasi;
    const statusBackend = statusUiToBackend[statusBaruUi];

    try {
        await DapurKostAPI.verifikasiPembayaran(data.id, statusBackend);
        verifyModal.hide();
        tampilkanToast(
            `Pembayaran #PB${String(data.id).padStart(4, '0')} berhasil ${statusBaruUi === 'terverifikasi' ? 'diverifikasi' : 'ditolak'}!`,
            statusBaruUi === 'terverifikasi' ? 'success' : 'danger'
        );
        await loadPembayaran();
    } catch (err) {
        tampilkanToast(err.message || "Gagal memperbarui status pembayaran.", "danger");
    }

    pembayaranAkanDiverifikasi = null;
}

document.getElementById("confirmVerifyBtn").addEventListener("click", function(){
    terapkanVerifikasi("terverifikasi");
});

document.getElementById("rejectVerifyBtn").addEventListener("click", function(){
    terapkanVerifikasi("ditolak");
});

/* ==================== HAPUS (Bootstrap Modal) ==================== */
const deletePembayaranModal = new bootstrap.Modal(document.getElementById("deletePembayaranModal"));
let pembayaranAkanDihapus = null;

tabel.addEventListener("click", function(e){
    const btnHapus = e.target.closest('[title="Hapus"]');
    if(!btnHapus) return;

    const tr = btnHapus.closest("tr");
    const data = ambilDataBaris(tr);
    if(!data) return;

    pembayaranAkanDihapus = data;
    document.getElementById("deletePembayaranName").textContent =
        `#PB${String(data.id).padStart(4, '0')} (${data.nama})`;
    deletePembayaranModal.show();
});

document.getElementById("confirmDeletePembayaranBtn").addEventListener("click", async function(){
    if(!pembayaranAkanDihapus) return;

    try {
        await DapurKostAPI.deletePembayaran(pembayaranAkanDihapus.id);
        tampilkanToast("Data pembayaran berhasil dihapus!", "danger");
        await loadPembayaran();
    } catch (err) {
        tampilkanToast(err.message || "Gagal menghapus data pembayaran.", "danger");
    } finally {
        deletePembayaranModal.hide();
        pembayaranAkanDihapus = null;
    }
});

/* ==================== INIT ==================== */
loadPembayaran();
