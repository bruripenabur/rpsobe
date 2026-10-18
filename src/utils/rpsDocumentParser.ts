import JSZip from "jszip";
import { CpmkItem, RpsData, SubCpmkItem, SyllabusWeek } from "../types/rps";
import { DEFAULT_OBE_RUBRICS } from "../data/defaultRubrics";

/**
 * Utilitas Parser Dokumen RPS (Word .docx, JSON, dan Teks)
 * Membaca berkas RPS yang diunggah dan menggantikan SELURUH informasi lama
 * (Nama Prodi, Nama MK, Kode MK, SKS, Semester, Bahan Kajian, Pustaka, CPMK, Sub-CPMK, Silabus)
 * secara komprehensif tanpa meninggalkan residu data mata kuliah sebelumnya.
 */

// Helper pembersih string
function cleanText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

/**
 * Ekstraksi teks dan tabel dari berkas Word .docx menggunakan JSZip dan DOMParser
 */
async function extractDocxContent(file: File): Promise<{
  fullText: string;
  paragraphs: string[];
  tables: string[][][];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(arrayBuffer);

  const documentXml = loadedZip.file("word/document.xml");
  if (!documentXml) {
    throw new Error("Berkas Word tidak valid: tidak ditemukan 'word/document.xml'.");
  }

  const xmlString = await documentXml.async("text");
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  // Ekstrak semua paragraf
  const pNodes = xmlDoc.getElementsByTagName("w:p");
  const paragraphs: string[] = [];
  for (let i = 0; i < pNodes.length; i++) {
    const tNodes = pNodes[i].getElementsByTagName("w:t");
    let pText = "";
    for (let j = 0; j < tNodes.length; j++) {
      pText += tNodes[j].textContent || "";
    }
    const trimmed = pText.trim();
    if (trimmed) {
      paragraphs.push(trimmed);
    }
  }

  // Ekstrak semua tabel
  const tblNodes = xmlDoc.getElementsByTagName("w:tbl");
  const tables: string[][][] = [];

  for (let t = 0; t < tblNodes.length; t++) {
    const table: string[][] = [];
    const trNodes = tblNodes[t].getElementsByTagName("w:tr");

    for (let r = 0; r < trNodes.length; r++) {
      const row: string[] = [];
      const tcNodes = trNodes[r].getElementsByTagName("w:tc");

      for (let c = 0; c < tcNodes.length; c++) {
        const tNodes = tcNodes[c].getElementsByTagName("w:t");
        let cellText = "";
        for (let k = 0; k < tNodes.length; k++) {
          cellText += tNodes[k].textContent || "";
        }
        row.push(cellText.trim());
      }
      if (row.some((cell) => cell.length > 0)) {
        table.push(row);
      }
    }
    if (table.length > 0) {
      tables.push(table);
    }
  }

  const fullText = paragraphs.join("\n");
  return { fullText, paragraphs, tables };
}

/**
 * Parser Lokal Berbasis Aturan (Rule-Based & Regex) untuk Dokumen RPS
 * Mengambil seluruh informasi dari teks dan tabel dokumen docx/txt
 */
