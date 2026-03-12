/**
 * NGAJI PRO - ULTRA STABLE ENGINE
 * Fitur: Quran, Hadits Search, Doa, Tahlil, Jadwal Sholat
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action;
  checkAndInitSheets();

  try {
    if (action) {
      let result;
      switch(action) {
        case 'syncSemua': result = syncSemuaData(); break;
        case 'getSurahList': result = fetchFromSheet("DB_Surah"); break;
        case 'getAyatData': result = fetchAyatFromAPI(e.parameter.surahId); break;
        case 'getPerawi': result = fetchFromSheet("DB_Perawi"); break;
        case 'getDoa': result = fetchFromSheet("DB_Internal_Store"); break;
        case 'getTahlil': result = fetchTahlilData(); break;
        case 'getSholat': result = getJadwalByCityId(e.parameter.id); break;
        case 'searchKota': result = callAPI(`https://api.myquran.com/v2/sholat/kota/cari/${e.parameter.q}`); break;
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createTemplateFromFile('index').evaluate()
         .setTitle('Ngaji Pro | Full Edition')
         .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

// --- SYNC SEMUA DATA KE SPREADSHEET ---
function syncSemuaData() {
  const log = {};

  // 1. Sync Quran
  const resQ = callAPI("https://equran.id/api/v2/surat");
  if (resQ && resQ.data) {
    const rowsQ = resQ.data.map(s => [s.nomor, s.namaLatin, s.nama, s.tempatTurun, s.jumlahAyat]);
    SS.getSheetByName("DB_Surah").clear().getRange(1,1,1,5).setValues([["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"]]);
    SS.getSheetByName("DB_Surah").getRange(2,1,rowsQ.length,5).setValues(rowsQ);
    log.quran = rowsQ.length;
  }

  // 2. Sync Doa (API Cadangan MyQuran)
  const resD = callAPI("https://api.myquran.com/v2/doa/semua");
  if (resD && resD.data) {
    const rowsD = resD.data.map(d => [d.judul, d.arab, d.indo, "Kemenag"]);
    SS.getSheetByName("DB_Internal_Store").clear().getRange(1,1,1,4).setValues([["Judul","Arab","Terjemah","Sumber"]]);
    SS.getSheetByName("DB_Internal_Store").getRange(2,1,rowsD.length,4).setValues(rowsD);
    log.doa = rowsD.length;
  }

  // 3. Sync Perawi
  const resP = callAPI("https://api.myquran.com/v2/hadits/list");
  if (resP && resP.data) {
    const rowsP = resP.data.map(p => [p.id, p.name, p.total]);
    SS.getSheetByName("DB_Perawi").clear().getRange(1,1,1,3).setValues([["ID","Nama","Total"]]);
    SS.getSheetByName("DB_Perawi").getRange(2,1,rowsP.length,3).setValues(rowsP);
    log.hadits = rowsP.length;
  }

  return { status: "Sync Berhasil", detail: log };
}

// --- DATA TAHLIL (API Cadangan) ---
function fetchTahlilData() {
  const res = callAPI("https://islamic-api-zhirrr.vercel.app/api/tahlil");
  return res && res.data ? res.data : [];
}

// --- CORE UTILS ---
function callAPI(url) {
  try {
    const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    const content = response.getContentText();
    if (content.indexOf('<!DOCTYPE') !== -1) return { data: null };
    return JSON.parse(content);
  } catch (e) { return { data: null }; }
}

function fetchAyatFromAPI(id) { return callAPI(`https://equran.id/api/v2/surat/${id}`).data.ayat; }
function getJadwalByCityId(id) { return callAPI(`https://api.myquran.com/v2/sholat/jadwal/${id}/${Utilities.formatDate(new Date(), "GMT+7", "yyyy/MM/dd")}`); }
function fetchFromSheet(sName) {
  const sheet = SS.getSheetByName(sName);
  const data = sheet.getDataRange().getValues();
  const head = data.shift();
  return data.map(r => { let o={}; head.forEach((h,i)=>o[h]=r[i]); return o; });
}
function checkAndInitSheets() {
  const S = {"DB_Internal_Store":["Judul","Arab","Terjemah","Sumber"],"DB_Surah":["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"],"DB_Perawi":["ID","Nama","Total"]};
  for (let n in S) { if(!SS.getSheetByName(n)) SS.insertSheet(n).getRange(1,1,1,S[n].length).setValues([S[n]]); }
}
