/** * NGAJI DIGITAL ENGINE 2.1.0-Ramadhan-Edition
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e ? e.parameter.action : "index";
  checkAndInitSheets();
  
  try {
    let result;
    switch(action) {
      case 'getCalendar': result = getCalendarData(); break;
      case 'getSholat': result = getJadwalBulan(e.parameter.id); break;
      case 'getSurah': result = getSheetData("DB_Surah"); break;
      case 'getAyatData': result = getAyatWithSync(e.parameter.surahId); break;
      case 'getTahlil': result = getSheetData("DB_Tahlil"); break;
      case 'getDoa': result = getDoaWithSync(); break;
      case 'findHadits': result = findHaditsGrouped(e.parameter.q, e.parameter.kitab); break;
      case 'searchByCoords': result = callAPI(`https://api.myquran.com/v2/sholat/kota/lokasi/${e.parameter.lat}/${e.parameter.lng}`); break;
      case 'searchKota': result = callAPI(`https://api.myquran.com/v2/sholat/kota/cari/${e.parameter.q}`); break;
      case 'getDailyInsight': result = getDailyInsight(); break;

      default: 
        return HtmlService.createTemplateFromFile('index').evaluate()
               .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
               .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
               .setTitle('Ngaji Digital 2026');
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: false, msg: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi untuk mengambil data kalender Masehi (Native) 
 * dan Hijriah (API Aladhan).
 */