function parseRpsDeterministically(
  fullText: string,
  tables: string[][][],
  fileName: string
): RpsData {
  const clean = cleanText(fullText);
  const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[__-]/g, " ").trim();
  const fallbackTitle = baseName.charAt(0).toUpperCase() + baseName.slice(1);

  // 1. Ekstraksi Nama Mata Kuliah
  let namaMK = "";
  // Cek dari tabel identitas terlebih dahulu
  for (const tbl of tables) {
    for (const row of tbl) {
      for (let c = 0; c < row.length; c++) {
        const cell = row[c].toLowerCase();
        if ((cell.includes("mata kuliah") || cell.includes("nama mk")) && row[c + 1]) {
          const val = row[c + 1].trim();
          if (val && !val.toLowerCase().includes("kode") && !val.toLowerCase().includes("sks")) {
            namaMK = val;
            break;
          }
        }
      }
      if (namaMK) break;
    }
    if (namaMK) break;
  }

  // Jika belum dapat, cari dari regex baris
  if (!namaMK) {
    const mkMatch = clean.match(/(?:Mata\s*Kuliah|Nama\s*MK|Course)\s*[:=]\s*([^\n\r]+)/i);
    if (mkMatch && mkMatch[1].trim()) {
      namaMK = mkMatch[1].trim();
    }
  }
  if (!namaMK) {
    namaMK = fallbackTitle || "Mata Kuliah Baru";
  }

  // 2. Ekstraksi Program Studi
  let namaProdi = "";
  for (const tbl of tables) {
    for (const row of tbl) {
      for (let c = 0; c < row.length; c++) {
        const cell = row[c].toLowerCase();
        if ((cell.includes("program studi") || cell.includes("prodi")) && row[c + 1]) {
          const val = row[c + 1].trim();
          if (val && !val.toLowerCase().includes("fakultas")) {
            namaProdi = val;
            break;
          }
        }
      }
      if (namaProdi) break;
    }
    if (namaProdi) break;
  }
  if (!namaProdi) {
    const prodiMatch = clean.match(/(?:Program\s*Studi|Prodi)\s*[:=]?\s*([^\n\r]+)/i);
    if (prodiMatch && prodiMatch[1].trim()) {
      namaProdi = prodiMatch[1].trim();
    }
  }
  if (namaProdi) {
    if (!namaProdi.toLowerCase().startsWith("program studi")) {
      namaProdi = `PROGRAM STUDI ${namaProdi.toUpperCase()}`;
    } else {
      namaProdi = namaProdi.toUpperCase();
    }
  } else {
    namaProdi = "";
  }

  // 3. Ekstraksi Fakultas & Kampus
  let namaFakultas = "";
  const fakMatch = clean.match(/Fakultas\s*[:=]?\s*([^\n\r]+)/i);
  if (fakMatch && fakMatch[1].trim()) {
    namaFakultas = fakMatch[1].trim().toUpperCase();
    if (!namaFakultas.startsWith("FAKULTAS")) {
      namaFakultas = `FAKULTAS ${namaFakultas}`;
    }
  }

  let namaKampus = "UNIVERSITAS PATTIMURA";
  const kampusMatch = clean.match(/(?:Universitas|Institut|Politeknik)\s*([^\n\r]+)/i);
  if (kampusMatch && kampusMatch[0].trim()) {
    namaKampus = kampusMatch[0].trim().toUpperCase();
  }

  // 4. Ekstraksi Kode Mata Kuliah & Dokumen
  let kodeMK = "";
  for (const tbl of tables) {
    for (const row of tbl) {
      for (let c = 0; c < row.length; c++) {
        const cell = row[c].toLowerCase();
        if ((cell.includes("kode mk") || cell.includes("kode mata kuliah") || cell === "kode") && row[c + 1]) {
          const val = row[c + 1].trim();
          if (val && !val.toLowerCase().includes("bobot")) {
            kodeMK = val;
            break;
          }
        }
      }
      if (kodeMK) break;
    }
    if (kodeMK) break;
  }
  if (!kodeMK) {
    const kodeMatch = clean.match(/(?:Kode\s*MK|Kode\s*Mata\s*Kuliah|Kode)\s*[:=]\s*([A-Za-z0-9\-_]+)/i);
    if (kodeMatch && kodeMatch[1].trim()) {
      kodeMK = kodeMatch[1].trim();
    }
  }
  if (!kodeMK) {
    // Generate kode unik dari nama prodi atau PPP
    kodeMK = "MK" + Math.floor(10000 + Math.random() * 90000);
  }

  // 5. Ekstraksi Bobot SKS (Teori / Praktik)
  let bobotSKS = 3;
  let sksTeori = 2;
  let sksPraktik = 1;

  const sksMatch = clean.match(/(?:Bobot\s*\(?SKS\)?|SKS)\s*[:=]?\s*([0-9]+(?:\s*\(?[0-9\s\-–+/]+\)?)?)/i);
  if (sksMatch && sksMatch[1]) {
    const sksStr = sksMatch[1];
    const numOnly = sksStr.match(/^(\d+)/);
    if (numOnly) {
      bobotSKS = parseInt(numOnly[1], 10);
    }
    // Cek pembagian (teori - praktik) misal "3 (2-1)" atau "2 - 1"
    const splitMatch = sksStr.match(/(\d+)\s*[-–/]\s*(\d+)/);
    if (splitMatch) {
      sksTeori = parseInt(splitMatch[1], 10);
      sksPraktik = parseInt(splitMatch[2], 10);
      bobotSKS = sksTeori + sksPraktik;
    } else {
      sksTeori = bobotSKS >= 2 ? bobotSKS - 1 : bobotSKS;
      sksPraktik = bobotSKS > 1 ? 1 : 0;
    }
  }

  // 6. Ekstraksi Semester
  let semester = "Semester 3 (Ganjil)";
  const semMatch = clean.match(/(?:Semester)\s*[:=]?\s*([^\n\r]+)/i);
  if (semMatch && semMatch[1].trim()) {
    semester = semMatch[1].trim();
  }

  // 7. Ekstraksi Rumpun & Jenis MK
  let rumpunMK = "MK Prodi";
  const rumpunMatch = clean.match(/(?:Rumpun\s*MK|Rumpun)\s*[:=]?\s*([^\n\r]+)/i);
  if (rumpunMatch && rumpunMatch[1].trim()) {
    rumpunMK = rumpunMatch[1].trim();
  }

  // 8. Ekstraksi Dosen Pengampu, Pengembang, Koordinator, Kaprodi
  let dosenPengampu = "";
  const dosenMatch = clean.match(/(?:Dosen\s*Pengampu|Tim\s*Pengampu|Pengampu)\s*[:=]?\s*([^\n\r]+)/i);
  if (dosenMatch && dosenMatch[1].trim()) {
    dosenPengampu = dosenMatch[1].trim();
  } else {
    dosenPengampu = "Tim Dosen Pengampu " + namaMK;
  }

  let koorMK = "";
  const koorMatch = clean.match(/(?:Koordinator\s*MK|Pengembang\s*RPS)\s*[:=]?\s*([^\n\r]+)/i);
  if (koorMatch && koorMatch[1].trim()) {
    koorMK = koorMatch[1].trim();
  } else {
    koorMK = "Koordinator " + namaMK;
  }

  let kaprodi = "";
  const kaprodiMatch = clean.match(/(?:Ketua\s*Program\s*Studi|Kaprodi|Ketua\s*Prodi)\s*[:=]?\s*([^\n\r]+)/i);
  if (kaprodiMatch && kaprodiMatch[1].trim()) {
    kaprodi = kaprodiMatch[1].trim();
  } else {
    kaprodi = "Ketua Program Studi " + namaProdi;
  }

  // 9. Ekstraksi Deskripsi Mata Kuliah
  let deskripsiMK = "";
  const deskMatch = clean.match(
    /(?:Deskripsi\s*(?:Singkat)?\s*(?:Mata\s*Kuliah|MK)|Uraian\s*Mata\s*Kuliah)\s*[:=]?\s*([\s\S]*?)(?=(?:Bahan\s*Kajian|Materi|Capaian|Pustaka|CPMK|Sub-CPMK|Dosen|$))/i
  );
  if (deskMatch && deskMatch[1].trim().length > 20) {
    deskripsiMK = deskMatch[1].trim();
  } else {
    deskripsiMK = `Mata kuliah ${namaMK} dirancang dengan kurikulum berbasis Outcome-Based Education (OBE) pada ${namaProdi}, ${namaFakultas}, ${namaKampus}. Mata kuliah ini membekali mahasiswa dengan kemampuan teoretis, analisis, dan penerapan praktis dalam bidang kajian terkait secara komprehensif, etis, dan kontekstual.`;
  }

  // 10. Ekstraksi Bahan Kajian / Materi Pembelajaran
  let bahanKajian = "";
  const bahanMatch = clean.match(
    /(?:Bahan\s*Kajian|Materi\s*Pembelajaran|Pokok\s*Bahasan|Materi\s*Pokok)\s*[:=]?\s*([\s\S]*?)(?=(?:Pustaka|Referensi|Daftar\s*Pustaka|CPMK|Sub-CPMK|Rencana|Tabel|$))/i
  );
  if (bahanMatch && bahanMatch[1].trim().length > 15) {
    bahanKajian = bahanMatch[1].trim();
  } else {
    // Generate 6 poin materi default berdasarkan nama mata kuliah
    bahanKajian = `1. Pengantar dan Konsep Dasar ${namaMK}\n2. Landasan Teori dan Kerangka Konseptual ${namaMK}\n3. Metode Analisis dan Pendekatan Kajian Terapan\n4. Isu Kontemporer dan Studi Kasus Terkait\n5. Implementasi, Kebijakan, dan Evaluasi Praktis\n6. Sintesis, Rekomendasi, dan Proyek Akhir ${namaMK}`;
  }

  // 11. Ekstraksi Daftar Pustaka / Referensi
  let daftarPustaka = "";
  const pustakaMatch = clean.match(
    /(?:Daftar\s*Pustaka|Pustaka|Referensi|Pustaka\s*Utama)\s*[:=]?\s*([\s\S]*?)(?=(?:Dosen|Pengesahan|Tabel|Matriks|Minggu|$))/i
  );
  if (pustakaMatch && pustakaMatch[1].trim().length > 15) {
    daftarPustaka = pustakaMatch[1].trim();
  } else {
    daftarPustaka = `1. Tim Dosen ${namaProdi}. (2024). Modul Ajar Terpadu ${namaMK}. ${namaKampus}.\n2. Buku Referensi Utama Standar Nasional Pendidikan Tinggi (SN-Dikti).\n3. Jurnal Ilmiah Bereputasi Nasional dan Internasional Terkait Bidang ${namaMK}.`;
  }

  // 12. Ekstraksi CPMK
  const cpmkList: CpmkItem[] = [];
  const cpmkRegex = /CPMK\s*([0-9]+)\s*[:.\-]?\s*([^\n\r]+)/gi;
  let mCpmk;
  while ((mCpmk = cpmkRegex.exec(clean)) !== null) {
    const id = `CPMK ${mCpmk[1]}`;
    const desc = mCpmk[2].trim();
    if (!cpmkList.some((c) => c.id === id) && desc.length > 5) {
      cpmkList.push({ id, desc });
    }
  }

  if (cpmkList.length === 0) {
    cpmkList.push(
      { id: "CPMK 1", desc: `Mahasiswa mampu menjelaskan konsep dasar, prinsip teoretis, dan ruang lingkup ${namaMK}.` },
      { id: "CPMK 2", desc: `Mahasiswa mampu menganalisis permasalahan, data, dan instrumen yang relevan dalam kajian ${namaMK}.` },
      { id: "CPMK 3", desc: `Mahasiswa mampu merancang pemecahan masalah serta alternatif solusi strategis dalam ${namaMK}.` },
      { id: "CPMK 4", desc: `Mahasiswa mampu mengomunikasikan ide, bekerja sama secara tim, dan menyusun laporan berbasis etika akademik.` }
    );
  }

  // 13. Ekstraksi Sub-CPMK
  const subCpmkList: SubCpmkItem[] = [];
  const subRegex = /Sub-?CPMK\s*([0-9]+)\s*[:.\-]?\s*([^\n\r]+)/gi;
  let mSub;
  while ((mSub = subRegex.exec(clean)) !== null) {
    const subNum = parseInt(mSub[1], 10);
    const id = `Sub-CPMK ${subNum}`;
    const desc = mSub[2].trim();

    // Petakan ke CPMK terdekat
    const cpmkIndex = Math.min(Math.ceil(subNum / 2), cpmkList.length);
    const cpmkRef = cpmkList[cpmkIndex - 1]?.id || "CPMK 1";

    let bloom = "C2-Pemahaman";
    if (desc.toLowerCase().includes("menerapkan") || desc.toLowerCase().includes("menghitung")) bloom = "C3-Penerapan";
    else if (desc.toLowerCase().includes("menganalisis") || desc.toLowerCase().includes("membedakan")) bloom = "C4-Analisis";
    else if (desc.toLowerCase().includes("mengevaluasi") || desc.toLowerCase().includes("menilai")) bloom = "C5-Evaluasi";
    else if (desc.toLowerCase().includes("merancang") || desc.toLowerCase().includes("merumuskan") || desc.toLowerCase().includes("menciptakan")) bloom = "C6-Kreasi";

    if (!subCpmkList.some((s) => s.id === id) && desc.length > 5) {
      subCpmkList.push({ id, cpmkRef, bloom, desc });
    }
  }

  if (subCpmkList.length === 0) {
    const blooms = ["C2-Pemahaman", "C3-Penerapan", "C4-Analisis", "C4-Analisis", "C5-Evaluasi", "C6-Kreasi"];
    const materials = bahanKajian.split("\n").filter((l) => l.trim().length > 0);

    for (let i = 0; i < Math.min(materials.length, 8); i++) {
      const id = `Sub-CPMK ${i + 1}`;
      const cpmkRef = cpmkList[Math.min(Math.floor(i / 2), cpmkList.length - 1)].id;
      const bloom = blooms[i % blooms.length];
      const mat = materials[i].replace(/^[0-9]+[.\-)]\s*/, "").trim();
      subCpmkList.push({
        id,
        cpmkRef,
        bloom,
        desc: `Mahasiswa mampu menguasai dan mengaplikasikan ${mat} dalam konteks ${namaMK}.`,
      });
    }
  }

  // 14. Ekstraksi Silabus 16 Minggu dari Tabel Docx jika ada
  let syllabusList: SyllabusWeek[] = [];

  // Cari tabel mingguan di tables (tabel dengan 10+ baris)
  for (const tbl of tables) {
    if (tbl.length >= 8) {
      const headerRow = tbl[0].map((c) => c.toLowerCase());
      const hasWeekCol = headerRow.some((c) => c.includes("minggu") || c.includes("ke-") || c.includes("pertemuan"));
      if (hasWeekCol) {
        // Ambil baris
        for (let r = 1; r < tbl.length; r++) {
          const row = tbl[r];
          if (row.length >= 3) {
            const weekStr = row[0].replace(/[^0-9]/g, "") || `${r}`;
            const sub = row[1] || `Sub-CPMK ${r}`;
            const materi = row[2] || `Materi Minggu ${weekStr}`;
            const metode = row[3] || "Kuliah interaktif, diskusi kelompok [BT: 2x(2x50''); PT: 2x(2x60''); BM: 2x(2x60'')]";
            const asesmen = row[4] || "Partisipasi & Tugas";
            const indikator = row[5] || `Ketepatan memahami materi minggu ${weekStr}`;
            const bobot = row[6] ? row[6].replace(/[^0-9]/g, "") : (weekStr === "8" || weekStr === "16" ? "15" : "5");

            const isExam = weekStr === "8" || weekStr === "16" || materi.toLowerCase().includes("uts") || materi.toLowerCase().includes("uas");

            syllabusList.push({
              week: weekStr,
              sub,
              materi,
              metode,
              asesmen,
              indikator,
              bobot: bobot || "5",
              isExam,
            });
          }
        }
        break;
      }
    }
  }

  // Jika tidak ditemukan tabel 16 minggu dari docx, buat 16 minggu lengkap
  if (syllabusList.length < 14) {
    syllabusList = [];
    const matList = bahanKajian.split("\n").filter((l) => l.trim().length > 0);

    for (let w = 1; w <= 16; w++) {
      if (w === 8) {
        syllabusList.push({
          week: "8",
          sub: "Evaluasi",
          materi: `UJIAN TENGAH SEMESTER (UTS) - Evaluasi Capaian Pembelajaran Pertemuan 1 s.d. 7 ${namaMK}`,
          metode: "Ujian Tertulis / Penugasan Terjadwal [BT: 1x(1x100''); PT: 1x(1x60''); BM: 1x(1x60'')]",
          asesmen: "Ujian UTS",
          indikator: "Penguasaan konseptual dan analisis materi minggu 1 s.d. 7.",
          bobot: "15",
          isExam: true,
        });
      } else if (w === 16) {
        syllabusList.push({
          week: "16",
          sub: "Evaluasi",
          materi: `UJIAN AKHIR SEMESTER (UAS) - Evaluasi Komprehensif Capaian Pembelajaran ${namaMK}`,
          metode: "Ujian Akhir / Presentasi Proyek Terjadwal [BT: 1x(1x100''); PT: 1x(1x60''); BM: 1x(1x60'')]",
          asesmen: "Ujian UAS",
          indikator: "Penguasaan menyeluruh dan penyusunan rekomendasi solusi praktis.",
          bobot: "15",
          isExam: true,
        });
      } else {
        const subIndex = w < 8 ? w - 1 : w - 2;
        const subItem = subCpmkList[subIndex % subCpmkList.length];
        const rawMat = matList[subIndex % matList.length] || `Pokok Bahasan Perkuliahan Pertemuan ${w}`;
        const materiClean = rawMat.replace(/^[0-9]+[.\-)]\s*/, "").trim();

        syllabusList.push({
          week: `${w}`,
          sub: subItem.id,
          materi: materiClean,
          metode: "Kuliah interaktif, studi kasus & diskusi kelas [BT: 2x(2x50''); PT: 2x(2x60''); BM: 2x(2x60'')]",
          asesmen: w % 2 === 0 ? "Tugas Terstruktur & Presentasi" : "Partisipasi & Keaktifan Diskusi",
          indikator: `Ketepatan menganalisis dan menerapkan materi: ${materiClean}`,
          bobot: "5",
          isExam: false,
        });
      }
    }
  }

  return {
    namaKampus,
    namaFakultas,
    namaProdi,
    kodeDokumen: kodeMK,
    tglPengesahan: new Date().toISOString().split("T")[0],
    namaMK,
    kodeMK,
    rumpunMK,
    jenisMK: "Wajib",
    bobotSKS,
    sksTeori,
    sksPraktik,
    semester,
    revisiKe: "01 (OBE System)",
    koorMK,
    kaprodi,
    wadirAkademik: "Wakil Dekan Bidang Akademik",
    dosenPengampu,
    deskripsiMK,
    bahanKajian,
    daftarPustaka,
    selectedSdgs: [1, 2, 8, 12],
    selectedPipItems: ["BMK-01", "BMK-02", "BMK-04", "BMK-05"],
    selectedKkniLevels: [6],
    selectedKkniItems: ["KKNI-6.1", "KKNI-6.2", "KKNI-6.3", "KKNI-6.4"],
    selectedCpls: ["CPL1", "CPL2", "CPL3", "CPL6", "CPL8"],
    cpmkList,
    subCpmkList,
    syllabusList,
    assessmentWeights: {
      partisipatif: 15,
      proyek: 40,
      tugas: 10,
      kuis: 5,
      uts: 15,
      uas: 15,
    },
    rubrics: DEFAULT_OBE_RUBRICS,
  };
}

