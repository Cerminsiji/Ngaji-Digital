/**
 * NGAJI REK - CORE ENGINE
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action;
  checkAndInitSheets();

  if (action) {
    try {
      let result;
      switch(action) {
        case 'sync': result = flushAndSync(); break;
        case 'getSurah': result = getSheetData("DB_Surah"); break;
        case 'getDoa': result = getSheetData("DB_Doa"); break;
        case 'getTahlil': result = getSheetData("DB_Tahlil"); break;
        case 'getSholat': result = getJadwalByCityId(e.parameter.id); break;
        case 'getAyatData': result = fetchAyatFromAPI(e.parameter.surahId); break;
        case 'searchKota': 
          const query = e.parameter.q || "jakarta";
          result = callAPI(`https://api.myquran.com/v2/sholat/kota/cari/${query}`); 
          break;
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return HtmlService.createTemplateFromFile('index').evaluate()
         .setTitle('Ngaji Rek | Ramadhan 2026')
         .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSheetData(name) {
  const sheet = SS.getSheetByName(name);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const head = data.shift();
  return data.map(r => { let o={}; head.forEach((h,i)=>o[h]=r[i]); return o; });
}

function flushAndSync() {
  try {
    // 1. Sync Quran
    const resQ = callAPI("https://equran.id/api/v2/surat");
    if(resQ && resQ.data) {
      const rows = resQ.data.map(s => [s.nomor, s.namaLatin, s.nama, s.tempatTurun, s.jumlahAyat]);
      SS.getSheetByName("DB_Surah").clear().getRange(1,1,1,5).setValues([["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"]]);
      SS.getSheetByName("DB_Surah").getRange(2,1,rows.length,5).setValues(rows);
    }
    // 2. Sync Doa
    const resD = callAPI("https://api.myquran.com/v2/doa/semua");
    if(resD && resD.data) {
      const rows = resD.data.map(d => [d.judul, d.arab, d.indo]);
      SS.getSheetByName("DB_Doa").clear().getRange(1,1,1,3).setValues([["Judul","Arab","Terjemah"]]);
      SS.getSheetByName("DB_Doa").getRange(2,1,rows.length,3).setValues(rows);
    }
    // 3. Sync Tahlil
    const resT = callAPI("https://islamic-api-zhirrr.vercel.app/api/tahlil");
    if(resT && resT.data) {
      const rows = resT.data.map(t => [t.title, t.arabic, t.translation]);
      SS.getSheetByName("DB_Tahlil").clear().getRange(1,1,1,3).setValues([["Judul","Arab","Terjemah"]]);
      SS.getSheetByName("DB_Tahlil").getRange(2,1,rows.length,3).setValues(rows);
    }
    return {status: "success", message: "Sinkronisasi Berhasil!"};
  } catch (e) {
    return {status: "error", message: e.toString()};
  }
}

function callAPI(url) {
  if (!url) return { data: null };
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return JSON.parse(res.getContentText());
  } catch (e) { return { data: null }; }
}

function getJadwalByCityId(id) {
  const date = Utilities.formatDate(new Date(), "GMT+7", "yyyy/MM/dd");
  const res = callAPI(`https://api.myquran.com/v2/sholat/jadwal/${id}/${date}`);
  if(res && res.data) {
    const subuh = res.data.jadwal.subuh;
    const [h, m] = subuh.split(':').map(Number);
    let d = new Date(); d.setHours(h, m - 10, 0);
    res.data.jadwal.imsak = Utilities.formatDate(d, "GMT+7", "HH:mm");
  }
  return res;
}

function fetchAyatFromAPI(id) { 
  const res = callAPI(`https://equran.id/api/v2/surat/${id}`);
  return res ? res.data : null; 
}

function checkAndInitSheets() {
  const s = {"DB_Surah":["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"],"DB_Doa":["Judul","Arab","Terjemah"],"DB_Tahlil":["Judul","Arab","Terjemah"]};
  for (let n in s) { if(!SS.getSheetByName(n)) SS.insertSheet(n).getRange(1,1,1,s[n].length).setValues([s[n]]); }
}
