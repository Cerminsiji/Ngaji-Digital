/**
 * NGAJI DIGITAL
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    if (!action) throw new Error("No Action Provided");

    switch (action) {
      case 'sync':
        result = syncAllData();
        break;
      case 'getSurah':
        result = getSheetData('Surah');
        break;
      case 'getDoa':
        result = getSheetData('Doa');
        break;
      case 'getTahlil':
        result = getSheetData('Tahlil');
        break;
      case 'getSholat':
        result = fetchSholatAPI(e.parameter.id);
        break;
      case 'searchKota':
        result = searchKotaAPI(e.parameter.q);
        break;
      case 'getAyatData':
        result = fetchAyatAPI(e.parameter.surahId);
        break;
      default:
        result = { status: false, message: 'Action ' + action + ' tidak terdaftar' };
    }
  } catch (err) {
    result = { status: false, message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function fetchSholatAPI(cityId) {
  const now = new Date();
  const url = `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`;
  return JSON.parse(UrlFetchApp.fetch(url));
}

function searchKotaAPI(query) {
  return JSON.parse(UrlFetchApp.fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`));
}

function fetchAyatAPI(surahId) {
  const res = UrlFetchApp.fetch(`https://equran.id/api/v2/surat/${surahId}`);
  return JSON.parse(res).data;
}

function syncAllData() {
  // Sync Surah
  const surahs = JSON.parse(UrlFetchApp.fetch('https://equran.id/api/v2/surat')).data;
  const sSheet = getOrCreateSheet('Surah');
  sSheet.clear().appendRow(['ID', 'Nama', 'Nama Arab', 'Jumlah Ayat', 'Tipe']);
  surahs.forEach(s => sSheet.appendRow([s.nomor, s.namaLatin, s.nama, s.jumlahAyat, s.tempatTurun]));

  // Placeholder Doa & Tahlil
  const dSheet = getOrCreateSheet('Doa');
  if(dSheet.getLastRow() < 2) {
    dSheet.appendRow(['Judul', 'Arab', 'Terjemah']);
    dSheet.appendRow(['Doa Sapu Jagad', 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'Ya Tuhan kami, berilah kami kebaikan di dunia...']);
  }
  
  return { status: true, message: 'Sinkronisasi v30.0 Berhasil!' };
}

function getSheetData(name) {
  const sheet = SS.getSheetByName(name);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  const header = values.shift();
  return values.map(row => {
    let obj = {};
    header.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function getOrCreateSheet(name) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) sheet = SS.insertSheet(name);
  return sheet;
}