/**
 * Normalisasi data JSON agar menggantikan seluruh isi RpsData lama
 */
function normalizeJsonRps(parsed: any, fileName: string): RpsData {
  const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[__-]/g, " ").trim();
  const fallbackTitle = baseName.charAt(0).toUpperCase() + baseName.slice(1);

  // Deteksi jika JSON berasal dari API Gemini generate-curriculum
  const namaMK = parsed.namaMK || parsed.courseName || parsed.title || fallbackTitle || "Mata Kuliah Baru";
  const kodeMK = parsed.kodeMK || parsed.courseCode || "MK" + Math.floor(10000 + Math.random() * 90000);
  const bobotSKS = Number(parsed.bobotSKS || parsed.sks || 3);
  const sksTeori = Number(parsed.sksTeori || (bobotSKS >= 2 ? bobotSKS - 1 : bobotSKS));
  const sksPraktik = Number(parsed.sksPraktik || (bobotSKS > 1 ? 1 : 0));

  let cpmkList: CpmkItem[] = [];
  if (Array.isArray(parsed.cpmkList)) {
    cpmkList = parsed.cpmkList;
  } else if (Array.isArray(parsed.cpmk)) {
    cpmkList = parsed.cpmk.map((c: any, idx: number) => ({
      id: c.id || `CPMK ${idx + 1}`,
      desc: c.desc || String(c),
    }));
  } else {
    cpmkList = [
      { id: "CPMK 1", desc: `Mahasiswa mampu menguasai konsep dan dasar ${namaMK}.` },
      { id: "CPMK 2", desc: `Mahasiswa mampu menganalisis penerapan praktis ${namaMK}.` },
    ];
  }

  let subCpmkList: SubCpmkItem[] = [];
  if (Array.isArray(parsed.subCpmkList)) {
    subCpmkList = parsed.subCpmkList;
  } else if (Array.isArray(parsed.subCpmk)) {
    subCpmkList = parsed.subCpmk.map((s: any, idx: number) => ({
      id: s.id || `Sub-CPMK ${idx + 1}`,
      cpmkRef: s.cpmkRef || "CPMK 1",
      bloom: s.bloom || "C2-Pemahaman",
      desc: s.desc || String(s),
    }));
  } else {
    subCpmkList = [
      { id: "Sub-CPMK 1", cpmkRef: "CPMK 1", bloom: "C2-Pemahaman", desc: `Memahami konsep umum ${namaMK}.` },
      { id: "Sub-CPMK 2", cpmkRef: "CPMK 1", bloom: "C3-Penerapan", desc: `Menerapkan konsep ${namaMK} dalam tugas terstruktur.` },
    ];
  }

  let syllabusList: SyllabusWeek[] = [];
  if (Array.isArray(parsed.syllabusList)) {
    syllabusList = parsed.syllabusList;
  } else if (Array.isArray(parsed.syllabus16Weeks)) {
    syllabusList = parsed.syllabus16Weeks;
  } else if (Array.isArray(parsed.syllabus)) {
    syllabusList = parsed.syllabus;
  }

  // Jika tidak ada silabus 16 minggu, buat standar 16 minggu
  if (syllabusList.length < 14) {
    syllabusList = [];
    for (let w = 1; w <= 16; w++) {
      if (w === 8) {
        syllabusList.push({
          week: "8",
          sub: "Evaluasi",
          materi: "UJIAN TENGAH SEMESTER (UTS)",
          metode: "Ujian Tertulis Terjadwal",
          asesmen: "Ujian UTS",
          indikator: "Evaluasi penguasaan materi pertemuan 1 s.d. 7",
          bobot: "15",
          isExam: true,
        });
      } else if (w === 16) {
        syllabusList.push({
          week: "16",
          sub: "Evaluasi",
          materi: "UJIAN AKHIR SEMESTER (UAS)",
          metode: "Ujian Akhir / Presentasi Proyek",
          asesmen: "Ujian UAS",
          indikator: "Evaluasi komprehensif capaian akhir pembelajaran",
          bobot: "15",
          isExam: true,
        });
      } else {
        syllabusList.push({
          week: `${w}`,
          sub: `Sub-CPMK ${(w % 4) + 1}`,
          materi: `Materi Perkuliahan Minggu ${w} - ${namaMK}`,
          metode: "Kuliah interaktif, diskusi kelompok [BT: 2x(2x50''); PT: 2x(2x60''); BM: 2x(2x60'')]",
          asesmen: "Partisipasi & Tugas",
          indikator: `Ketepatan memahami materi minggu ke-${w}`,
          bobot: "5",
          isExam: false,
        });
      }
    }
  }

  return {
    namaKampus: parsed.namaKampus || "UNIVERSITAS PATTIMURA",
    namaFakultas: (parsed.namaFakultas || "").toUpperCase(),
    namaProdi: (parsed.namaProdi || parsed.studyProgram || "").toUpperCase(),
    kodeDokumen: parsed.kodeDokumen || kodeMK,
    tglPengesahan: parsed.tglPengesahan || "",
    namaMK,
    kodeMK,
    rumpunMK: parsed.rumpunMK || "MK Prodi",
    jenisMK: parsed.jenisMK || "Wajib",
    bobotSKS,
    sksTeori,
    sksPraktik,
    semester: parsed.semester || "Semester 3 (Ganjil)",
    revisiKe: parsed.revisiKe || "01 (OBE System)",
    koorMK: parsed.koorMK || `Koordinator ${namaMK}`,
    kaprodi: parsed.kaprodi || "Ketua Program Studi",
    wadirAkademik: parsed.wadirAkademik || "Wakil Dekan Bidang Akademik",
    dosenPengampu: parsed.dosenPengampu || `Tim Dosen ${namaMK}`,
    deskripsiMK: parsed.deskripsiMK || `Mata kuliah ${namaMK} disusun sesuai kurikulum OBE UNPATTI.`,
    bahanKajian: parsed.bahanKajian || `1. Pengantar ${namaMK}\n2. Landasan Teori\n3. Studi Kasus dan Aplikasi`,
    daftarPustaka: parsed.daftarPustaka || parsed.rekomendasiPustaka || `1. Buku Referensi Utama ${namaMK}.\n2. Jurnal Ilmiah Terkait.`,
    selectedSdgs: Array.isArray(parsed.selectedSdgs) ? parsed.selectedSdgs : [1, 2, 8],
    selectedPipItems: Array.isArray(parsed.selectedPipItems) ? parsed.selectedPipItems : ["BMK-01", "BMK-02"],
    selectedKkniLevels: Array.isArray(parsed.selectedKkniLevels) ? parsed.selectedKkniLevels : [6],
    selectedKkniItems: Array.isArray(parsed.selectedKkniItems) ? parsed.selectedKkniItems : ["KKNI-6.1", "KKNI-6.2"],
    selectedCpls: Array.isArray(parsed.selectedCpls) ? parsed.selectedCpls : ["CPL1", "CPL2", "CPL3", "CPL6"],
    cpmkList,
    subCpmkList,
    syllabusList,
    assessmentWeights: parsed.assessmentWeights || {
      partisipatif: 15,
      proyek: 40,
      tugas: 10,
      kuis: 5,
      uts: 15,
      uas: 15,
    },
    rubrics: DEFAULT_OBE_RUBRICS,
  };
}

