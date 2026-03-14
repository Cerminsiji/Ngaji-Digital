/**
 * Ngaji Digital - Hadits Importer
 * Mengimpor seluruh isi JSON dengan mencicil per 500 baris agar tidak timeout.
 */

function jalankanImportHaditsLengkap() {
  const sumberData = [
    { nama: 'Abu Daud', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/abu-daud.json' },
    { nama: 'Ahmad', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/ahmad.json' },
    { nama: 'Bukhari', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/bukhari.json' },
    { nama: 'Darimi', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/darimi.json' },
    { nama: 'Ibnu Majah', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/ibnu-majah.json' },
    { nama: 'Malik', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/malik.json' },
    { nama: 'Muslim', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/muslim.json' },
    { nama: 'Nasai', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/nasai.json' },
    { nama: 'Tirmidzi', url: 'https://github.com/Cerminsiji/hadith-api/raw/refs/heads/master/books/tirmidzi.json' }
  ];

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  sumberData.forEach(kitab => {
    try {
      Logger.log("--- Memulai Import: " + kitab.nama + " ---");
      const res = UrlFetchApp.fetch(kitab.url);
      const data = JSON.parse(res.getContentText("UTF-8"));
      
      // Deteksi struktur (Array langsung atau di dalam properti)
      const list = Array.isArray(data) ? data : (data.hadiths || data.items || []);

      if (list.length === 0) {
        Logger.log("⚠️ Data kosong pada " + kitab.nama);
        return;
      }

      let sheet = ss.getSheetByName(kitab.nama) || ss.insertSheet(kitab.nama);
      sheet.clear();

      // Header
      sheet.getRange(1, 1, 1, 4).setValues([["Nomor", "Judul", "Arab", "Terjemah"]])
           .setBackground("#064e3b").setFontColor("white").setFontWeight("bold");

      const totalData = list.length;
      const batchSize = 500;
      let start = 0;

      // Loop untuk mengambil data per 500
      while (start < totalData) {
        const end = Math.min(start + batchSize, totalData);
        const batchData = list.slice(start, end);
        const rows = [];

        batchData.forEach((h, index) => {
          const no = h.number || (start + index + 1);
          // Berdasarkan screenshot: h.arab dan h.id
          rows.push([
            no,
            kitab.nama + " No. " + no,
            h.arab || "", // Sesuai Screenshot
            h.id || ""    // Sesuai Screenshot
          ]);
        });

        if (rows.length > 0) {
          // Tulis ke baris terakhir yang kosong
          const lastRow = sheet.getLastRow();
          sheet.getRange(lastRow + 1, 1, rows.length, 4).setValues(rows);
          
          // Format Kolom Arab (C) per Batch
          const rangeArab = sheet.getRange(lastRow + 1, 3, rows.length, 1);
          rangeArab.setHorizontalAlignment("right").setFontSize(13).setWrap(true);
        }

        Logger.log(`> Progress ${kitab.nama}: ${end} / ${totalData}`);
        start += batchSize;
        
        // Paksa simpan ke spreadsheet agar tidak menumpuk di memori
        SpreadsheetApp.flush(); 
      }

      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 2);
      Logger.log("✅ SELESAI TOTAL: " + kitab.nama);

    } catch (err) {
      Logger.log("❌ Gagal pada " + kitab.nama + ": " + err.message);
    }
    // Jeda antar kitab agar koneksi stabil
    Utilities.sleep(2000); 
  });
}