function getCalendarData() { 
  try { 
    const now = new Date(); 

    const daysIndo = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const monthsIndo = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

    const masehiStr = `${daysIndo[now.getDay()]}, ${now.getDate()} ${monthsIndo[now.getMonth()]} ${now.getFullYear()}`;

    // OFFSET BISA DIATUR DI SINI
    const OFFSET = 0; // ← ubah ke -1 atau +1 kalau perlu penyesuaian Hilal dan Rukyat

    const adjusted = new Date(now);
    adjusted.setDate(now.getDate() + OFFSET);

    const url = `https://api.aladhan.com/v1/gToH/${adjusted.getDate()}-${adjusted.getMonth()+1}-${adjusted.getFullYear()}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const res = JSON.parse(response.getContentText());

    let hijriStr = "";

    if (res && res.data && res.data.hijri) {
      const h = res.data.hijri;

      const bulanH = {
        "Ramadan": "RAMADHAN",
        "Ramadān": "RAMADHAN",
        "Shawwal": "SYAWAL",
        "Shawwāl": "SYAWAL",
        "Dhu al-Qadah": "DZULQA'DAH",
        "Dhū al-Qi'dah": "DZULQA'DAH",
        "Dhu al-Hijjah": "DZULHIJJAH",
        "Dhū al-Ḥijjah": "DZULHIJJAH",
        "Muharram": "MUHARRAM",
        "Muḥarram": "MUHARRAM",
        "Safar": "SAFAR"
      };

      const namaBulanH = bulanH[h.month.en] || h.month.en.toUpperCase();
      hijriStr = `${h.day} ${namaBulanH} ${h.year} H`;

    } else {
      hijriStr = "Tanggal Hijriyah tidak tersedia";
    }

    return { status: true, masehi: masehiStr, hijri: hijriStr };

  } catch (e) { 
    return { status: false, msg: e.toString() };
  } 
}

function getDailyInsight() {
  const doas = getDoaWithSync();
  const rawi = ['Bukhari', 'Muslim', 'Tirmidzi'];
  const randomRawi = rawi[Math.floor(Math.random() * rawi.length)];
  const haditsData = getSheetData(randomRawi);
  
  return {
    status: true,
    doa: doas[Math.floor(Math.random() * doas.length)],
    hadits: haditsData.length > 0 ? haditsData[Math.floor(Math.random() * haditsData.length)] : null,
    rawi: randomRawi
  };
}

// Integrasi GPS dengan API MyQuran
function getCityByCoords(lat, lng) {
  const res = callAPI(`https://api.myquran.com/v2/sholat/kota/lokasi/${lat}/${lng}`);
  if (res && res.status) {
    return { status: true, data: res.data };
  }
  return { status: false, msg: "Lokasi tidak ditemukan" };
}


// FUNGSI PENDUKUNG LAINNYA 
function getAyatWithSync(surahId) {
  const sheetName = `Surah_${surahId}`;
  let sheet = SS.getSheetByName(sheetName);
  
  if (!sheet) {
    const res = callAPI(`https://equran.id/api/v2/surat/${surahId}`);
    if (res && res.data) {
      sheet = SS.insertSheet(sheetName);
      sheet.appendRow(['Nomor','Arab','Latin','Terjemah']);
      const rows = res.data.ayat.map(a => [a.nomorAyat, a.teksArab, a.teksLatin, a.teksIndonesia]);
      sheet.getRange(2, 1, rows.length, 4).setValues(rows);
      
      // KIRIM NAMA ASLI
      return { 
        status: true, 
        ayat: res.data.ayat, 
        nama: res.data.namaLatin.toUpperCase(), // Pastikan nama asli terkirim
        juz: res.data.ayat[0].juz 
      };
    }
  }
  
  // Jika mengambil dari Sheet, kita perlu tahu namanya. 
  // Solusi terbaik: Ambil nama dari daftar surah utama
  const listSurah = getSheetData("DB_Surah");
  const detailSurah = listSurah.find(s => s.id == surahId);
  const namaAsli = detailSurah ? detailSurah.nama : "SURAH " + surahId;

  const data = getSheetData(sheetName);
  return { 
    status: true, 
    ayat: data.map(d => ({ 
      nomorAyat: d.nomor, 
      teksArab: d.arab, 
      teksLatin: d.latin, 
      teksIndonesia: d.terjemah 
    })), 
    nama: namaAsli.toUpperCase(),
    juz: data[0] ? data[0].juz : "-"
  };
}

function getDoaWithSync() {
  let sheet = SS.getSheetByName("DB_Doa");
  let data = getSheetData("DB_Doa");
  if (data.length === 0) {
    const res = callAPI("https://open-api.my.id/api/doa");
    if (res && Array.isArray(res)) {
      const rows = res.map(d => [d.doa, d.ayat, d.artinya]);
      sheet.getRange(2, 1, rows.length, 3).setValues(rows);
      return getSheetData("DB_Doa");
    }
  }
  return data;
}

function findHaditsGrouped(q, kitab) {
  const query = q ? q.toLowerCase() : "";
  const results = {};
  const perawi = ['Bukhari','Muslim','Abu Daud','Ahmad','Tirmidzi','Darimi','Nasai','Ibnu Majah','Malik'];
  const target = (kitab && kitab !== 'Semua') ? [kitab] : perawi;
  target.forEach(name => {
    const sheet = SS.getSheetByName(name);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    const head = data[0].map(h => h.toString().toLowerCase().trim());
    const idxArab = head.indexOf('arab');
    const idxIndo = head.indexOf('indo') !== -1 ? head.indexOf('indo') : head.indexOf('terjemah');
    const matches = [];
    for(let i=1; i<data.length; i++){
      if (data[i].join(" ").toLowerCase().includes(query)) {
        matches.push({ no: data[i][0], arab: data[i][idxArab], indo: data[i][idxIndo] || "Terjemahan tidak tersedia", kitab: name });
      }
      if(matches.length > 1000) break;
    }
    if(matches.length > 0) results[name] = matches;
  });
  return results;
}

function getJadwalBulan(id) {
  const cityId = id || "1301";
  const now = new Date();
  const bln = now.getMonth() + 1;
  const thn = now.getFullYear();
  
  const sheet = SS.getSheetByName("DB_Sholat");
  const data = getSheetData("DB_Sholat");
  
  // Filter data dari Spreadsheet berdasarkan city_id, bulan, dan tahun
  const localData = data.filter(r => r.city_id == cityId && r.bulan == bln && r.tahun == thn);
  
  if (localData.length > 0) {
    return { status: true, data: { jadwal: localData } };
  }

  // Jika data tidak ada di Spreadsheet, tarik dari API
  const res = callAPI(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${thn}/${bln}`);
  if (res && res.data && res.data.jadwal) {
    // Simpan ke Spreadsheet agar kedepannya tidak call API lagi
    const rows = res.data.jadwal.map(j => [
      cityId, bln, thn, j.tanggal, j.imsak, j.subuh, j.terbit, j.dhuha, j.dzuhur, j.ashar, j.maghrib, j.isya
    ]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 12).setValues(rows);
    return { status: true, data: res.data };
  }
  
  return { status: false };
}

/**
 * Fungsi untuk mencicil data jadwal sholat selama 1 tahun.
 * Jalankan fungsi ini secara manual atau melalui trigger sekali saja.
 */
function syncYearlyJadwal(cityId, targetMonth) {
  const id = cityId || "1301";
  const year = 2026; // Sesuaikan tahun target
  const month = targetMonth || 1;
  
  if (month > 12) return console.log("Sinkronisasi selesai.");

  const res = callAPI(`https://api.myquran.com/v2/sholat/jadwal/${id}/${year}/${month}`);
  
  if (res && res.data && res.data.jadwal) {
    const sheet = SS.getSheetByName("DB_Sholat");
    const rows = res.data.jadwal.map(j => [
      id, month, year, j.tanggal, j.imsak, j.subuh, j.terbit, j.dhuha, j.dzuhur, j.ashar, j.maghrib, j.isya
    ]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 12).setValues(rows);
    
    console.log(`Berhasil menyimpan data bulan ${month}`);
    
    // Gunakan Utilities.sleep atau Trigger untuk melanjutkan ke bulan berikutnya secara bertahap
    // Agar lebih aman dari timeout, kita panggil fungsi ini lagi dengan delay kecil
    Utilities.sleep(2000); 
    syncYearlyJadwal(id, month + 1);
  }
}


function getSheetData(name) {
  const sheet = SS.getSheetByName(name);
  if(!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  const head = data.shift();
  return data.map(r => {
    let o = {};
    head.forEach((h, i) => { o[h.toString().toLowerCase().trim()] = r[i]; });
    return o;
  });
}

function callAPI(url) {
  try { return JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText()); } catch (e) { return null; }
}

function autoUpdateJadwalSholat() {
  const now = new Date();
  const thn = now.getFullYear();
  const bln = now.getMonth() + 1; // Bulan berjalan
  
  // Ambil daftar ID Kota yang ingin di-update otomatis.
  // Anda bisa mengisinya dengan ID kota yang paling sering digunakan (Default: 1301 untuk Jakarta)
  const daftarKota = ["1301"]; 

  const sheet = SS.getSheetByName("DB_Sholat");
  if (!sheet) return;

  daftarKota.forEach(cityId => {
    // Cek apakah data untuk bulan ini sudah ada agar tidak double
    const existingData = getSheetData("DB_Sholat");
    const isExist = existingData.some(r => r.city_id == cityId && r.bulan == bln && r.tahun == thn);

    if (!isExist) {
      const res = callAPI(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${thn}/${bln}`);
      if (res && res.data && res.data.jadwal) {
        const rows = res.data.jadwal.map(j => [
          cityId, bln, thn, j.tanggal, j.imsak, j.subuh, j.terbit, j.dhuha, j.dzuhur, j.ashar, j.maghrib, j.isya
        ]);
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 12).setValues(rows);
        console.log(`Auto-Update Berhasil: Kota ${cityId} Bulan ${bln}`);
      }
    }
  });
}  

function checkAndInitSheets() {
  const sheets = ["DB_Surah", "DB_Tahlil", "DB_Doa", "DB_Sholat", "Bukhari", "Muslim", "Abu Daud", "Ahmad", "Tirmidzi", "Darimi", "Nasai", "Ibnu Majah", "Malik"];
  sheets.forEach(n => { 
    if(!SS.getSheetByName(n)) {
      const sheet = SS.insertSheet(n);
      // Header khusus untuk DB_Sholat
      if (n === "DB_Sholat") {
        sheet.appendRow(['city_id', 'bulan', 'tahun', 'tanggal', 'imsak', 'subuh', 'terbit', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya']);
      } else {
        sheet.appendRow(['id','arab','indo']); 
      }
    }
  });
}