/**
 * Panggil API Backend Gemini AI untuk parsing dokumen secara mendalam (dengan fallback otomatis)
 */
async function parseWithGeminiApi(
  payload: { text?: string; fileName: string; pdfBase64?: string }
): Promise<RpsData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik batas waktu

    const res = await fetch("/api/gemini/parse-rps-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    if (json.success && json.data) {
      return normalizeJsonRps(json.data, payload.fileName);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Konversi File binary ke string Base64 (didukung aman untuk file besar)
 */
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Ekstraksi teks dan tabel dari spreadsheet Excel (.xlsx) menggunakan JSZip dan DOMParser
 */
async function extractXlsxContent(file: File): Promise<{
  fullText: string;
  paragraphs: string[];
  tables: string[][][];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(arrayBuffer);

  // 1. Ekstrak shared strings (kamus teks Excel)
  const sharedStrings: string[] = [];
  const sharedStringsFile = loadedZip.file("xl/sharedStrings.xml");
  if (sharedStringsFile) {
    const xmlStr = await sharedStringsFile.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, "application/xml");
    const siNodes = xmlDoc.getElementsByTagName("si");
    for (let i = 0; i < siNodes.length; i++) {
      const tNodes = siNodes[i].getElementsByTagName("t");
      let text = "";
      for (let j = 0; j < tNodes.length; j++) {
        text += tNodes[j].textContent || "";
      }
      sharedStrings.push(text.trim());
    }
  }

  // 2. Ekstrak lembar kerja (worksheets)
  const tables: string[][][] = [];
  const paragraphs: string[] = [];

  const sheetFiles: string[] = [];
  loadedZip.forEach((relativePath) => {
    if (relativePath.startsWith("xl/worksheets/sheet") && relativePath.endsWith(".xml")) {
      sheetFiles.push(relativePath);
    }
  });

  sheetFiles.sort();

  for (const sheetPath of sheetFiles) {
    const sheetFile = loadedZip.file(sheetPath);
    if (!sheetFile) continue;

    const xmlStr = await sheetFile.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, "application/xml");
    const rowNodes = xmlDoc.getElementsByTagName("row");
    const sheetTable: string[][] = [];

    for (let r = 0; r < rowNodes.length; r++) {
      const rowNode = rowNodes[r];
      const cNodes = rowNode.getElementsByTagName("c");
      const row: string[] = [];

      for (let c = 0; c < cNodes.length; c++) {
        const cNode = cNodes[c];
        const cellType = cNode.getAttribute("t");
        let cellValue = "";

        if (cellType === "s") {
          const vNode = cNode.getElementsByTagName("v")[0];
          if (vNode && vNode.textContent) {
            const idx = parseInt(vNode.textContent, 10);
            if (!isNaN(idx) && sharedStrings[idx] !== undefined) {
              cellValue = sharedStrings[idx];
            }
          }
        } else if (cellType === "inlineStr") {
          const tNode = cNode.getElementsByTagName("t")[0];
          if (tNode) cellValue = tNode.textContent || "";
        } else {
          const vNode = cNode.getElementsByTagName("v")[0];
          if (vNode) cellValue = vNode.textContent || "";
        }

        row.push(cellValue.trim());
      }

      if (row.some((cell) => cell.length > 0)) {
        sheetTable.push(row);
        paragraphs.push(row.filter(Boolean).join(" | "));
      }
    }

    if (sheetTable.length > 0) {
      tables.push(sheetTable);
    }
  }

  const fullText = paragraphs.join("\n");
  return { fullText, paragraphs, tables };
}

