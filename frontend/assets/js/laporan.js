/* ==================== laporan.js ====================
   Script khusus halaman laporan-admin.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) dan
   assets/js/api.js (DapurKostAPI) sudah dimuat lebih dulu.
   ==================================================== */

/* ==================== DATA LAPORAN (dimuat dari backend) ==================== */
let dataLaporan = {
  ringkasan: { pendapatan: "Rp0", pesanan: 0, pelanggan: 0, menuAktif: 0 },
  pendapatanBulanan: [],
  pesananMingguan: [],
  menuTerlaris: [],
  paketFavorit: []
};

function formatRupiah(num){
  return "Rp" + Number(num).toLocaleString("id-ID");
}

const NAMA_BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const NAMA_HARI_SINGKAT = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"]; // index = Date.getDay()
const WARNA_PAKET = ["#A31D1D", "#D4A017", "#2E8B57", "#4A6FA5", "#7B4B94"];

/* ==================== MUAT SEMUA DATA DARI BACKEND ==================== */
async function loadLaporan(){
  try {
    const [ringkasanRes, pendapatanRes, mingguanRes, menuRes, paketRes] = await Promise.all([
      DapurKostAPI.getLaporanRingkasan(),
      DapurKostAPI.getLaporanPendapatanBulanan(),
      DapurKostAPI.getLaporanPesananMingguan(),
      DapurKostAPI.getLaporanMenuTerlaris(),
      DapurKostAPI.getLaporanPaketFavorit()
    ]);

    const r = ringkasanRes.data;
    dataLaporan.ringkasan = {
      pendapatan: formatRupiah(r.pendapatan),
      pesanan: r.total_pesanan,
      pelanggan: r.total_pelanggan,
      menuAktif: r.menu_aktif
    };

    dataLaporan.pendapatanBulanan = (pendapatanRes.data.pendapatan_bulanan || []).map(function(row){
      const parts = row.bulan.split("-"); // "YYYY-MM"
      const label = NAMA_BULAN[parseInt(parts[1], 10) - 1] + " " + parts[0];
      return { bulan: label, nilai: Number(row.total) };
    });

    // Isi 7 hari terakhir (termasuk yang jumlahnya 0), diurutkan dari 6 hari lalu -> hari ini
    const petaMingguan = {};
    (mingguanRes.data.pesanan_mingguan || []).forEach(function(row){
      petaMingguan[row.tanggal] = Number(row.jumlah);
    });
    const tujuhHari = [];
    for(let i = 6; i >= 0; i--){
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      tujuhHari.push({ hari: NAMA_HARI_SINGKAT[d.getDay()], jumlah: petaMingguan[key] || 0 });
    }
    dataLaporan.pesananMingguan = tujuhHari;

    dataLaporan.menuTerlaris = (menuRes.data.menu_terlaris || []).map(function(row){
      return { nama: row.nama, jumlah: Number(row.jumlah_pesanan) };
    });

    dataLaporan.paketFavorit = (paketRes.data.paket_favorit || []).map(function(row, i){
      return { nama: row.nama, total: Number(row.total_pemesan), warna: WARNA_PAKET[i % WARNA_PAKET.length] };
    });

    renderSemua();
  } catch (err) {
    tampilkanToast(err.message || "Gagal memuat data laporan dari server.", "danger");
  }
}

function renderSemua(){
  renderRingkasanExport();
  renderPendapatanBulanan();
  renderPesananMingguan();
  renderMenuTerlaris();
  renderPaketFavorit();
  renderPreviewExport();
}

/* ==================== RENDER PENDAPATAN BULANAN (BAR CSS) ==================== */
function renderPendapatanBulanan(){
  const box = document.getElementById("pendapatanBulananBox");

  if(dataLaporan.pendapatanBulanan.length === 0){
    box.innerHTML = '<p class="text-muted small mb-0">Belum ada data pendapatan (belum ada pembayaran terverifikasi).</p>';
    return;
  }

  const max = Math.max(...dataLaporan.pendapatanBulanan.map(d => d.nilai));

  box.innerHTML = dataLaporan.pendapatanBulanan.map(d => `
    <div class="bar-row">
      <div class="bar-label">${d.bulan}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${max > 0 ? (d.nilai/max*100).toFixed(0) : 0}%"></div></div>
      <div class="bar-value">${formatRupiah(d.nilai)}</div>
    </div>
  `).join("");
}

