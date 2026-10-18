import { CplItem } from "../types/rps";
import { CPL_OFFICIAL_PENYULUHAN } from "../data/unpattiDefaults";
import { UNPATTI_PRODI_DATABASE } from "../data/unpattiProdiDatabase";

const STORAGE_PREFIX = "unpatti_cpl_bank_v1_";
const PRODI_INDEX_KEY = "unpatti_cpl_saved_prodis_v1";

/**
 * Normalisasi nama/kode prodi untuk dijadikan storage key unik yang aman
 */
export function getProdiStorageKey(prodiNameOrCode: string): string {
  if (!prodiNameOrCode || !prodiNameOrCode.trim()) {
    return `${STORAGE_PREFIX}default`;
  }
  const clean = prodiNameOrCode
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
  return `${STORAGE_PREFIX}${clean}`;
}

/**
 * Mengambil daftar CPL tersimpan untuk Prodi tertentu.
 * Jika belum ada di localStorage, cek preset bawaan (misal Penyuluhan Pertanian)
 */
export function getStoredProdiCpls(prodiNameOrCode: string): CplItem[] {
  try {
    const key = getProdiStorageKey(prodiNameOrCode);
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Gagal membaca CPL dari localStorage:", e);
  }

  // Fallback 1: Cek apakah Prodi Penyuluhan Pertanian
  const lower = (prodiNameOrCode || "").toLowerCase();
  if (lower.includes("penyuluhan") || lower.includes("ppp")) {
    return CPL_OFFICIAL_PENYULUHAN;
  }

  // Fallback 2: Cek di database prodi bawaan
  const dbMatch = UNPATTI_PRODI_DATABASE.find(
    (p) =>
      p.kodeProdi === prodiNameOrCode ||
      p.namaProdi.toLowerCase() === lower ||
      p.namaProdi.toLowerCase().includes(lower)
  );

  if (dbMatch && dbMatch.cplList && dbMatch.cplList.length > 0) {
    return dbMatch.cplList;
  }

  return [];
}

/**
 * Menyimpan CPL untuk satu prodi ke localStorage permanen.
 * CPL ini tidak akan hilang ketika form di-reset!
 */
export function saveStoredProdiCpls(
  prodiNameOrCode: string,
  cpls: CplItem[]
): boolean {
  try {
    const key = getProdiStorageKey(prodiNameOrCode);
    localStorage.setItem(key, JSON.stringify(cpls));

    // Catat ke index daftar prodi yang memiliki CPL mandiri
    const indexRaw = localStorage.getItem(PRODI_INDEX_KEY);
    let index: string[] = [];
    if (indexRaw) {
      try {
        index = JSON.parse(indexRaw);
      } catch (e) {}
    }
    const cleanName = prodiNameOrCode.trim();
    if (cleanName && !index.includes(cleanName)) {
      index.push(cleanName);
      localStorage.setItem(PRODI_INDEX_KEY, JSON.stringify(index));
    }
    return true;
  } catch (e) {
    console.error("Gagal menyimpan CPL ke localStorage:", e);
    return false;
  }
}

/**
 * Smart Parser: Mengubah teks bebas / copy-paste dari Word, PDF, Excel, atau Web
 * menjadi daftar CplItem terstruktur tanpa tumpang tindih.
 */
