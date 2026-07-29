/* ==================== paket.js ====================
   Script khusus halaman kelola-paket.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) dan
   assets/js/api.js (DapurKostAPI) sudah dimuat lebih dulu.
   ==================================================== */

/* ==================== JENIS PAKET (pengganti input icon manual) ==================== */
const JENIS_PAKET = {
  hemat:      { icon: "bi-piggy-bank",  badgeLabel: "Paling Hemat", badgeIcon: "bi-piggy-bank" },
  favorit:    { icon: "bi-heart-fill",  badgeLabel: "Favorit",      badgeIcon: "bi-heart-fill" },
  premium:    { icon: "bi-gem",         badgeLabel: "Premium",      badgeIcon: "bi-gem" },
  bestseller: { icon: "bi-award-fill",  badgeLabel: "Best Seller",  badgeIcon: "bi-trophy-fill" }
};

/* ==================== DATA PAKET (dimuat dari backend) ==================== */
let paketList = [];

function formatRupiah(num){
  return "Rp" + Number(num).toLocaleString("id-ID");
}

/* ==================== MAPPING backend <-> frontend ====================
   Backend pakai field: id, nama, jenis, harga_paket, periode, durasi,
   estimasi_antar, menu_berganti, benefits (text \n-separated),
   gratis_ongkir, konsultasi_menu, prioritas_pengiriman, status.
*/
function mapPaketFromBackend(row){
  return {
    id: Number(row.id),
    name: row.nama,
    jenis: row.jenis || "",
    price: Number(row.harga_paket),
    period: row.periode || "",
    durasi: row.durasi || "",
    estimasi: row.estimasi_antar || "",
    menuGanti: row.menu_berganti || "",
    benefits: (row.benefits || "").split("\n").map(s => s.trim()).filter(Boolean),
    ongkir: Number(row.gratis_ongkir) === 1,
    konsultasi: Number(row.konsultasi_menu) === 1,
    prioritas: Number(row.prioritas_pengiriman) === 1,
    status: row.status || "aktif"
  };
}

/* ==================== MUAT DATA DARI BACKEND ==================== */
async function loadPaket(){
  try {
    const res = await DapurKostAPI.getPaket();
    paketList = (res.data.paket || []).map(mapPaketFromBackend);
    renderGrid();
  } catch (err) {
    tampilkanToast(err.message || "Gagal memuat data paket dari server.", "danger");
  }
}

/* ==================== RENDER GRID PAKET ==================== */
function renderGrid(){
  const grid = document.getElementById("paketGrid");
  document.getElementById("totalPaket").textContent = paketList.length;

  grid.innerHTML = paketList.map(p => {
    const jenisInfo = JENIS_PAKET[p.jenis] || { icon: "bi-box-seam", badgeLabel: "", badgeIcon: "" };
    const badgeHtml = p.jenis
      ? `<div class="paket-badge ${p.jenis}"><i class="bi ${jenisInfo.badgeIcon}"></i> ${jenisInfo.badgeLabel}</div>`
      : "";

    const benefitsHtml = p.benefits.map(b => `<li><i class="bi bi-check-circle-fill"></i> ${b}</li>`).join("");

    return `
    <div class="col-lg-4 col-md-6">
      <div class="paket-card ${p.jenis || ''}">
        ${badgeHtml}
        <div class="paket-icon"><i class="bi ${jenisInfo.icon}"></i></div>
        <h4>${p.name}</h4>
        <span class="paket-price">${formatRupiah(p.price)}</span>
        <span class="paket-period">${p.period}</span>

        <div class="paket-info-row"><span><i class="bi bi-clock"></i> Durasi</span><span>${p.durasi}</span></div>
        <div class="paket-info-row"><span><i class="bi bi-truck"></i> Estimasi Antar</span><span>${p.estimasi}</span></div>
        <div class="paket-info-row"><span><i class="bi bi-arrow-repeat"></i> Menu Berganti</span><span>${p.menuGanti}</span></div>

        <ul class="paket-benefit-list">${benefitsHtml}</ul>

        <div class="paket-extra">
          <span class="tag ${p.ongkir ? 'tag-yes' : 'tag-no'}"><i class="bi ${p.ongkir ? 'bi-check-circle' : 'bi-x-circle'}"></i> Gratis Ongkir</span>
          <span class="tag ${p.konsultasi ? 'tag-yes' : 'tag-no'}"><i class="bi ${p.konsultasi ? 'bi-check-circle' : 'bi-x-circle'}"></i> Konsultasi Menu</span>
          <span class="tag ${p.prioritas ? 'tag-yes' : 'tag-no'}"><i class="bi ${p.prioritas ? 'bi-check-circle' : 'bi-x-circle'}"></i> Prioritas Antar</span>
        </div>

        <div class="paket-actions">
          <button class="btn btn-outline-dark" onclick="openEditModal(${p.id})"><i class="bi bi-pencil-square"></i> Edit</button>
          <button class="btn btn-outline-danger" onclick="deletePaket(${p.id})"><i class="bi bi-trash"></i> Hapus</button>
        </div>
      </div>
    </div>`;
  }).join("");

  renderCompareTable();
}

