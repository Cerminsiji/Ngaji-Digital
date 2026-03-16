# 🌙 NGAJI DIGITAL ENGINE v2.1.0 (Ramadhan Edition)

[![GAS](https://img.shields.io/badge/Backend-Google%20Apps%20Script-emerald?style=for-the-badge&logo=google-apps-script)](https://script.google.com/)
[![Tailwind](https://img.shields.io/badge/Frontend-Tailwind%20CSS-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-Google%20Sheets-green?style=for-the-badge&logo=google-sheets)](https://www.google.com/sheets/about/)
[![Version](https://img.shields.io/badge/Version-2.1.0--Ramadhan-orange?style=for-the-badge)](#)

**Ngaji Digital Engine** adalah ekosistem aplikasi ibadah modern yang mentransformasikan Google Sheets menjadi *High-Performance Headless CMS*. Dengan arsitektur *Hybrid-Sync*, aplikasi ini menjamin kecepatan akses data Al-Quran, Hadits, dan jadwal sholat dengan beban server minimal melalui sistem caching otomatis.

---

## 🔗 Live Preview
Nikmati pengalaman ibadah digital di sini:  
👉 [https://cerminsiji.github.io/Ngaji-Digital/](https://cerminsiji.github.io/Ngaji-Digital/)

---

## ✨ Fitur Unggulan v2.1.0

* **⚡ Instant-Load Clock Engine**: Jam digital berjalan secara *native* di sisi klien menggunakan JavaScript sistem, memastikan waktu muncul seketika tanpa menunggu respon API.
* **📅 Adjusted Hijri Calendar**: Integrasi API Aladhan dengan logika kompensasi `-1 hari` untuk akurasi kalender Hijriah lokal Indonesia (Contoh 26 Ramadhan 1447 H).
* **📖 On-Demand Quran Caching**: Mekanisme otomatis yang memindahkan data ayat dari API `equran.id` ke Spreadsheet hanya saat surah diakses pertama kali, menghemat trafik data di masa depan.
* **🔍 Optimized Hadith Search**: Pencarian lintas 9 perawi besar (Bukhari, Muslim, dll) yang diproses secara efisien di sisi server Google dengan proteksi *timeout*.
* **📦 Smart Bulk Importer**: Modul khusus untuk mengimpor ribuan baris data hadits secara bertahap (*batching*) guna menghindari batasan limit eksekusi Google Apps Script.

---

## 🛠️ Arsitektur & Teknologi

### 1. Backend Service (`Code.gs`)
Berfungsi sebagai API Gateway yang menangani routing permintaan data:
* **Action Handler**: Mengelola permintaan `getCalendar`, `getSholat`, `getSurah`, hingga pencarian Hadits.
* **Auto-Init**: Membangun struktur tabel secara otomatis jika lembar kerja Spreadsheet masih kosong.

### 2. Frontend App (`index.html`)
Antarmuka pengguna berbasis Web:
* **UI Framework**: Tailwind CSS dengan tema *Dark Emerald Glassmorphism*.
* **Performance**: Menggunakan `Promise.all` untuk pemuatan data asinkron agar UI tidak membeku saat mengambil jadwal sholat.
* **UX**: Navigasi antar surah yang cerdas, menampilkan label nama surah sebelumnya dan berikutnya secara dinamis.

### 3. Data Injection Modules (Importers)
* **`ImportSurah.gs`**: Mengotomatisasi pembuatan 114 sheet surah lengkap dengan teks Arab, Latin, dan Terjemah.
* **`ImportHadits.gs`**: Algoritma cerdas yang mengunduh ribuan hadits dari JSON eksternal dan mencicil penyimpanannya per 500 baris menggunakan `SpreadsheetApp.flush()`.
* **`ImportTahlil.gs`**: Modul injeksi konten statis untuk tahlil dan doa-doa pendek.



---

## 🚀 Panduan Setup & Deployment

### Langkah 1: Persiapan Spreadsheet
1.  Buat Google Sheets baru.
2.  Buka **Extensions > Apps Script**.
3.  Salin isi file `Code.gs` ke editor Apps Script.
4.  Buat file baru di editor bernama `index.html` dan tempel isi file `Index.html`.

### Langkah 2: Injeksi Data (Import Awal)
Tambahkan file script baru (misal: `ImportTools.gs`) dan masukkan kode dari 3 file Import Anda. Jalankan fungsi berikut di editor secara berurutan:
1.  `setupDatabaseTahlil()`: Untuk mengisi data tahlil.
2.  `bulkSyncAllSurah()`: Untuk menarik data 114 Surah.
3.  `jalankanImportHaditsLengkap()`: Untuk mengunduh database 9 perawi Hadits.

### Langkah 3: Deploy Web App
1.  Klik **Deploy > New Deployment**.
2.  Pilih type **Web App**.
3.  Execute as: **Me**, Who has access: **Anyone**.
4.  Salin URL yang diberikan oleh Google.
5.  Cari variabel `const API` di file `index.html` (bagian script) dan ganti dengan URL Web App Anda.

---

## 📡 Endpoint API Gateway

Sistem ini mendukung akses data via parameter URL:

| Parameter | Fungsi | Sumber Data |
| :--- | :--- | :--- |
| `?action=getCalendar` | Penanggalan Masehi & Hijriah | Aladhan API (Adjusted) |
| `?action=getSholat&id=xxx` | Jadwal sholat bulanan | MyQuran v2 API |
| `?action=getSurah` | Daftar indeks 114 Surah | Local Sheet `DB_Surah` |
| `?action=findHadits&q=xxx` | Pencarian teks hadits | Local Sheets (9 Rawi) |
| `?action=getTahlil` | Bacaan tahlil lengkap | Local Sheet `DB_Tahlil` |



---

## 📊 Roadmap 2026
- [x] Sinkronisasi Jam Digital Tanpa Jeda (*Instant Clock*).
- [x] Navigasi Dinamis Nama Surah (Labeling).
- [x] Koreksi Otomatis H-1 Hijriah.
- [ ] Implementasi PWA (Progressive Web App) untuk akses offline.
- [ ] Penambahan Fitur Audio Murottal per Ayat.

---

## 🤝 Kontribusi & Lisensi
Kontribusi terbuka bagi siapa saja yang ingin mengembangkan syiar digital ini.
* **Author**: Sukslan Media
* **Atribusi Data**: MyQuran API, Aladhan API, e-Quran.id, Cerminsiji Hadith-API.
* **Lisensi**: MIT License

**Versi**: 2.1.0-Ramadhan-Edition  
**Update Build Date**: 16 Maret 2026
