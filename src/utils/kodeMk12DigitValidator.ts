/**
 * Utility Validator & Builder Kode Mata Kuliah 12 Digit
 * Sesuai PERATURAN REKTOR UNIVERSITAS PATTIMURA NOMOR 12 TAHUN 2026
 * TENTANG PERATURAN AKADEMIK UNIVERSITAS PATTIMURA (Pasal 41)
 *
 * Struktur 12 Digit (6 Huruf + 6 Angka):
 * - 3 Huruf Pertama : Akronim Kelompok Mata Kuliah (MWN, MWU, MWF, MWP, MPP)
 * - 3 Huruf Kedua   : Singkatan Program Studi (ditetapkan Keputusan Rektor, contoh: PNT, AGR, HUK, BIO, KIM, MAN, dll.)
 * - 2 Angka Pertama : Tahun Mulai Berlakunya Kurikulum (contoh: 26 untuk kurikulum 2026)
 * - 1 Angka Ketiga  : Jenjang Pendidikan (3=D1, 4=D2, 5=D3, 6=S1/D4, 7=Profesi, 8=S2/Spesialis, 9=S3/Subspesialis)
 * - 1 Angka Keempat : Karakteristik Mata Kuliah (1=Nilai Huruf, 2=Nilai Keterangan)
 * - 2 Angka Kelima-Keenam: Nomor Urut Mata Kuliah Menurut Kelompok MK (01 s.d. 99)
 */

export type KelompokMkCode = "MWN" | "MWU" | "MWF" | "MWP" | "MPP";

export interface KodeMk12DigitStructure {
  kelompok: KelompokMkCode;
  prodiCode: string;
  tahun: string;
  jenjangDigit: "3" | "4" | "5" | "6" | "7" | "8" | "9";
  karakteristik: "1" | "2";
  nomorUrut: string;
}

export const KELOMPOK_MK_OPTIONS: { code: KelompokMkCode; label: string; desc: string }[] = [
  { code: "MWN", label: "Mata Kuliah Wajib Nasional (MWN)", desc: "Agama, Pancasila, Kewarganegaraan, Bahasa Indonesia" },
  { code: "MWU", label: "Mata Kuliah Wajib Universitas (MWU)", desc: "Pengelolaan SDA Kelautan & Kepulauan, Bahasa Inggris, KKN" },
  { code: "MWF", label: "Mata Kuliah Wajib Fakultas (MWF)", desc: "Mata kuliah dasar keilmuan rumpun fakultas" },
  { code: "MWP", label: "Mata Kuliah Wajib Program Studi (MWP)", desc: "Mata kuliah kompetensi inti keahlian program studi" },
  { code: "MPP", label: "Mata Kuliah Pilihan Program Studi (MPP)", desc: "Mata kuliah peminatan/pilihan pendukung keahlian" },
];

export const JENJANG_DIGIT_MAP: Record<string, "3" | "4" | "5" | "6" | "7" | "8" | "9"> = {
  D1: "3",
  D2: "4",
  D3: "5",
  S1: "6",
  D4: "6",
  Sarjana: "6",
  Profesi: "7",
  S2: "8",
  Magister: "8",
  Spesialis: "8",
  S3: "9",
  Doktor: "9",
  Subspesialis: "9",
};

export const JENJANG_OPTIONS: { digit: "3" | "4" | "5" | "6" | "7" | "8" | "9"; label: string }[] = [
  { digit: "3", label: "3 - Diploma I (D1)" },
  { digit: "4", label: "4 - Diploma II (D2)" },
  { digit: "5", label: "5 - Diploma III (D3)" },
  { digit: "6", label: "6 - Sarjana (S1) & Sarjana Terapan (D4)" },
  { digit: "7", label: "7 - Program Profesi" },
  { digit: "8", label: "8 - Magister (S2), Magister Terapan & Spesialis" },
  { digit: "9", label: "9 - Doktor (S3), Doktor Terapan & Subspesialis" },
];

export const KARAKTERISTIK_OPTIONS: { digit: "1" | "2"; label: string; desc: string }[] = [
  { digit: "1", label: "1 - Nilai Huruf (A, B, C, D, E)", desc: "Mata kuliah reguler dengan penilaian nilai mutu huruf" },
  { digit: "2", label: "2 - Nilai Keterangan (Lulus / Tidak Lulus)", desc: "Mata kuliah luar kelas, matrikulasi, atau uji kompetensi (Pasal 47 Ayat 7)" },
];

/**
 * Validasi apakah kode memenuhi format 12 digit Pasal 41
 */