/* ==================== RENDER TABEL PERBANDINGAN ==================== */
function renderCompareTable(){
  const thead = document.querySelector("#compareTable thead tr");
  thead.innerHTML = `<th>Fitur</th>` + paketList.map(p => `<th>${p.name}</th>`).join("");

  const rows = [
    { label: "Harga", getVal: p => formatRupiah(p.price) + " " + p.period },
    { label: "Durasi", getVal: p => p.durasi },
    { label: "Estimasi Pengiriman", getVal: p => p.estimasi },
    { label: "Menu Berganti Setiap Hari", getVal: p => p.menuGanti },
    { label: "Gratis Ongkir", getVal: p => p.ongkir ? `<i class="bi bi-check-circle-fill icon-yes"></i>` : `<i class="bi bi-x-circle icon-no"></i>` },
    { label: "Konsultasi Menu", getVal: p => p.konsultasi ? `<i class="bi bi-check-circle-fill icon-yes"></i>` : `<i class="bi bi-x-circle icon-no"></i>` },
    { label: "Prioritas Pengiriman", getVal: p => p.prioritas ? `<i class="bi bi-check-circle-fill icon-yes"></i>` : `<i class="bi bi-x-circle icon-no"></i>` }
  ];

  const body = document.getElementById("compareBody");
  body.innerHTML = rows.map(row => `
    <tr>
      <td>${row.label}</td>
      ${paketList.map(p => `<td>${row.getVal(p)}</td>`).join("")}
    </tr>
  `).join("");
}

/* ==================== MODAL TAMBAH ==================== */
function openAddModal(){
  document.getElementById("modalTitle").textContent = "Tambah Paket";
  document.getElementById("paketForm").reset();
  document.getElementById("paketId").value = "";
}

/* ==================== MODAL EDIT ==================== */
function openEditModal(id){
  const p = paketList.find(x => x.id === id);
  if(!p) return;

  document.getElementById("modalTitle").textContent = "Edit Paket";
  document.getElementById("paketId").value = p.id;
  document.getElementById("paketName").value = p.name;
  document.getElementById("paketJenis").value = p.jenis || "";
  document.getElementById("paketPrice").value = p.price;
  document.getElementById("paketPeriod").value = p.period;
  document.getElementById("paketDurasi").value = p.durasi;
  document.getElementById("paketEstimasi").value = p.estimasi;
  document.getElementById("paketMenuGanti").value = p.menuGanti;
  document.getElementById("paketBenefits").value = p.benefits.join("\n");
  document.getElementById("paketOngkir").checked = p.ongkir;
  document.getElementById("paketKonsultasi").checked = p.konsultasi;
  document.getElementById("paketPrioritas").checked = p.prioritas;

  const modal = new bootstrap.Modal(document.getElementById("paketModal"));
  modal.show();
}

/* ==================== SIMPAN (TAMBAH / EDIT) - terhubung ke backend ==================== */
document.getElementById("paketForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const id = document.getElementById("paketId").value;

  const payload = {
    nama: document.getElementById("paketName").value,
    jenis: document.getElementById("paketJenis").value,
    harga_paket: parseInt(document.getElementById("paketPrice").value, 10),
    periode: document.getElementById("paketPeriod").value,
    durasi: document.getElementById("paketDurasi").value,
    estimasi_antar: document.getElementById("paketEstimasi").value,
    menu_berganti: document.getElementById("paketMenuGanti").value,
    benefits: document.getElementById("paketBenefits").value,
    gratis_ongkir: document.getElementById("paketOngkir").checked,
    konsultasi_menu: document.getElementById("paketKonsultasi").checked,
    prioritas_pengiriman: document.getElementById("paketPrioritas").checked,
    status: "aktif"
  };

  const submitBtn = document.querySelector("#paketForm button[type='submit']");
  if(submitBtn) submitBtn.disabled = true;

  try {
    if(id){
      await DapurKostAPI.updatePaket(id, payload);
      tampilkanToast("Paket berhasil diperbarui!", "success");
    } else {
      await DapurKostAPI.createPaket(payload);
      tampilkanToast("Paket berhasil ditambahkan!", "success");
    }

    await loadPaket();
    bootstrap.Modal.getInstance(document.getElementById("paketModal")).hide();
  } catch (err) {
    tampilkanToast(err.message || "Gagal menyimpan paket.", "danger");
  } finally {
    if(submitBtn) submitBtn.disabled = false;
  }
});

/* ==================== HAPUS PAKET (Bootstrap Modal) - terhubung ke backend ==================== */
let paketIdAkanDihapus = null;
const deletePaketModalEl = document.getElementById("deletePaketModal");
const deletePaketModal = new bootstrap.Modal(deletePaketModalEl);

function deletePaket(id){
  const p = paketList.find(x => x.id === id);
  if(!p) return;
  paketIdAkanDihapus = id;
  document.getElementById("deletePaketName").textContent = `"${p.name}"`;
  deletePaketModal.show();
}

document.getElementById("confirmDeletePaketBtn").addEventListener("click", async function(){
  if(paketIdAkanDihapus === null) return;

  try {
    await DapurKostAPI.deletePaket(paketIdAkanDihapus);
    tampilkanToast("Paket berhasil dihapus!", "danger");
    await loadPaket();
  } catch (err) {
    tampilkanToast(err.message || "Gagal menghapus paket.", "danger");
  } finally {
    deletePaketModal.hide();
    paketIdAkanDihapus = null;
  }
});

/* ==================== INIT ==================== */
loadPaket();
