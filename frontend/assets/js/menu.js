/* ==================== menu.js ====================
   Script khusus halaman kelola-menu.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) dan
   assets/js/api.js (DapurKostAPI) sudah dimuat lebih dulu.
   ==================================================== */

/* ==================== DATA MENU (dimuat dari backend) ==================== */
let menuItems = [];

const categoryLabel = {
  "sarapan": "Sarapan",
  "makan-siang": "Makan Siang",
  "makan-malam": "Makan Malam",
  "minuman": "Minuman",
  "snack": "Snack"
};

let activeCategory = "semua";
let searchQuery = "";

/* ==================== FORMAT RUPIAH ==================== */
function formatRupiah(num){
  return "Rp" + Number(num).toLocaleString("id-ID");
}

/* ==================== MAPPING backend <-> frontend ====================
   Backend pakai field: id, nama, deskripsi, harga, kategori, foto, status.
   Frontend (UI lama) pakai: id, name, category, desc, price, img.
*/
function mapFromBackend(row){
  return {
    id: Number(row.id),
    name: row.nama,
    category: row.kategori || "",
    desc: row.deskripsi || "",
    price: Number(row.harga),
    img: row.foto || "",
    status: row.status || "aktif"
  };
}

/* ==================== MUAT DATA DARI BACKEND ==================== */
async function loadMenu(){
  try {
    const res = await DapurKostAPI.getMenu();
    menuItems = (res.data.menu || []).map(mapFromBackend);
    renderGrid();
  } catch (err) {
    tampilkanToast(err.message || "Gagal memuat data menu dari server.", "danger");
  }
}

/* ==================== RENDER FILTER TABS ==================== */
function renderTabs(){
  const tabs = document.getElementById("filterTabs");
  let html = `<button class="${activeCategory==='semua'?'active':''}" onclick="setCategory('semua')">Semua</button>`;
  for(const key in categoryLabel){
    html += `<button class="${activeCategory===key?'active':''}" onclick="setCategory('${key}')">${categoryLabel[key]}</button>`;
  }
  tabs.innerHTML = html;
}

function setCategory(cat){
  activeCategory = cat;
  renderTabs();
  renderGrid();
}