/**
 * Ekstraksi teks dari berkas PDF (fallback ekstraksi teks stream lokal)
 */
async function extractPdfTextFallback(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder("latin1");
  const rawStr = textDecoder.decode(bytes);

  const matches: string[] = [];

  // Pola 1: (teks) Tj
  const tjRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(rawStr)) !== null) {
    const cleaned = match[1].replace(/\\[nrtbf\\()]/g, " ").trim();
    if (cleaned.length > 1) {
      matches.push(cleaned);
    }
  }

  // Pola 2: [(teks)-123(teks)] TJ
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/gi;
  while ((match = tjArrayRegex.exec(rawStr)) !== null) {
    const inner = match[1];
    const subMatch = inner.match(/\(([^)]+)\)/g);
    if (subMatch) {
      const line = subMatch
        .map((s) => s.slice(1, -1).replace(/\\[nrtbf\\()]/g, ""))
        .join("")
        .trim();
      if (line.length > 1) {
        matches.push(line);
      }
    }
  }

  if (matches.length > 5) {
    return matches.join("\n");
  }

  // Fallback: karakter ASCII terbaca
  const printableRegex = /[\x20-\x7E]{5,}/g;
  const printableMatches = rawStr.match(printableRegex) || [];
  const filtered = printableMatches.filter((s) => {
    const lower = s.toLowerCase();
    return (
      !lower.startsWith("/font") &&
      !lower.startsWith("/type") &&
      !lower.startsWith("/pages") &&
      !lower.startsWith("/obj") &&
      !lower.startsWith("endobj") &&
      !lower.startsWith("xref") &&
      !lower.startsWith("trailer") &&
      !lower.startsWith("startxref")
    );
  });

  return filtered.join("\n");
}

