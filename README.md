# 🌙 NGAJI DIGITAL 2026 - Ramadhan Edition

**Ngaji Digital** adalah ekosistem aplikasi ibadah modern berbasis web yang menggabungkan estetika *glassmorphism* dengan keandalan **Google Apps Script (GAS)** sebagai *Backend-as-a-Service* (BaaS). Aplikasi ini dirancang untuk memenuhi kebutuhan spiritual digital dengan akses cepat ke Al-Quran, Hadits 9 Rawi, dan Jadwal Sholat presisi.

## 🔗 Live Preview
Nikmati pengalaman ibadah digital di sini:  
👉 [https://cerminsiji.github.io/Ngaji-Digital/](https://cerminsiji.github.io/Ngaji-Digital/)

---

## ✨ Fitur Utama

* **Mushaf Al-Quran Sync**: Integrasi API e-Quran.id dengan sistem *Local Sync* ke Google Sheets untuk akses data yang lebih stabil.
* **Search Engine Hadits 9 Rawi**: Pencarian lintas 9 perawi besar (Bukhari, Muslim, Abu Daud, dll.) dengan filter kitab yang dinamis.
* **Jadwal Sholat & Geolocation**: Deteksi otomatis koordinat lokasi via GPS untuk akurasi waktu sholat di seluruh Indonesia.
* **Kalender Hijriah Akurat**: Sinkronisasi penanggalan Hijriah menggunakan metode Muhammadiyah (via API UNISA Yogyakarta).
* **Tahlil & Doa Digital**: Dilengkapi dengan teks Arab, Latin, dan terjemahan Indonesia untuk kebutuhan dzikir harian.

---

## 🛠️ Arsitektur Sistem

### 1. Backend (`Code.gs`)
Inti dari aplikasi yang menangani permintaan API.
* **Routing**: Mengelola parameter `action` (getSurah, getSholat, findHadits, dll).
* **Automated Sync**: Secara otomatis membuat sheet baru jika data surah belum tersedia di database lokal.

### 2. Frontend (`index.html`)
Dibangun dengan teknologi modern:
* **Tailwind CSS**: Untuk antarmuka yang elegan dan responsif.
* **Vanilla JavaScript**: Logika aplikasi ringan tanpa ketergantungan *library* pihak ketiga yang berat.

### 3. Database Seeders (`HaditsImporter.gs` & `ImportTahlil.gs`)
* **Batch Seeding**: Mengimpor ribuan baris data hadits secara efisien tanpa menyebabkan *timeout* pada server Google.
* **Sheet Automation**: Menginisialisasi struktur kolom dan format sel secara otomatis.

---

## 🚀 Panduan Instalasi (Step-by-Step)

### 1. Setup Database
1.  Buat **Google Spreadsheet** baru.
2.  Buka **Extensions > Apps Script**.
3.  Salin dan tempel kode dari `Code.gs`, `HaditsImporter.gs`, dan `ImportTahlil.gs`.

### 2. Inisialisasi Data
1.  Jalankan fungsi `setupDatabaseTahlil()` di editor Apps Script untuk mengisi data Tahlil.
2.  Jalankan fungsi `jalankanImportHaditsLengkap()` untuk menarik data hadits (pastikan koneksi stabil).

### 3. Deploy API
1.  Klik **Deploy > New Deployment**.
2.  Pilih **Web App**.
3.  Setel *Execute as*: **Me** dan *Who has access*: **Anyone**.
4.  Salin **Web App URL** yang muncul.

### 4. Konfigurasi Frontend
1.  Buka file `index.html`.
2.  Cari variabel `const API` dan ganti dengan URL Web App Anda.
3.  Upload file `index.html` ke GitHub Pages atau hosting pilihan Anda.

---

## 📡 Endpoint API Gateway
Backend Anda mendukung *endpoint* berikut:

| Action | Deskripsi |
| :--- | :--- |
| `getCalendar` | Mendapatkan info tanggal Masehi & Hijriah. |
| `getSholat` | Mengambil jadwal sholat bulanan (parameter `id` kota). |
| `getSurah` | Mengambil daftar 114 Surah. |
| `findHadits` | Mencari hadits berdasarkan kata kunci (parameter `q` & `kitab`). |
| `getTahlil` | Mengambil urutan bacaan Tahlil lengkap. |

---

## 🤝 Kontribusi & Lisensi
Kami menyambut baik kontribusi untuk pengembangan fitur seperti *Bookmark* ayat atau *Audio Murrotal*. 
* **Lisensi**: MIT License.
* **Atribusi**: Data bersumber dari MyQuran API, e-Quran.id, dan Hadith-API Gadingnst.

---
**Versi**: 2.1.0-Ramadhan-Edition  
**Author**: [SukslanMedia]