export function validateKodeMk12Digit(rawCode: string): {
  isValid: boolean;
  parsed?: KodeMk12DigitStructure;
  error?: string;
} {
  if (!rawCode) {
    return { isValid: false, error: "Kode mata kuliah belum diisi." };
  }

  const clean = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (clean.length !== 12) {
    return {
      isValid: false,
      error: `Panjang kode saat ini ${clean.length} karakter. Wajib tepat 12 digit (6 huruf + 6 angka) sesuai Pasal 41 Ayat 2.`,
    };
  }

  const letters = clean.slice(0, 6);
  const digits = clean.slice(6, 12);

  if (!/^[A-Z]{6}$/.test(letters)) {
    return {
      isValid: false,
      error: "6 digit pertama harus berupa huruf kapital (3 huruf kelompok + 3 huruf prodi).",
    };
  }

  if (!/^\d{6}$/.test(digits)) {
    return {
      isValid: false,
      error: "6 digit terakhir harus berupa angka.",
    };
  }

  const kelompok = letters.slice(0, 3) as KelompokMkCode;
  const validKelompok: KelompokMkCode[] = ["MWN", "MWU", "MWF", "MWP", "MPP"];
  if (!validKelompok.includes(kelompok)) {
    return {
      isValid: false,
      error: `3 huruf pertama (${kelompok}) tidak valid. Wajib salah satu: MWN, MWU, MWF, MWP, MPP (Pasal 41 Ayat 3).`,
    };
  }

  const prodiCode = letters.slice(3, 6);
  const tahun = digits.slice(0, 2);
  const jenjangDigit = digits[2] as "3" | "4" | "5" | "6" | "7" | "8" | "9";
  if (!["3", "4", "5", "6", "7", "8", "9"].includes(jenjangDigit)) {
    return {
      isValid: false,
      error: `Digit jenjang (${jenjangDigit}) tidak valid. Harus 3 s.d. 9 (Pasal 41 Ayat 5b).`,
    };
  }

  const karakteristik = digits[3] as "1" | "2";
  if (!["1", "2"].includes(karakteristik)) {
    return {
      isValid: false,
      error: `Digit karakteristik (${karakteristik}) tidak valid. Harus 1 (Nilai Huruf) atau 2 (Nilai Keterangan).`,
    };
  }

  const nomorUrut = digits.slice(4, 6);

  return {
    isValid: true,
    parsed: {
      kelompok,
      prodiCode,
      tahun,
      jenjangDigit,
      karakteristik,
      nomorUrut,
    },
  };
}

/**
 * Susun kode 12 digit dari komponen struktur
 */
export function buildKodeMk12Digit(struct: KodeMk12DigitStructure): string {
  const cleanProdi = (struct.prodiCode || "PNT").trim().toUpperCase().slice(0, 3).padEnd(3, "X");
  const cleanTahun = (struct.tahun || "26").trim().slice(0, 2).padStart(2, "2");
  const cleanUrut = (struct.nomorUrut || "01").trim().padStart(2, "0").slice(0, 2);

  return `${struct.kelompok}${cleanProdi}${cleanTahun}${struct.jenjangDigit}${struct.karakteristik}${cleanUrut}`;
}

/**
 * Ekstrak perkiraan 3 huruf singkatan prodi dari nama prodi
 */
export function guessProdiAbbr(namaProdi: string): string {
  if (!namaProdi) return "PNT";
  const clean = namaProdi
    .replace(/^PROGRAM\s+STUDI\s+(S1|S2|S3|D3|D4)?\s*/i, "")
    .trim()
    .toUpperCase();

  if (clean.includes("PENYULUHAN")) return "PNT";
  if (clean.includes("AGROTEKNOLOGI")) return "AGT";
  if (clean.includes("AGRIBISNIS")) return "AGB";
  if (clean.includes("HUKUM")) return "HUK";
  if (clean.includes("MANAJEMEN")) return "MAN";
  if (clean.includes("AKUNTANSI")) return "AKT";
  if (clean.includes("KEDOKTERAN")) return "KDK";
  if (clean.includes("BIOLOGI")) return "BIO";
  if (clean.includes("KIMIA")) return "KIM";
  if (clean.includes("FISIKA")) return "FIS";
  if (clean.includes("MATEMATIKA")) return "MAT";
  if (clean.includes("INFORMATIKA") || clean.includes("KOMPUTER")) return "INF";
  if (clean.includes("PERIKANAN") || clean.includes("KELAUTAN")) return "MSP";
  if (clean.includes("KEHUTANAN")) return "KHT";
  if (clean.includes("PETERNAKAN")) return "PTN";
  if (clean.includes("BAHASA INGGRIS")) return "BIG";
  if (clean.includes("BAHASA INDONESIA")) return "BIN";
  if (clean.includes("TEKNIK MESIN")) return "TME";
  if (clean.includes("TEKNIK SIPIL")) return "TSI";

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0].slice(0, 2) + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 3).padEnd(3, "X");
}