/**
 * FUNGSI UTAMA: Parsing berkas RPS yang diunggah
 * Mendukung berkas .docx, .json, .xlsx, .pdf, dan .txt
 * Mengembalikan objek RpsData yang menggantikan 100% data lama.
 */
export async function parseUploadedRpsFile(
  file: File,
  onProgress?: (msg: string) => void
): Promise<RpsData> {
  const fileName = file.name.toLowerCase();

  // 1. Penanganan Berkas JSON
  if (fileName.endsWith(".json")) {
    onProgress?.("Membaca dan memvalidasi berkas JSON...");
    const text = await file.text();
    const parsed = JSON.parse(text);
    return normalizeJsonRps(parsed, file.name);
  }

  // 2. Penanganan Berkas Word (.docx)
  if (fileName.endsWith(".docx")) {
    onProgress?.("Mengekstrak struktur tabel dan teks dari dokumen Word .docx...");
    const { fullText, tables } = await extractDocxContent(file);

    // Pertama, ekstrak data lokal deterministik
    const localParsed = parseRpsDeterministically(fullText, tables, file.name);

    // Coba tingkatkan dengan Gemini AI jika teks mencukupi
    if (fullText.length > 50) {
      onProgress?.("Menyempurnakan ekstraksi kurikulum OBE dengan Gemini AI...");
      const aiParsed = await parseWithGeminiApi({ text: fullText, fileName: file.name });
      if (aiParsed) {
        return aiParsed;
      }
    }

    return localParsed;
  }

  // 3. Penanganan Berkas Spreadsheet Excel (.xlsx / .xls)
  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    onProgress?.("Mengekstrak sheet, sel, dan tabel dari berkas Excel .xlsx...");
    try {
      const { fullText, tables } = await extractXlsxContent(file);
      const localParsed = parseRpsDeterministically(fullText, tables, file.name);

      if (fullText.length > 40) {
        onProgress?.("Menganalisis kurikulum dari spreadsheet dengan Gemini AI...");
        const aiParsed = await parseWithGeminiApi({ text: fullText, fileName: file.name });
        if (aiParsed) {
          return aiParsed;
        }
      }

      return localParsed;
    } catch (xlsxErr) {
      console.warn("Gagal mengekstrak XML spreadsheet, mencoba fallback teks:", xlsxErr);
      const text = await file.text();
      return parseRpsDeterministically(text, [], file.name);
    }
  }

  // 4. Penanganan Berkas PDF (.pdf)
  if (fileName.endsWith(".pdf")) {
    onProgress?.("Membaca dan memproses berkas PDF kurikulum RPS...");
    try {
      const base64 = await fileToBase64(file);
      onProgress?.("Menganalisis tata letak dan tabel dokumen PDF dengan Gemini Multimodal...");
      const aiParsed = await parseWithGeminiApi({ pdfBase64: base64, fileName: file.name });
      if (aiParsed) {
        return aiParsed;
      }
    } catch (pdfErr) {
      console.warn("Gemini PDF parsing gagal, mencoba fallback teks lokal:", pdfErr);
    }

    // Fallback ekstraksi teks lokal dari PDF
    onProgress?.("Mengekstrak teks lokal dari stream PDF...");
    const extractedText = await extractPdfTextFallback(file);
    return parseRpsDeterministically(extractedText, [], file.name);
  }

  // 5. Penanganan Berkas Teks (.txt, .rtf, atau berkas lain)
  onProgress?.("Membaca isi berkas dokumen...");
  const text = await file.text();
  const localParsed = parseRpsDeterministically(text, [], file.name);

  if (text.length > 50) {
    onProgress?.("Menganalisis isi dokumen dengan Gemini AI...");
    const aiParsed = await parseWithGeminiApi({ text, fileName: file.name });
    if (aiParsed) {
      return aiParsed;
    }
  }

  return localParsed;
}