/* ==================== RENDER PESANAN MINGGUAN (BAR VERTIKAL CSS) ==================== */
function renderPesananMingguan(){
  const box = document.getElementById("pesananMingguanBox");
  const max = Math.max(1, ...dataLaporan.pesananMingguan.map(d => d.jumlah));

  box.innerHTML = dataLaporan.pesananMingguan.map(d => `
    <div class="week-col">
      <div class="week-bar-num">${d.jumlah}</div>
      <div class="week-bar" style="height:${(d.jumlah/max*100).toFixed(0)}%"></div>
      <div class="week-day">${d.hari}</div>
    </div>
  `).join("");
}

/* ==================== RENDER MENU TERLARIS ==================== */
function renderMenuTerlaris(){
  const box = document.getElementById("menuTerlarisBox");

  if(dataLaporan.menuTerlaris.length === 0){
    box.innerHTML = '<p class="text-muted small mb-0">Belum ada menu yang terjual.</p>';
    return;
  }

  const max = Math.max(...dataLaporan.menuTerlaris.map(d => d.jumlah));
  const badgeClass = ["gold","silver","bronze",""];

  box.innerHTML = dataLaporan.menuTerlaris.map((d, i) => `
    <div class="rank-item">
      <div class="rank-badge ${badgeClass[i] || ''}">${i+1}</div>
      <div class="rank-info">
        <strong>${d.nama}</strong>
        <small>${d.jumlah} Pesanan</small>
        <div class="rank-track"><div class="rank-fill" style="width:${(d.jumlah/max*100).toFixed(0)}%"></div></div>
      </div>
    </div>
  `).join("");
}

