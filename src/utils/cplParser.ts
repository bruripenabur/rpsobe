import { CplItem } from "../types/rps";

/**
 * Utilitas Parser Berkas CPL Program Studi (JSON, CSV, TXT, DOCX)
 */
export async function parseUploadedCplFile(file: File): Promise<CplItem[]> {
  const fileName = file.name.toLowerCase();

  // 1. JSON File
  if (fileName.endsWith(".json")) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return data.map((item, idx) => ({
        id: item.id || item.kode || `CPL${idx + 1}`,
        desc: item.desc || item.deskripsi || item.description || String(item),
        category: item.category || item.kategori || "Keterampilan Khusus",
      }));
    } else if (data.cpls && Array.isArray(data.cpls)) {
      return data.cpls.map((item: any, idx: number) => ({
        id: item.id || item.kode || `CPL${idx + 1}`,
        desc: item.desc || item.deskripsi || item.description || String(item),
        category: item.category || item.kategori || "Keterampilan Khusus",
      }));
    }
  }

  // 2. CSV / TXT File
  if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const result: CplItem[] = [];

    for (const line of lines) {
      if (line.toLowerCase().startsWith("id;") || line.toLowerCase().startsWith("kode,")) {
        continue; // header
      }
      // Check delimiter ; or , or tab
      const parts = line.includes(";")
        ? line.split(";")
        : line.includes("\t")
        ? line.split("\t")
        : line.includes(",") && line.indexOf(",") < 15
        ? line.split(",")
        : [line];

      if (parts.length >= 2) {
        const id = parts[0].trim();
        const category = parts.length >= 3 ? parts[1].trim() : "Keterampilan Khusus";
        const desc = parts[parts.length - 1].trim();
        result.push({
          id: id.startsWith("CPL") ? id : `CPL${id}`,
          category: (category as any) || "Keterampilan Khusus",
          desc,
        });
      } else {
        // Regex match: e.g. "CPL 1: Mahasiswa mampu..."
        const match = line.match(/^(CPL\s*[-_]?\s*\d+)[\s:\-–—\.\)]+(.+)$/i);
        if (match) {
          result.push({
            id: match[1].replace(/\s+/g, "").toUpperCase(),
            desc: match[2].trim(),
            category: "Keterampilan Khusus",
          });
        }
      }
    }

    if (result.length > 0) return result;
  }

  // 3. Fallback: Parse line by line from any text/document
  const rawText = await file.text().catch(() => "");
  const regex = /(CPL\s*[-_]?\s*\d+)[\s:\-–—\.\)]+([^\n\r]+)/gi;
  const matches: CplItem[] = [];
  let m;
  while ((m = regex.exec(rawText)) !== null) {
    matches.push({
      id: m[1].replace(/\s+/g, "").toUpperCase(),
      desc: m[2].trim(),
      category: "Keterampilan Khusus",
    });
  }

  if (matches.length > 0) {
    return matches;
  }

  throw new Error("Format berkas CPL tidak dikenali. Gunakan file JSON, CSV, atau TXT dengan format 'CPL1: Deskripsi Capaian...'");
}