/* ==================== RENDER GRID MENU ==================== */
function renderGrid(){
  const grid = document.getElementById("menuGrid");

  let filtered = menuItems.filter(item => {
    const matchCategory = activeCategory === "semua" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if(filtered.length === 0){
    grid.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <i class="bi bi-cup-hot"></i>
          <p>Menu tidak ditemukan.</p>
        </div>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="col-lg-3 col-md-6">
      <div class="menu-card">
        <img src="${item.img || 'https://placehold.co/500x375/E5D0AC/6D2323?font=poppins&text=' + encodeURIComponent(item.name)}" alt="${item.name}">
        <div class="body">
          <span class="cat-badge">${categoryLabel[item.category] || item.category || "-"}</span>
          <h5>${item.name}</h5>
          <p class="desc">${item.desc}</p>
          <div class="price">${formatRupiah(item.price)}</div>
          <div class="actions">
            <button class="btn btn-outline-dark" onclick="openEditModal(${item.id})">
              <i class="bi bi-pencil-square"></i> Edit
            </button>
            <button class="btn btn-outline-danger" onclick="deleteMenu(${item.id})">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

/* ==================== SEARCH ==================== */
document.getElementById("searchInput").addEventListener("input", function(e){
  searchQuery = e.target.value;
  renderGrid();
});

/* ==================== UPLOAD FOTO (preview lokal, disimpan sebagai URL/base64) ==================== */
const menuImgFile = document.getElementById("menuImgFile");
const uploadPreviewImg = document.getElementById("uploadPreviewImg");
const uploadPlaceholder = document.getElementById("uploadPlaceholder");

function tampilkanPreviewFoto(url){
    if(url){
        uploadPreviewImg.src = url;
        uploadPreviewImg.style.display = "block";
        uploadPlaceholder.style.display = "none";
    } else {
        uploadPreviewImg.src = "";
        uploadPreviewImg.style.display = "none";
        uploadPlaceholder.style.display = "block";
    }
}

menuImgFile.addEventListener("change", function(e){
    const file = e.target.files[0];
    if(!file) return;

    // NOTE: backend saat ini menyimpan kolom foto sebagai URL/text (VARCHAR),
    // belum ada endpoint upload file khusus. Preview base64 ini hanya untuk
    // tampilan; kalau mau foto benar-benar tersimpan di server, perlu modul
    // upload terpisah nanti.
    const reader = new FileReader();
    reader.onload = function(ev){
        tampilkanPreviewFoto(ev.target.result);
        document.getElementById("menuImg").value = ev.target.result;
    };
    reader.readAsDataURL(file);
});

/* ==================== MODAL TAMBAH ==================== */
function openAddModal(){
  document.getElementById("modalTitle").textContent = "Tambah Menu";
  document.getElementById("menuForm").reset();
  document.getElementById("menuId").value = "";
  tampilkanPreviewFoto("");
}

/* ==================== MODAL EDIT ==================== */
function openEditModal(id){
  const item = menuItems.find(m => m.id === id);
  if(!item) return;

  document.getElementById("modalTitle").textContent = "Edit Menu";
  document.getElementById("menuId").value = item.id;
  document.getElementById("menuName").value = item.name;
  document.getElementById("menuCategory").value = item.category;
  document.getElementById("menuDesc").value = item.desc;
  document.getElementById("menuPrice").value = item.price;
  document.getElementById("menuImg").value = item.img;
  tampilkanPreviewFoto(item.img);

  const modal = new bootstrap.Modal(document.getElementById("menuModal"));
  modal.show();
}

/* ==================== SIMPAN (TAMBAH / EDIT) - terhubung ke backend ==================== */
document.getElementById("menuForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const id = document.getElementById("menuId").value;
  const name = document.getElementById("menuName").value;
  const category = document.getElementById("menuCategory").value;
  const desc = document.getElementById("menuDesc").value;
  const price = parseInt(document.getElementById("menuPrice").value, 10);
  const img = document.getElementById("menuImg").value;

  const payload = {
    nama: name,
    deskripsi: desc,
    harga: price,
    kategori: category,
    foto: img,
    status: "aktif"
  };

  const submitBtn = document.querySelector("#menuForm button[type='submit']");
  if(submitBtn) submitBtn.disabled = true;

  try {
    if(id){
      await DapurKostAPI.updateMenu(id, payload);
      tampilkanToast("Menu berhasil diperbarui!", "success");
    } else {
      await DapurKostAPI.createMenu(payload);
      tampilkanToast("Menu berhasil ditambahkan!", "success");
    }

    await loadMenu();
    bootstrap.Modal.getInstance(document.getElementById("menuModal")).hide();
  } catch (err) {
    tampilkanToast(err.message || "Gagal menyimpan menu.", "danger");
  } finally {
    if(submitBtn) submitBtn.disabled = false;
  }
});

/* ==================== HAPUS MENU (Bootstrap Modal) - terhubung ke backend ==================== */
let menuIdAkanDihapus = null;
const deleteMenuModalEl = document.getElementById("deleteMenuModal");
const deleteMenuModal = new bootstrap.Modal(deleteMenuModalEl);

function deleteMenu(id){
  const item = menuItems.find(m => m.id === id);
  if(!item) return;
  menuIdAkanDihapus = id;
  document.getElementById("deleteMenuName").textContent = `"${item.name}"`;
  deleteMenuModal.show();
}

document.getElementById("confirmDeleteMenuBtn").addEventListener("click", async function(){
  if(menuIdAkanDihapus === null) return;

  try {
    await DapurKostAPI.deleteMenu(menuIdAkanDihapus);
    tampilkanToast("Menu berhasil dihapus!", "danger");
    await loadMenu();
  } catch (err) {
    tampilkanToast(err.message || "Gagal menghapus menu.", "danger");
  } finally {
    deleteMenuModal.hide();
    menuIdAkanDihapus = null;
  }
});

/* ==================== INIT ==================== */
renderTabs();
loadMenu();
