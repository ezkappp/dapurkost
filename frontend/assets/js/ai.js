/* ==================== ai.js ====================
   Script khusus halaman ai-assistant.html
   Membutuhkan assets/js/admin.js (tampilkanToast, dsb) sudah dimuat lebih dulu.
   Seluruh output di bawah ini DUMMY (statis), belum terhubung ke model AI apapun.
   ==================================================== */

// TODO backend AI integration:
// Ganti fungsi jalankanAI() ini dengan panggilan nyata ke endpoint AI,
// mis. POST /api/admin/ai-assistant  body: { aksi, prompt }
// lalu render jawaban asli dari response ke #aiOutputText.

const OUTPUT_DUMMY = {
    analisis: "Berdasarkan data 6 bulan terakhir, penjualan meningkat 12% dibanding bulan lalu. " +
               "Paket Mingguan menyumbang kontribusi terbesar terhadap omzet bulan ini.",
    rekomendasi: "AI menyarankan meningkatkan stok Ayam Geprek karena mengalami peningkatan pemesanan " +
                 "hampir 30% dalam 2 minggu terakhir. Pertimbangkan juga menambah varian menu vegetarian.",
    prediksi: "Paket Mingguan diprediksi tetap menjadi paket terlaris bulan depan, diikuti Paket Bulanan. " +
              "Paket Harian berpotensi naik jika promo mahasiswa baru diaktifkan.",
    promo: "Contoh promo: \"Diskon 15% Paket Mingguan untuk pelanggan baru minggu ini — kode: KOSTHEMAT15\". " +
           "Cocok dipasang di Instagram dan WhatsApp Business.",
    custom: null // diisi dinamis dari input pengguna
};

function jalankanAI(aksi){
    const wrap = document.getElementById("aiOutputWrap");
    const outputText = document.getElementById("aiOutputText");
    const promptInput = document.getElementById("aiPromptInput");

    let teks;

    if(aksi === "custom"){
        const prompt = promptInput.value.trim();
        if(prompt === ""){
            tampilkanToast("Tulis pertanyaan terlebih dahulu.", "warning");
            return;
        }
        teks = `Terima kasih atas pertanyaannya: "${prompt}". Fitur AI Assistant masih dalam tahap pengembangan, ` +
               `jawaban otomatis akan tersedia setelah integrasi backend selesai.`;
    } else {
        teks = OUTPUT_DUMMY[aksi] || "Fitur ini masih dalam pengembangan.";
    }

    outputText.textContent = teks;
    wrap.style.display = "block";
    wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });

    tampilkanToast("AI Assistant memberikan hasil dummy di bawah.", "info");
}
