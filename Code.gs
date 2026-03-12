/**
 * NGAJI REK - BACKEND ENGINE
 * Fitur: Quran, Doa, Tahlil, Jadwal Sholat, & Imsak
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();
const API_URLS = {
  sholat: "https://api.myquran.com/v2/sholat/jadwal",
  doa: "https://api.myquran.com/v2/doa/semua",
  tahlil: "https://islamic-api-zhirrr.vercel.app/api/tahlil",
  quran: "https://equran.id/api/v2/surat"
};

function doGet(e) {
  const action = e.parameter.action;
  let data;

  switch(action) {
    case 'getSurah': data = getSheetData("DB_Surah"); break;
    case 'getDoa': data = getSheetData("DB_Doa"); break;
    case 'getTahlil': data = getSheetData("DB_Tahlil"); break;
    case 'getSholat': return ContentService.createTextOutput(JSON.stringify(getJadwalByCityId(e.parameter.id))).setMimeType(ContentService.MimeType.JSON);
    case 'getAyatData': return ContentService.createTextOutput(JSON.stringify(fetchAyatFromAPI(e.parameter.surahId))).setMimeType(ContentService.MimeType.JSON);
    case 'sync': return ContentService.createTextOutput(JSON.stringify(flushAndSync())).setMimeType(ContentService.MimeType.JSON);
    default: data = {status: "error"};
  }
  
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(name) {
  const sheet = SS.getSheetByName(name);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getJadwalByCityId(id) {
  const date = Utilities.formatDate(new Date(), "GMT+7", "yyyy/MM/dd");
  const res = callAPI(`${API_URLS.sholat}/${id}/${date}`);
  if(res && res.data) {
    const subuh = res.data.jadwal.subuh;
    res.data.jadwal.imsak = calculateImsak(subuh);
  }
  return res;
}

function calculateImsak(subuhTime) {
  const [hours, minutes] = subuhTime.split(':').map(Number);
  let d = new Date();
  d.setHours(hours, minutes - 10, 0); 
  return Utilities.formatDate(d, "GMT+7", "HH:mm");
}

function fetchAyatFromAPI(id) {
  return callAPI(`${API_URLS.quran}/${id}`).data;
}

function callAPI(url) {
  try {
    const res = UrlFetchApp.fetch(url);
    return JSON.parse(res.getContentText());
  } catch(e) { return null; }
}

function flushAndSync() {
  // Sync Doa
  const resD = callAPI(API_URLS.doa);
  if(resD && resD.data) {
    const rowsD = resD.data.map(d => [d.judul, d.arab, d.indo]);
    const sheetD = SS.getSheetByName("DB_Doa");
    sheetD.clear().getRange(1,1,1,3).setValues([["Judul","Arab","Terjemah"]]);
    sheetD.getRange(2,1,rowsD.length,3).setValues(rowsD);
  }
  
  // Sync Tahlil
  const resT = callAPI(API_URLS.tahlil);
  if(resT && resT.data) {
    const rowsT = resT.data.map(t => [t.title, t.arabic, t.translation]);
    const sheetT = SS.getSheetByName("DB_Tahlil");
    sheetT.clear().getRange(1,1,1,3).setValues([["Judul","Arab","Terjemah"]]);
    sheetT.getRange(2,1,rowsT.length,3).setValues(rowsT);
  }

  // Sync Surah List
  const resQ = callAPI(API_URLS.quran);
  if(resQ && resQ.data) {
    const rowsQ = resQ.data.map(s => [s.nomor, s.namaLatin, s.nama, s.tempatTurun, s.jumlahAyat]);
    const sheetQ = SS.getSheetByName("DB_Surah");
    sheetQ.clear().getRange(1,1,1,5).setValues([["ID","Nama","Nama Arab","Tipe","Jumlah Ayat"]]);
    sheetQ.getRange(2,1,rowsQ.length,5).setValues(rowsQ);
  }
  return {status: "success"};
}
