# 🌙 NGAJI DIGITAL

**NGAJI DIGITAL** adalah ekosistem aplikasi ibadah berbasis web yang memanfaatkan **Google Apps Script (GAS)** sebagai *Backend-as-a-Service* (BaaS) dan API Gateway. Aplikasi ini mengintegrasikan database hadits lokal yang masif, jadwal sholat real-time, dan Mushaf Al-Quran dalam antarmuka *glassmorphism* yang elegan dan responsif.

### 🔗 Live Preview
Coba aplikasi secara langsung: 👉 **[https://cerminsiji.github.io/Ngaji/](https://cerminsiji.github.io/Ngaji/)**

---

## ✨ Fitur Utama
* **API Gateway & Headless CMS:** Menggunakan Google Sheets sebagai database utama untuk data Doa, Tahlil, dan Hadits yang bisa diakses publik melalui endpoint GAS.
* **Multi-Perawi Hadits:** Pencarian pintar di 9 kitab perawi hadits besar secara lokal (*offline-first logic*) tanpa bergantung pada API eksternal setelah sinkronisasi.
* **Jadwal Sholat & GPS:** Integrasi API MyQuran dengan deteksi lokasi otomatis atau pemilihan kota manual di seluruh Indonesia.
* **Al-Quran Digital:** Teks Arab menggunakan *Amiri Font*, terjemahan lengkap, dan integrasi API e-Quran.
* **Sync Ecosystem:** Sinkronisasi data sekali klik untuk memindahkan data API publik ke database pribadi (Google Spreadsheet).

---

## 🛠️ Arsitektur Kode & File

### 1. `Code.gs` (Backend & API Gateway)
File ini berfungsi sebagai otak aplikasi yang menangani permintaan HTTP.
* **Fungsi `doGet(e)`:** Menangkap permintaan dari Frontend melalui parameter `action`.
* **Routing Logic:** Mengatur alur data apakah harus mengambil dari Google Sheets (Internal) atau melakukan *fetch* ke API pihak ketiga (External).
* **Security:** Menggunakan `ContentService` untuk menghasilkan respon JSON yang aman bagi CORS.

### 2. `index.html` (Frontend & Client Logic)
Antarmuka pengguna yang dibangun dengan HTML5, Tailwind CSS, dan Vanilla JS.
* **Integrasi API:** Menggunakan konstanta global untuk berkomunikasi dengan backend:
    ```javascript
    const API = "[https://script.google.com/macros/s/AKfycbwQnpc4W4tWJGff65X0aj11yfnJ7eXQCac590phW-aH_DSLZmLW3hS_347pixqWAmJD/exec](https://script.google.com/macros/s/AKfycbwQnpc4W4tWJGff65X0aj11yfnJ7eXQCac590phW-aH_DSLZmLW3hS_347pixqWAmJD/exec)";
    ```
* **State Management:** Mengelola cache lokasi (GPS) dan preferensi tampilan (font size) secara lokal di browser pengguna.

### 3. `HaditsImporter.gs` (Database Seeder)
Skrip khusus yang digunakan untuk mengisi (*seeding*) database hadits secara massal.
* **Fungsi `importHadits()`:** Melakukan *looping* permintaan ke repositori hadits eksternal.
* **Memory Management:** Memproses data dalam bentuk array besar sebelum menulis ke Sheets (`setValues`) guna meminimalisir penggunaan kuota tulis Google.

---

## 📡 Dokumentasi API Gateway

Script `Code.gs` bertindak sebagai fasilitator antara klien dan database. Kami menggunakan metode **CORS-friendly GET request**.

* **Base URL:** `https://script.google.com/macros/s/AKfycbwQnpc4W4tWJGff65X0aj11yfnJ7eXQCac590phW-aH_DSLZmLW3hS_347pixqWAmJD/exec`

| Action | Parameter | Deskripsi | Sumber Data |
| :--- | :--- | :--- | :--- |
| `getCalendar` | - | Data penanggalan Hijriah & Masehi. | UNISA API (Proxy) |
| `getSholat` | `id` | Jadwal harian berdasarkan kode kota. | MyQuran API |
| `getSurah` | - | Daftar 114 surah di database. | DB Internal |
| `findHadits` | `q`, `kitab` | Pencarian teks hadits (regex filter). | Multi-Sheet Hadits 
| `sync` | - | Menarik data API external ke Sheets. | API e-Quran |

---

## ⚙️ Logika Sinkronisasi Data

Kami menggunakan skrip `HaditsImporter.gs` untuk melakukan *seeding* data hadits dari repositori [Hadith-API Gadingnst](https://github.com/gadingnst/hadith-api/tree/master/books).

* **Metode Kontrol:** Menggunakan `UrlFetchApp` dengan penanganan limitasi Google. Data ditarik dalam format JSON, lalu dipetakan (*mapping*) ke dalam array 2D.
* **Optimasi Write:** Data dimasukkan ke Spreadsheet menggunakan fungsi `setValues()` secara sekaligus (*batch*) per kitab untuk menghindari batas waktu eksekusi skrip (limitasi 6 menit dari Google).
* **Data Flow:** `API External` ➡️ `Apps Script Logic` ➡️ `Google Sheets (Storage)` ➡️ `Client API Gateway`.

---

## 🚀 Persiapan & Setup Step-by-Step

### 1. Persiapan Database (Google Sheets)
* Buat Spreadsheet baru di Google Sheets.
* Buat sheet manual dengan nama perawi secara spesifik (**Wajib Persis**): `Bukhari`, `Muslim`, `Abu Daud`, `Ahmad`, `Darimi`, `Ibnu Majah`, `Malik`, `Nasai`, `Tirmidzi`.
* Kolom wajib untuk setiap sheet tersebut: `Nomor`, `Judul`, `Arab`, `Indonesia`.

### 2. Konfigurasi Backend
* Salin kode **Code.gs** dan **HaditsImporter.gs** ke editor Apps Script Anda.
* Jalankan fungsi `checkAndInitSheets()` untuk otomatisasi pembuatan sheet sistem lainnya (`DB_Surah`, `DB_Doa`, `DB_Tahlil`).

### 3. Deployment sebagai API
* Pilih **New Deployment** > **Web App**.
* Setel **Execute as:** `Me`.
* Setel **Who has access:** `Anyone`. (Langkah ini krusial agar Apps Script bisa merespons permintaan dari frontend GitHub Pages).
* Salin URL Web App yang dihasilkan dan tempelkan ke variabel `API` di file `index.html`.

---

## 📥 Sinkronisasi Data
Setelah setup selesai, lakukan langkah ini untuk mengisi database pertama kali:
1.  Buka aplikasi web Anda melalui browser.
2.  Masuk ke menu **Sync (Tombol 🔄)** di navigasi bawah.
3.  Klik **Mulai Sinkronisasi**. Script akan menarik data Al-Quran dari API eksternal dan menyimpannya ke Spreadsheet Anda. Kini aplikasi Anda memiliki database mandiri yang stabil!

---

## 🤝 Kontribusi & Lisensi
Kami sangat menghargai kontribusi dari komunitas untuk memperkaya fitur **Ngaji Digital 2026**.
1.  **Fork** repositori ini.
2.  Buat fitur baru: `git checkout -b fitur/NamaFitur`.
3.  Kirim **Pull Request** setelah melakukan testing pada skrip GAS Anda.

### **Lisensi**
Proyek ini dilisensikan di bawah **MIT License**.

### **Atribusi Data**
* **Al-Quran:** [e-Quran.id](https://equran.id/)
* **Hadits:** [Gadingnst Hadith API](https://github.com/gadingnst/hadith-api)
* **Jadwal Sholat:** [MyQuran API](https://api.myquran.com/)
* **Kalender:** UNISA Yogyakarta (Metode Muhammadiyah).

---

## ⚠️ Disclaimer
Aplikasi ini ditujukan untuk tujuan edukasi dan membantu ibadah harian selama Ramadhan 2026. Kami tidak bertanggung jawab atas ketidakakuratan data waktu sholat jika terjadi gangguan pada provider API atau keterlambatan sinkronisasi. Selalu lakukan sinkronisasi ulang secara berkala untuk memastikan integritas data.

---
**Versi:** 2.1.0-Ramadhan-Edition  
**Author:** [SukslanMedia]
