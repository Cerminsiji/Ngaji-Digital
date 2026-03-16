/**
 * FUNGSI KHUSUS SYNC MASSAL 114 SURAH
 */

function bulkSyncAllSurah() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const listSurah = getSheetData("DB_Surah"); // Mengambil daftar surah dari DB_Surah
  
  if (listSurah.length === 0) {
    Logger.log("Peringatan: DB_Surah kosong. Pastikan daftar surah sudah terisi.");
    return;
  }

  Logger.log("Memulai sinkronisasi massal 114 Surah...");

  listSurah.forEach((s) => {
    const surahId = s.id;
    const sheetName = `Surah_${surahId}`;
    let sheet = ss.getSheetByName(sheetName);

    // Hanya proses jika sheet belum ada (menghindari double content)
    if (!sheet) {
      try {
        Logger.log(`Sedang sinkronisasi: Surah ${surahId} (${s.nama})...`);
        
        // Memanggil API e-Quran sesuai protokol navigasi
        const response = UrlFetchApp.fetch(`https://equran.id/api/v2/surat/${surahId}`, {
          "muteHttpExceptions": true
        });
        const res = JSON.parse(response.getContentText());

        if (res && res.data) {
          sheet = ss.insertSheet(sheetName);
          sheet.appendRow(['Nomor', 'Arab', 'Latin', 'Terjemah']);

          // Pemetaan data ayat sesuai struktur database Anda
          const rows = res.data.ayat.map(a => [
            a.nomorAyat, 
            a.teksArab, 
            a.teksLatin, 
            a.teksIndonesia
          ]);

          // Menulis data secara massal untuk efisiensi
          sheet.getRange(2, 1, rows.length, 4).setValues(rows);
          Logger.log(`Berhasil: Surah ${surahId} tersimpan.`);
        }
      } catch (err) {
        Logger.log(`Gagal sinkronisasi Surah ${surahId}: ${err.toString()}`);
      }
      
      // Jeda singkat untuk menghindari rate limit API
      Utilities.sleep(500); 
    } else {
      Logger.log(`Surah ${surahId} sudah ada, melewati...`);
    }
  });

  Logger.log("Sinkronisasi Selesai!");
}
