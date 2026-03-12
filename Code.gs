/**
 * NGAJI REK - BACKEND CORE
 * Al-Quran, Doa, Tahlil, Jadwal Sholat
 */
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action;
  checkAndInitSheets();

  try {
    if (action) {
      let result;
      switch(action) {
        case 'syncSemua': result = flushAndSync(); break;
        case 'getSurahList': result = fetchFromSheet("DB_Surah"); break;
        case 'getAyatData': result = fetchAyatFromAPI(e.parameter.surahId); break;
        case 'getDoa': result = fetchFromSheet("DB_Doa"); break;
        case 'getTahlil': result = fetchFromSheet("DB_Tahlil"); break;
        case 'getSholat': result = getJadwalByCityId(e.parameter.id); break;
        case 'searchKota': result = callAPI(`https://api.myquran.com/v2/sholat/kota/cari/${e.parameter.q}`); break;
      }
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
  
  return HtmlService.createTemplateFromFile('index').evaluate()
         .setTitle('Ngaji | Digital')
         .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1')
         .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function flushAndSync() {
  const log = {};
  
  // 1. Sync Quran
  const resQ = callAPI("https://equran.id/api/v2/surat");
  if (resQ && resQ.data) {
    const rowsQ = resQ.data.map(s => [s.nomor, s.namaLatin, s.nama, s.tempatTurun, s.jumlahAyat]);
    SS.getSheetByName("DB_Surah").clear().getRange(1,1,1,5).setValues([["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"]]);
    SS.getSheetByName("DB_Surah").getRange(2,1,rowsQ.length,5).setValues(rowsQ);
    log.quran = rowsQ.length;
  }

  // 2. Sync Doa
  const resD = callAPI("https://api.myquran.com/v2/doa/semua");
  if (resD && resD.data) {
    const rowsD = resD.data.map(d => [d.judul, d.arab, d.indo]);
    SS.getSheetByName("DB_Doa").clear().getRange(1,1,1,3).setValues([["Judul","Arab","Terjemah"]]);
    SS.getSheetByName("DB_Doa").getRange(2,1,rowsD.length,3).setValues(rowsD);
    log.doa = rowsD.length;
  }

  // 3. Sync Tahlil
  const resT = callAPI("https://islamic-api-zhirrr.vercel.app/api/tahlil");
  if (resT && resT.data) {
    const rowsT = resT.data.map(t => [t.title, t.arabic, t.translation]);
    SS.getSheetByName("DB_Tahlil").clear().getRange(1,1,1,3).setValues([["Judul","Arab","Terjemah"]]);
    SS.getSheetByName("DB_Tahlil").getRange(2,1,rowsT.length,3).setValues(rowsT);
    log.tahlil = rowsT.length;
  }

  return { status: "Sync Success", detail: log };
}

function getJadwalByCityId(id) {
  const date = Utilities.formatDate(new Date(), "GMT+7", "yyyy/MM/dd");
  return callAPI(`https://api.myquran.com/v2/sholat/jadwal/${id}/${date}`);
}

function callAPI(url) {
  try {
    const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    return JSON.parse(response.getContentText());
  } catch (e) { return { data: null }; }
}

function fetchAyatFromAPI(id) { return callAPI(`https://equran.id/api/v2/surat/${id}`).data.ayat; }

function fetchFromSheet(sName) {
  const sheet = SS.getSheetByName(sName);
  const data = sheet.getDataRange().getValues();
  const head = data.shift();
  return data.map(r => { let o={}; head.forEach((h,i)=>o[h]=r[i]); return o; });
}

function checkAndInitSheets() {
  const S = {"DB_Doa":["Judul","Arab","Terjemah"],"DB_Surah":["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"],"DB_Tahlil":["Judul","Arab","Terjemah"]};
  for (let n in S) { if(!SS.getSheetByName(n)) SS.insertSheet(n).getRange(1,1,1,S[n].length).setValues([S[n]]); }
}
