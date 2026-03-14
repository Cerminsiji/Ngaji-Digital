/** * Ngaji Digital Backend - Final Optimized 2026
 * Perbaikan: Filter Perawi, Kalender Hijriah, & Inisialisasi Sheet
 */ 
const SS = SpreadsheetApp.getActiveSpreadsheet(); 

function doGet(e) { 
  const action = e ? e.parameter.action : null; 
  checkAndInitSheets(); // Memastikan sheet database tersedia
  
  if (action) { 
    try { 
      let result; 
      switch(action) { 
        case 'getCalendar': result = getCalendarUNISA(); break; 
        case 'getSholat': result = getJadwalByCityId(e.parameter.id); break; 
        case 'getSurah': result = getSheetData("DB_Surah"); break; 
        case 'getDoa': result = getSheetData("DB_Doa"); break; 
        case 'getTahlil': result = getSheetData("DB_Tahlil"); break; 
        case 'getAyatData': result = fetchAyatFromAPI(e.parameter.surahId); break; 
        case 'findHadits': result = findHaditsLokal(e.parameter.q, e.parameter.kitab); break;
        case 'findDoa': result = findInSheets(['DB_Doa'], e.parameter.q); break;
        case 'searchKota': result = callAPI(`https://api.myquran.com/v2/sholat/kota/cari/${encodeURIComponent(e.parameter.q || "jakarta")}`); break; 
        case 'sync': result = flushAndSync(); break; 
        default: result = {status: false, message: "Aksi tidak dikenal"}; 
      } 
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON); 
    } catch (err) { 
      return ContentService.createTextOutput(JSON.stringify({status: false, message: err.toString()})).setMimeType(ContentService.MimeType.JSON); 
    } 
  } 
  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Ngaji Digital 2026'); 
} 

function getCalendarUNISA() { 
  try { 
    const now = new Date(); 
    const url = `https://service.unisayogya.ac.id/kalender/api/masehi2hijriah/muhammadiyah/${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`; 
    const res = callAPI(url); 
    const masehiStr = Utilities.formatDate(now, "GMT+7", "EEEE, dd MMM yyyy");
    let hijriStr = "19 Ramadhan 1447 H";
    if (res && res.hijriah) { hijriStr = res.hijriah; }
    return { status: true, masehi: masehiStr, hijri: hijriStr }; 
  } catch (e) { 
    return { status: true, masehi: "Sabtu, 14 Maret 2026", hijri: "19 Ramadhan 1447 H" }; 
  } 
} 

function findHaditsLokal(query, filterKitab) {
  if (!query || query.length < 3) return { status: false, data: [] };
  const allKitab = ['Abu Daud', 'Ahmad', 'Bukhari', 'Darimi', 'Ibnu Majah', 'Malik', 'Muslim', 'Nasai', 'Tirmidzi'];
  let targetKitab = (filterKitab === "Semua" || !filterKitab) ? allKitab : [filterKitab];
  
  let results = [];
  const q = query.toLowerCase();

  targetKitab.forEach(nama => {
    const sheet = SS.getSheetByName(nama);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        data.shift();
        const filtered = data.filter(r => (r[3] && r[3].toString().toLowerCase().includes(q)) || (r[1] && r[1].toString().toLowerCase().includes(q)))
        .map(r => ({ kitab: nama, nomor: r[0], judul: r[1], arab: r[2], indo: r[3] }));
        results = results.concat(filtered);
      }
    }
  });
  return { status: true, data: results.slice(0, 50) };
}

function findInSheets(sheets, query) {
  let results = [];
  const q = query.toLowerCase();
  sheets.forEach(name => {
    const sheet = SS.getSheetByName(name);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      data.shift();
      const filtered = data.filter(r => r[0].toString().toLowerCase().includes(q) || (r[2] && r[2].toString().toLowerCase().includes(q)))
      .map(r => ({ judul: r[0], arab: r[1], indo: r[2] }));
      results = results.concat(filtered);
    }
  });
  return { status: true, data: results };
}

function getJadwalByCityId(id) { 
  const cityId = id || "1301"; 
  const d = Utilities.formatDate(new Date(), "GMT+7", "yyyy/MM/dd"); 
  const res = callAPI(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${d}`); 
  return (res && res.data) ? { status: true, data: { jadwal: res.data.jadwal } } : { status: false }; 
}

function getSheetData(name) { 
  const sheet = SS.getSheetByName(name); 
  if(!sheet || sheet.getLastRow() < 2) return []; 
  const data = sheet.getDataRange().getValues(); 
  const head = data.shift(); 
  return data.map(r => { let o = {}; head.forEach((h, i) => { o[h] = r[i]; }); return o; }); 
}

function flushAndSync() { 
  try { 
    const resQ = callAPI("https://equran.id/api/v2/surat"); 
    if(resQ && resQ.data) { 
      const rows = resQ.data.map(s => [s.nomor, s.namaLatin, s.nama, s.tempatTurun, s.jumlahAyat]); 
      SS.getSheetByName("DB_Surah").clear().getRange(1,1,1,5).setValues([["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"]]); 
      SS.getSheetByName("DB_Surah").getRange(2,1,rows.length,5).setValues(rows); 
    } 
    return {status: true, message: "Sinkronisasi Berhasil!"}; 
  } catch (e) { return {status: false, message: e.toString()}; } 
} 

function callAPI(url) { 
  try { return JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true, timeoutInSeconds: 15 }).getContentText()); } catch (e) { return null; } 
}

function fetchAyatFromAPI(id) { 
  const res = callAPI(`https://equran.id/api/v2/surat/${id}`); 
  return res ? res.data : null; 
}

function checkAndInitSheets() { 
  const s = {"DB_Surah":["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"],"DB_Doa":["Judul","Arab","Terjemah"],"DB_Tahlil":["Judul","Arab","Terjemah"]}; 
  for (let n in s) { 
    if(!SS.getSheetByName(n)) { 
      SS.insertSheet(n).getRange(1, 1, 1, s[n].length).setValues([s[n]]); 
    } 
  } 
}
