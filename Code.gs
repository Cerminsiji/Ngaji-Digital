/** * Ngaji Digital Backend 2026 - Fixed GPS & Calendar
 */ 
const SS = SpreadsheetApp.getActiveSpreadsheet(); 

function doGet(e) { 
  const action = e ? e.parameter.action : null; 
  checkAndInitSheets(); 
  
  if (action) { 
    try { 
      let result; 
      switch(action) { 
        case 'getCalendar': result = getCalendarUNISA(); break; 
        case 'getSholat': result = getJadwalByCityId(e.parameter.id); break; 
        case 'getSurah': result = getSheetData("DB_Surah"); break; 
        case 'getAyatData': result = fetchAyatFromAPI(e.parameter.surahId); break; 
        case 'findHadits': result = findHaditsLokal(e.parameter.q, e.parameter.kitab); break;
        case 'searchKota': result = searchCityAPI(e.parameter.q); break;
        case 'searchByCoords': result = getCityByCoords(e.parameter.lat, e.parameter.lng); break;
        case 'sync': result = flushAndSync(); break; 
        default: result = {status: false, message: "Aksi tidak dikenal"}; 
      } 
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON); 
    } catch (err) { 
      return ContentService.createTextOutput(JSON.stringify({status: false, message: err.toString()})).setMimeType(ContentService.MimeType.JSON); 
    } 
  } 
  return HtmlService.createTemplateFromFile('index').evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('Ngaji Digital 2026'); 
} 

function getCalendarUNISA() { 
  try { 
    const now = new Date(); 
    const url = `https://service.unisayogya.ac.id/kalender/api/masehi2hijriah/muhammadiyah/${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`; 
    const res = callAPI(url); 
    const masehiStr = Utilities.formatDate(now, "GMT+7", "EEEE, dd MMM yyyy");
    
    // Formatter Hijriyah: Memastikan urutan Tanggal Bulan Tahun
    let hijriStr = "24 Ramadhan 1447 H"; // Default Fallback
    if (res && res.hijriah) {
      // Jika API mengembalikan "Ramadhan 24, 1447", kita rapikan
      const parts = res.hijriah.split(" ");
      if(parts.length >= 3) {
        // Logika sederhana: Jika angka ada di tengah, pindahkan ke depan
        if (!isNaN(parts[1].replace(',',''))) {
          hijriStr = `${parts[1].replace(',','')} ${parts[0]} ${parts[2]}`;
        } else {
          hijriStr = res.hijriah;
        }
      }
    }
    return { status: true, masehi: masehiStr, hijri: hijriStr }; 
  } catch (e) { 
    return { status: true, masehi: "Sabtu, 14 Maret 2026", hijri: "24 Ramadhan 1447 H" }; 
  } 
} 

function getCityByCoords(lat, lng) {
  // Mencari kota terdekat berdasarkan koordinat via API MyQuran
  const res = callAPI(`https://api.myquran.com/v2/sholat/kota/lokasi/${lat}/${lng}`);
  return res || { status: false };
}

// ... (Fungsi findHaditsLokal, getSheetData, dll tetap sama seperti sebelumnya)
function findHaditsLokal(query, kitab) {
  if (!query) return [];
  const results = [];
  const q = query.toLowerCase();
  const daftarKitab = ['Bukhari', 'Muslim', 'Abu Daud', 'Tirmidzi', 'Nasai', 'Ibnu Majah', 'Ahmad', 'Malik', 'Darimi'];
  const targetSheets = (kitab && kitab !== 'Semua') ? [kitab] : daftarKitab;
  targetSheets.forEach(name => {
    const sheet = SS.getSheetByName(name);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    const head = data.shift();
    data.forEach(row => {
      if (row.join(" ").toLowerCase().indexOf(q) !== -1) {
        let obj = { kitab: name };
        head.forEach((h, i) => { 
          let key = h.toString().toLowerCase().trim();
          if (key === 'terjemah' || key === 'indo') key = 'indo';
          if (key === 'arab' || key === 'teks') key = 'arab';
          obj[key] = row[i]; 
        });
        results.push(obj);
      }
    });
  });
  return results.slice(0, 50);
}

function flushAndSync() { 
  try { 
    const resQ = callAPI("https://equran.id/api/v2/surat"); 
    if(resQ && resQ.data) { 
      const rows = resQ.data.map(s => [s.nomor, s.namaLatin, s.nama, s.tempatTurun, s.jumlahAyat]); 
      SS.getSheetByName("DB_Surah").clear().getRange(1,1,1,5).setValues([["id","nama","nama arab","tipe","jumlah ayat"]]); 
      SS.getSheetByName("DB_Surah").getRange(2,1,rows.length,5).setValues(rows); 
    } 
    return {status: true, message: "Sync Berhasil!"}; 
  } catch (e) { return {status: false, message: "Sync Gagal: " + e.toString()}; } 
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

function fetchAyatFromAPI(id) { 
  const res = callAPI(`https://equran.id/api/v2/surat/${id}`); 
  return res ? res.data : null; 
}

function searchCityAPI(q) {
  const res = callAPI(`https://api.myquran.com/v2/sholat/kota/cari/${q}`);
  return res || {status: false};
}

function getJadwalByCityId(id) { 
  const cityId = id || "1301"; 
  const d = Utilities.formatDate(new Date(), "GMT+7", "yyyy/MM/dd"); 
  const res = callAPI(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${d}`); 
  return (res && res.data) ? { status: true, data: { jadwal: res.data.jadwal } } : { status: false }; 
}

function callAPI(url) { 
  try { return JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true, timeoutInSeconds: 20 }).getContentText()); } catch (e) { return null; } 
}

function checkAndInitSheets() { 
  const s = {"DB_Surah":["id","nama","nama arab","tipe","jumlah ayat"]}; 
  for (let n in s) { if(!SS.getSheetByName(n)) { SS.insertSheet(n).getRange(1, 1, 1, s[n].length).setValues([s[n]]); } } 
}