/* ==================== RENDER PAKET FAVORIT ==================== */
function renderPaketFavorit(){
  const tbody = document.querySelector("#paketFavoritTable tbody");

  if(dataLaporan.paketFavorit.length === 0){
    tbody.innerHTML = '<tr><td colspan="3" class="text-muted small">Belum ada pesanan paket.</td></tr>';
    return;
  }

  const total = dataLaporan.paketFavorit.reduce((a,b) => a + b.total, 0) || 1;

  tbody.innerHTML = dataLaporan.paketFavorit.map(p => {
    const persen = ((p.total/total)*100).toFixed(0);
    return `
      <tr>
        <td><span class="paket-dot" style="background:${p.warna}"></span>${p.nama}</td>
        <td>${p.total}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="bar-track" style="height:8px;">
              <div class="bar-fill" style="width:${persen}%; background:${p.warna};"></div>
            </div>
            <small>${persen}%</small>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

/* ==================== EXPORT EXCEL ==================== */
function exportExcel(){
  const wb = XLSX.utils.book_new();

  const ringkasanData = [
    ["Laporan Bisnis DapurKost"],
    [],
    ["Pendapatan", dataLaporan.ringkasan.pendapatan],
    ["Total Pesanan", dataLaporan.ringkasan.pesanan],
    ["Pelanggan Terdaftar", dataLaporan.ringkasan.pelanggan],
    ["Menu Aktif", dataLaporan.ringkasan.menuAktif]
  ];
  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasanData);
  XLSX.utils.book_append_sheet(wb, wsRingkasan, "Ringkasan");

  const pendapatanData = [["Bulan", "Pendapatan"]];
  dataLaporan.pendapatanBulanan.forEach(d => pendapatanData.push([d.bulan, d.nilai]));
  const wsPendapatan = XLSX.utils.aoa_to_sheet(pendapatanData);
  XLSX.utils.book_append_sheet(wb, wsPendapatan, "Pendapatan Bulanan");

  const mingguanData = [["Hari", "Jumlah Pesanan"]];
  dataLaporan.pesananMingguan.forEach(d => mingguanData.push([d.hari, d.jumlah]));
  const wsMingguan = XLSX.utils.aoa_to_sheet(mingguanData);
  XLSX.utils.book_append_sheet(wb, wsMingguan, "Pesanan Mingguan");

  const menuData = [["Menu", "Jumlah Pesanan"]];
  dataLaporan.menuTerlaris.forEach(d => menuData.push([d.nama, d.jumlah]));
  const wsMenu = XLSX.utils.aoa_to_sheet(menuData);
  XLSX.utils.book_append_sheet(wb, wsMenu, "Menu Terlaris");

  const paketData = [["Paket", "Total Pemesan"]];
  dataLaporan.paketFavorit.forEach(d => paketData.push([d.nama, d.total]));
  const wsPaket = XLSX.utils.aoa_to_sheet(paketData);
  XLSX.utils.book_append_sheet(wb, wsPaket, "Paket Favorit");

  const tanggal = new Date().toISOString().slice(0,10);
  XLSX.writeFile(wb, `Laporan-DapurKost-${tanggal}.xlsx`);
}

/* ==================== EXPORT PDF ==================== */
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(163, 29, 29);
  doc.text("Laporan Bisnis DapurKost", 14, 18);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}`, 14, 24);

  doc.autoTable({
    startY: 30,
    head: [["Ringkasan", "Nilai"]],
    body: [
      ["Pendapatan", dataLaporan.ringkasan.pendapatan],
      ["Total Pesanan", dataLaporan.ringkasan.pesanan],
      ["Pelanggan Terdaftar", dataLaporan.ringkasan.pelanggan],
      ["Menu Aktif", dataLaporan.ringkasan.menuAktif]
    ],
    theme: "grid",
    headStyles: { fillColor: [163, 29, 29] }
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Bulan", "Pendapatan"]],
    body: dataLaporan.pendapatanBulanan.map(d => [d.bulan, formatRupiah(d.nilai)]),
    theme: "grid",
    headStyles: { fillColor: [163, 29, 29] }
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Menu Terlaris", "Jumlah Pesanan"]],
    body: dataLaporan.menuTerlaris.map(d => [d.nama, d.jumlah]),
    theme: "grid",
    headStyles: { fillColor: [163, 29, 29] }
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Paket Favorit", "Total Pemesan"]],
    body: dataLaporan.paketFavorit.map(d => [d.nama, d.total]),
    theme: "grid",
    headStyles: { fillColor: [163, 29, 29] }
  });

  const tanggal = new Date().toISOString().slice(0,10);
  doc.save(`Laporan-DapurKost-${tanggal}.pdf`);
}

/* ==================== RINGKASAN SEBELUM EXPORT ==================== */
function renderRingkasanExport(){
  document.getElementById("ringkasanTransaksi").textContent = dataLaporan.ringkasan.pesanan;
  document.getElementById("ringkasanPendapatan").textContent = dataLaporan.ringkasan.pendapatan;
  document.getElementById("ringkasanPesanan").textContent = dataLaporan.ringkasan.pesanan + " pesanan";
}

/* ==================== PREVIEW DATA EXPORT ==================== */
function renderPreviewExport(){
  const tbody = document.querySelector("#previewExportTable tbody");
  if(!tbody) return;

  const baris = [
    {
      sheet: "Ringkasan",
      isi: `Pendapatan ${dataLaporan.ringkasan.pendapatan}, ${dataLaporan.ringkasan.pesanan} pesanan, ${dataLaporan.ringkasan.pelanggan} pelanggan, ${dataLaporan.ringkasan.menuAktif} menu aktif`
    },
    {
      sheet: "Pendapatan Bulanan",
      isi: dataLaporan.pendapatanBulanan.length
        ? dataLaporan.pendapatanBulanan.map(d => `${d.bulan}: ${formatRupiah(d.nilai)}`).join(" &middot; ")
        : "Belum ada data"
    },
    {
      sheet: "Pesanan Mingguan",
      isi: dataLaporan.pesananMingguan.map(d => `${d.hari}: ${d.jumlah}`).join(" &middot; ")
    },
    {
      sheet: "Menu Terlaris",
      isi: dataLaporan.menuTerlaris.length
        ? dataLaporan.menuTerlaris.map(d => `${d.nama} (${d.jumlah}x)`).join(" &middot; ")
        : "Belum ada data"
    },
    {
      sheet: "Paket Favorit",
      isi: dataLaporan.paketFavorit.length
        ? dataLaporan.paketFavorit.map(d => `${d.nama}: ${d.total} pemesan`).join(" &middot; ")
        : "Belum ada data"
    }
  ];

  tbody.innerHTML = baris.map(b => `
    <tr>
      <td class="fw-semibold" style="width:180px;">${b.sheet}</td>
      <td class="text-muted small">${b.isi}</td>
    </tr>
  `).join("");
}

/* ==================== INIT ==================== */
loadLaporan();