export function parseBulkCplText(rawText: string): CplItem[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: CplItem[] = [];
  let currentCategory: CplItem["category"] = "Keterampilan Khusus";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Deteksi heading kategori (misal: "### Sikap", "A. SIKAP", "[Keterampilan Umum]")
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes("sikap") &&
      line.length < 50 &&
      !line.match(/cpl\s*\d+/i)
    ) {
      currentCategory = "Sikap";
      continue;
    }
    if (
      lowerLine.includes("keterampilan umum") &&
      line.length < 60 &&
      !line.match(/cpl\s*\d+/i)
    ) {
      currentCategory = "Keterampilan Umum";
      continue;
    }
    if (
      lowerLine.includes("keterampilan khusus") &&
      line.length < 60 &&
      !line.match(/cpl\s*\d+/i)
    ) {
      currentCategory = "Keterampilan Khusus";
      continue;
    }
    if (
      (lowerLine.includes("pengetahuan") ||
        lowerLine.includes("penguasaan pengetahuan")) &&
      line.length < 60 &&
      !line.match(/cpl\s*\d+/i)
    ) {
      currentCategory = "Penguasaan Pengetahuan";
      continue;
    }

    // Cek apakah format Excel / Tab-separated (Col1: Kode, Col2: Kategori (opsional), Col3: Deskripsi)
    if (line.includes("\t")) {
      const parts = line.split("\t").map((p) => p.trim());
      if (parts.length >= 2) {
        let code = parts[0].toUpperCase();
        if (!code.startsWith("CPL")) {
          code = `CPL${results.length + 1}`;
        }
        let desc = parts[parts.length - 1];
        let cat: CplItem["category"] = currentCategory;
        if (parts.length >= 3) {
          const catCandidate = parts[1].toLowerCase();
          if (catCandidate.includes("sikap")) cat = "Sikap";
          else if (catCandidate.includes("umum")) cat = "Keterampilan Umum";
          else if (catCandidate.includes("pengetahuan"))
            cat = "Penguasaan Pengetahuan";
          else if (catCandidate.includes("integrasi"))
            cat = "Integrasi (S, P, K)";
          else cat = "Keterampilan Khusus";
        }
        if (desc.length > 3) {
          results.push({ id: code, category: cat, desc });
          continue;
        }
      }
    }

    // Pola Standar: "CPL 1 - Deskripsi..." atau "CPL-02: Deskripsi..." atau "CPL3. Deskripsi..."
    const cplMatch = line.match(/^(?:CPL|CPL-)?\s*(\d+)[\s.:\-–—)]+(.*)$/i);
    if (cplMatch) {
      const num = parseInt(cplMatch[1], 10);
      const desc = cplMatch[2].trim();
      if (desc.length > 0) {
        // Cek apakah deskripsi mengandung label kategori di awal, misal "[Sikap] Mampu..."
        let itemCat: CplItem["category"] = currentCategory;
        let cleanDesc = desc;
        const catTagMatch = desc.match(/^\[(Sikap|Keterampilan Umum|Keterampilan Khusus|Penguasaan Pengetahuan|Pengetahuan|Integrasi)\]\s*(.*)$/i);
        if (catTagMatch) {
          const tag = catTagMatch[1].toLowerCase();
          if (tag.includes("sikap")) itemCat = "Sikap";
          else if (tag.includes("umum")) itemCat = "Keterampilan Umum";
          else if (tag.includes("pengetahuan")) itemCat = "Penguasaan Pengetahuan";
          else if (tag.includes("integrasi")) itemCat = "Integrasi (S, P, K)";
          else itemCat = "Keterampilan Khusus";
          cleanDesc = catTagMatch[2].trim();
        }

        results.push({
          id: `CPL${num}`,
          category: itemCat,
          desc: cleanDesc || desc,
        });
        continue;
      }
    }

    // Pola nomor biasa: "1. Mampu..." atau "1) Mampu..."
    const numMatch = line.match(/^(\d+)[\s.:)\]\-–—]+(.*)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      const desc = numMatch[2].trim();
      if (desc.length > 5) {
        results.push({
          id: `CPL${num || results.length + 1}`,
          category: currentCategory,
          desc,
        });
        continue;
      }
    }

    // Pola bullet: "- Mampu..." atau "• Menguasai..."
    const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch && bulletMatch[1].trim().length > 5) {
      results.push({
        id: `CPL${results.length + 1}`,
        category: currentCategory,
        desc: bulletMatch[1].trim(),
      });
      continue;
    }

    // Jika baris cukup panjang dan belum tertangkap, anggap sebagai satu butir CPL
    if (line.length > 15) {
      results.push({
        id: `CPL${results.length + 1}`,
        category: currentCategory,
        desc: line,
      });
    }
  }

  // Jika kode CPL duplikat, buat berurutan
  const seenIds = new Set<string>();
  return results.map((item, idx) => {
    let finalId = item.id;
    if (seenIds.has(finalId)) {
      finalId = `CPL${idx + 1}`;
    }
    seenIds.add(finalId);
    return {
      ...item,
      id: finalId,
    };
  });
}
