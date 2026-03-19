# 🌙 NGAJI DIGITAL ENGINE v2.1.0 (Ramadhan Edition)

[![GAS](https://img.shields.io/badge/Backend-Google%20Apps%20Script-emerald?style=for-the-badge&logo=google-apps-script)](https://script.google.com/)
[![Tailwind](https://img.shields.io/badge/Frontend-Tailwind%20CSS-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-Google%20Sheets-green?style=for-the-badge&logo=google-sheets)](https://www.google.com/sheets/about/)
[![Version](https://img.shields.io/badge/Version-2.1.0--Ramadhan-orange?style=for-the-badge)](#)

**Ngaji Digital Engine** adalah ekosistem aplikasi ibadah modern yang mentransformasikan Google Sheets menjadi *High-Performance Headless CMS*. Menggunakan arsitektur *Hybrid-Sync*, aplikasi ini menjamin kecepatan akses data suci Al-Quran, Hadits, dan jadwal sholat dengan beban server minimal melalui sistem caching otomatis yang cerdas.

---

## 🔗 Live Preview
Nikmati pengalaman ibadah digital di sini:  
👉 [https://cerminsiji.github.io/Ngaji-Digital/](https://cerminsiji.github.io/Ngaji-Digital/)
[![Blogger](https://img.shields.io/badge/Blogger-Ngaji%20Digital-orange?logo=blogger&logoColor=white)](https://sukslan.blogspot.com/p/ngaji-digital.html)

---

## 📸 Screenshoot

Lihat tampilan lengkap aplikasi di sini 👉  
➡️ [Lihat Screenshoot](https://github.com/Cerminsiji/Ngaji-Digital/blob/master/img/SCREENSHOTS.md)

---
---

## ✨ Fitur Unggulan v2.1.0

* **⚡ Instant-Load Clock Engine**: Jam digital berjalan secara *native* di sisi klien menggunakan sistem JavaScript, memastikan waktu muncul seketika tanpa menunggu respon API.
* **📅 Adjusted Hijri Calendar**: Integrasi API Aladhan dengan logika kompensasi `-1 hari` untuk akurasi kalender Hijriah lokal Indonesia (sesuai standar 26 Ramadhan 1447 H).
* **📖 On-Demand Quran Caching**: Mekanisme otomatis yang memindahkan data ayat dari API `equran.id` ke Spreadsheet hanya saat surah diakses pertama kali, mempercepat pemuatan berikutnya hingga 300%.
* **🔍 Optimized Hadith Search**: Pencarian lintas 9 perawi besar (Bukhari, Muslim, dll) yang diproses di sisi server dengan batasan hasil (*limit*) untuk menjaga stabilitas performa.
* **📦 Smart Bulk Importer**: Modul khusus untuk mengimpor ribuan baris data hadits secara bertahap (*batching*) guna menghindari batasan limit eksekusi Google Apps Script (6 menit).

---

## 🛠️ Arsitektur & Teknologi

### 1. Backend Service (`Code.gs`)
Berfungsi sebagai API Gateway tunggal yang menangani routing permintaan data:
* **Action Handler**: Mengelola rute permintaan seperti `getCalendar`, `getSholat`, `getSurah`, hingga pencarian Hadits.
* **Auto-Init**: Membangun struktur tabel secara otomatis jika lembar kerja Spreadsheet masih kosong.

### 2. Frontend App (`index.html`)
Antarmuka pengguna berbasis Web modern:
* **UI Framework**: Tailwind CSS dengan tema *Dark Emerald Glassmorphism*.
* **Performance**: Implementasi `Promise.all` untuk pengambilan data asinkron agar UI tetap responsif.
* **UX**: Navigasi antar surah yang cerdas, menampilkan label nama surah sebelumnya dan berikutnya secara dinamis.

### 3. Data Injection Modules (Importers)
* **`ImportSurah.gs`**: Mengotomatisasi pembuatan 114 sheet surah lengkap.
* **`ImportHadits.gs`**: Menggunakan algoritma *loop-batching* (500 baris/siklus) untuk mengunduh database 9 perawi tanpa *timeout*.
* **`ImportTahlil.gs`**: Modul injeksi konten statis untuk tahlil dan doa-doa pendek.

---

## 🚀 Panduan Setup & Deployment

### Langkah 1: Persiapan Spreadsheet
1.  Buat **Google Sheets** baru.
2.  Buka **Extensions > Apps Script**.
3.  Salin isi file `Code.gs` ke editor.
4.  Buat file baru bernama `index.html` dan tempel isi file `Index.html`.

### Langkah 2: Injeksi Data (Import Awal)
Tambahkan file script baru (misal: `ImportTools.gs`) dan masukkan kode dari 3 file Import. Jalankan fungsi berikut di editor secara berurutan:
1.  `setupDatabaseTahlil()`: Mengisi data tahlil secara otomatis.
2.  `bulkSyncAllSurah()`: Menarik data 114 Surah dari API pusat ke Spreadsheet.
3.  `jalankanImportHaditsLengkap()`: Mengunduh database 9 perawi Hadits secara bertahap.

### Langkah 3: Deploy Web App
1.  Klik **Deploy > New Deployment** > Pilih **Web App**.
2.  Setel *Execute as*: **Me** dan *Who has access*: **Anyone**.
3.  Salin URL Web App Anda.
4.  Cari variabel `const API` di file `index.html` dan tempelkan URL tersebut.

---

## 📡 Dokumentasi API Gateway

Akses data dilakukan melalui satu endpoint utama dengan parameter `action`.

### 🔗 Base URL
`https://script.google.com/macros/s/ID_DEPLOYMENT/exec`

| Action | Deskripsi | Parameter Tambahan |
| :--- | :--- | :--- |
| `getCalendar` | Penanggalan Masehi & Hijriah (H-1) | - |
| `getSholat` | Jadwal bulanan dari MyQuran | `&id=[id_kota]` |
| `getSurah` | Daftar indeks 114 Surah | - |
| `getAyatData` | Detail ayat per Surah (Sync) | `&surahId=[1-114]` |
| `findHadits` | Pencarian kata kunci 9 perawi | `&q=[kata_kunci]` |
| `searchByCoords` | Deteksi kota via GPS (koordinat) | `&lat=[lat]&lng=[lng]` |

### 📥 Contoh Output (JSON)
**Request**: `BASE_URL?action=getCalendar`
```json
{  
  "status": true,  
  "masehi": "Senin, 16 Maret 2026",  
  "hijri": "26 RAMADHAN 1447 H"  
}
```

## 📊 Roadmap & Pengembangan 2026  

Proyek ini terus dikembangkan untuk memberikan pengalaman ibadah digital yang paling komprehensif. Berikut adalah target pencapaian kami:  

- [x] **Phase 1**: Sinkronisasi Jam Digital Tanpa Jeda (*Instant Clock Engine*).  
- [x] **Phase 2**: Navigasi Dinamis Nama Surah (Labeling otomatis pada tombol navigasi).  
- [x] **Phase 3**: Koreksi Otomatis Kalender Hijriah via API Aladhan (Presisi Ramadhan).  
- [ ] **Phase 4**: Implementasi PWA (*Progressive Web App*) agar aplikasi dapat diinstal di Android/iOS.  
- [ ] **Phase 5**: Fitur Audio Murottal per ayat dengan integrasi pemutar audio yang ringan.  
- [ ] **Phase 6**: Sistem Bookmark lokal menggunakan `localStorage` untuk menandai bacaan terakhir.  

---

## 🤝 Kontribusi & Kolaborasi  

Kami sangat terbuka bagi siapa saja yang ingin berkontribusi dalam pengembangan syiar digital ini. Anda dapat membantu melalui:  

1. **Reporting Bug**: Laporkan masalah melalui kolom *Issues* di GitHub.  
2. **Feature Request**: Berikan ide fitur baru yang bermanfaat untuk umat.  
3. **Pull Requests**: Kirimkan optimasi kode atau perbaikan UI/UX Anda.  

### Tim Pengembang & Atribusi Data  

* **Lead Developer**: Sukslan Media  

* **API Providers**:  
  * [MyQuran API](https://api.myquran.com/) (Jadwal Sholat & Lokasi)  
  * [Aladhan API](https://aladhan.com/prayer-times-api) (Kalender Hijriah)  
  * [e-Quran.id](https://equran.id/) (Database Mushaf)  
  * [Cerminsiji Hadith-API](https://github.com/Cerminsiji/hadith-api) (Data Hadits 9 Perawi)
  * [Gadingnst Hadith-API](https://github.com/gadingnst/hadith-api) (Repo Penyedia Hadits 9 Perawi)

---

## 📜 Lisensi  

Proyek ini dilindungi di bawah **MIT License**.  

Artinya, Anda bebas menggunakan, menyalin, memodifikasi, dan mendistribusikan kode ini untuk tujuan komersial maupun non-komersial, selama Anda tetap menyertakan atribusi penulis asli.  

> **Disclaimer**: Konten agama (Al-Quran, Hadits, Doa) dalam aplikasi ini bersumber dari API publik. Pengguna disarankan untuk tetap merujuk pada Mushaf cetak atau bimbingan Guru/Ulama untuk pemahaman yang lebih mendalam.  

---

**Ngaji Digital Engine**  
*Versi 2.1.0-Ramadhan-Edition*  

**Last Build Date**: 16 Maret 2026  
**Status**: Stable Release
