import { CplItem } from "../types/rps";

export interface FacultyStatutaColor {
  id: string;
  name: string;
  hexFill: string;
  hexText: string;
  border?: string;
  description: string;
}

export const UNPATTI_FACULTY_STATUTA: FacultyStatutaColor[] = [
  {
    id: "faperta",
    name: "FAKULTAS PERTANIAN",
    hexFill: "#008000",
    hexText: "#FFFFFF",
    description: "Fakultas Pertanian berwarna hijau dengan kode warna #008000",
  },
  {
    id: "hukum",
    name: "FAKULTAS HUKUM",
    hexFill: "#FF0000",
    hexText: "#FFFFFF",
    description: "Fakultas Hukum berwarna merah dengan kode warna #FF0000",
  },
  {
    id: "fisip",
    name: "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
    hexFill: "#FF00FE",
    hexText: "#000000",
    description: "Fakultas Ilmu Sosial dan Ilmu Politik berwarna kuning/magenta dengan kode warna #FF00FE",
  },
  {
    id: "fkip",
    name: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    hexFill: "#BF00FE",
    hexText: "#FFFFFF",
    description: "Fakultas Keguruan dan Ilmu Pendidikan berwarna ungu dengan kode warna #BF00FE",
  },
  {
    id: "feb",
    name: "FAKULTAS EKONOMI DAN BISNIS",
    hexFill: "#32CD32",
    hexText: "#0f172a",
    description: "Fakultas Ekonomi dan Bisnis berwarna hijau muda dengan kode warna #32CD32",
  },
  {
    id: "fateka",
    name: "FAKULTAS TEKNIK",
    hexFill: "#01008E",
    hexText: "#FFFFFF",
    description: "Fakultas Teknik berwarna biru tua dengan kode warna #01008E",
  },
  {
    id: "fpik",
    name: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    hexFill: "#0000CE",
    hexText: "#FFFFFF",
    description: "Fakultas Perikanan dan Ilmu Kelautan berwarna biru laut dengan kode warna #0000CE",
  },
  {
    id: "fmipa",
    name: "FAKULTAS SAINS DAN TEKNOLOGI",
    hexFill: "#FF8B00",
    hexText: "#FFFFFF",
    description: "Fakultas Sains dan Teknologi (MIPA) berwarna orange dengan kode warna #FF8B00",
  },
  {
    id: "fk",
    name: "FAKULTAS KEDOKTERAN",
    hexFill: "#FFFFFF",
    hexText: "#008000",
    border: "2px solid #008000",
    description: "Fakultas Kedokteran berwarna putih dengan kode warna #FFFFFF dan huruf hijau",
  },
  {
    id: "pasca",
    name: "PROGRAM PASCASARJANA",
    hexFill: "#00BFFF",
    hexText: "#0f172a",
    description: "Program Pascasarjana berwarna biru dengan kode warna #00BFFF",
  },
  {
    id: "psdku",
    name: "PROGRAM PSDKU",
    hexFill: "#0000FE",
    hexText: "#FFFFFF",
    description: "PSDKU berwarna biru dengan kode warna #0000FE",
  },
];

export function getFacultyStatutaColor(facultyName: string): FacultyStatutaColor {
  const normalized = (facultyName || "").toUpperCase();
  for (const f of UNPATTI_FACULTY_STATUTA) {
    if (normalized.includes(f.name) || f.name.includes(normalized)) {
      return f;
    }
  }
  // Keyword checks
  if (normalized === "FH" || normalized.includes("HUKUM")) return UNPATTI_FACULTY_STATUTA[1];
  if (normalized.includes("SOSIAL") || normalized.includes("POLITIK") || normalized.includes("FISIP"))
    return UNPATTI_FACULTY_STATUTA[2];
  if (normalized.includes("KEGURUAN") || normalized.includes("PENDIDIKAN") || normalized.includes("FKIP"))
    return UNPATTI_FACULTY_STATUTA[3];
  if (normalized.includes("EKONOMI") || normalized.includes("BISNIS") || normalized.includes("FEB"))
    return UNPATTI_FACULTY_STATUTA[4];
  if (normalized.includes("PERTANIAN") || normalized.includes("FAPERTA"))
    return UNPATTI_FACULTY_STATUTA[0];
  if (normalized === "FATEK" || (normalized.includes("TEKNIK") && !normalized.includes("SAINS")))
    return UNPATTI_FACULTY_STATUTA[5];
  if (normalized.includes("PERIKANAN") || normalized.includes("KELAUTAN") || normalized.includes("FPIK"))
    return UNPATTI_FACULTY_STATUTA[6];
  if (normalized === "FST" || normalized.includes("SAINS") || normalized.includes("MIPA") || normalized.includes("TEKNOLOGI"))
    return UNPATTI_FACULTY_STATUTA[7];
  if (normalized === "FK" || normalized.includes("KEDOKTERAN")) return UNPATTI_FACULTY_STATUTA[8];
  if (normalized.includes("PASCASARJANA") || normalized.includes("PASCA"))
    return UNPATTI_FACULTY_STATUTA[9];
  if (normalized.includes("PSDKU")) return UNPATTI_FACULTY_STATUTA[10];

  return UNPATTI_FACULTY_STATUTA[0];
}

export type JenjangPendidikan = "S1" | "S2" | "S3" | "Pro" | "Vok" | "Profesi" | "Spesialis";

export interface JenjangOption {
  code: JenjangPendidikan;
  label: string;
  degreeName: string;
  kkniLevel: number;
  description: string;
}

export const JENJANG_OPTIONS: JenjangOption[] = [
  {
    code: "S1",
    label: "Sarjana (S1)",
    degreeName: "Sarjana (S1)",
    kkniLevel: 6,
    description: "Jenjang Sarjana S1 / Sarjana Terapan (D4) - KKNI Level 6",
  },
  {
    code: "S2",
    label: "Magister (S2)",
    degreeName: "Magister (S2)",
    kkniLevel: 8,
    description: "Jenjang Magister S2 / Magister Terapan - KKNI Level 8",
  },
  {
    code: "S3",
    label: "Doktoral (S3)",
    degreeName: "Doktoral (S3)",
    kkniLevel: 9,
    description: "Jenjang Doktoral S3 / Doktor Terapan - KKNI Level 9",
  },
  {
    code: "Profesi",
    label: "Profesi",
    degreeName: "Profesi",
    kkniLevel: 7,
    description: "Jenjang Pendidikan Profesi - KKNI Level 7",
  },
  {
    code: "Spesialis",
    label: "Spesialis",
    degreeName: "Spesialis",
    kkniLevel: 8,
    description: "Jenjang Pendidikan Spesialis - KKNI Level 8",
  },
  {
    code: "Pro",
    label: "Profesi (Pro)",
    degreeName: "Profesi",
    kkniLevel: 7,
    description: "Jenjang Pendidikan Profesi / Spesialis 1 - KKNI Level 7",
  },
  {
    code: "Vok",
    label: "Vokasi (Vok)",
    degreeName: "Diploma / Vokasi",
    kkniLevel: 5,
    description: "Jenjang Pendidikan Vokasi (D3/D4) - KKNI Level 5-6",
  },
];

export interface ProdiItem {
  kodeProdi: string; // Used as password & link parameter
  namaProdi: string;
  jenjang: JenjangPendidikan;
  fakultas: string;
  namaKaprodi: string;
  defaultCourses?: Array<{
    kodeMK: string;
    namaMK: string;
    sks: number;
    semester: string;
    deskripsi: string;
  }>;
  cplList: CplItem[];
}

export const UNPATTI_PRODI_DATABASE: ProdiItem[] = [
  {
    kodeProdi: "86004",
    namaProdi: "S3 Administrasi Pendidikan",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Administrasi Pendidikan",
    cplList: [],
  },
  {
    kodeProdi: "86204",
    namaProdi: "S1 Administrasi Pendidikan",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Administrasi Pendidikan",
    cplList: [],
  },
  {
    kodeProdi: "63002",
    namaProdi: "S3 Administrasi Publik",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Administrasi Publik",
    cplList: [],
  },
  {
    kodeProdi: "63101",
    namaProdi: "S2 Administrasi Publik",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Administrasi Publik",
    cplList: [],
  },
  {
    kodeProdi: "54201",
    namaProdi: "S1 Agribisnis",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Agribisnis",
    cplList: [],
  },
  {
    kodeProdi: "54245",
    namaProdi: "S1 Agrobisnis Perikanan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    namaKaprodi: "Kaprodi S1 Agrobisnis Perikanan",
    cplList: [],
  },
  {
    kodeProdi: "54211",
    namaProdi: "S1 Agroteknologi",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Agroteknologi",
    cplList: [],
  },
  {
    kodeProdi: "62201",
    namaProdi: "S1 Akuntansi",
    jenjang: "S1",
    fakultas: "FAKULTAS EKONOMI DAN BISNIS",
    namaKaprodi: "Kaprodi S1 Akuntansi",
    cplList: [],
  },
  {
    kodeProdi: "62207",
    namaProdi: "S1 Akuntansi (Kampus Kab. Kep. Aru)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN KEPULAUAN ARU",
    namaKaprodi: "Kaprodi S1 Akuntansi (Kampus Kab. Kep. Aru)",
    cplList: [],
  },
  {
    kodeProdi: "62206",
    namaProdi: "S1 Akuntansi (Kampus Kab. MBD)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN MALUKU BARAT DAYA",
    namaKaprodi: "Kaprodi S1 Akuntansi (Kampus Kab. MBD)",
    cplList: [],
  },
  {
    kodeProdi: "11707",
    namaProdi: "Sp-1 Bedah",
    jenjang: "Spesialis",
    fakultas: "FAKULTAS KEDOKTERAN",
    namaKaprodi: "Kaprodi Sp-1 Bedah",
    cplList: [],
  },
  {
    kodeProdi: "86201",
    namaProdi: "S1 Bimbingan Dan Konseling",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Bimbingan Dan Konseling",
    cplList: [],
  },
  {
    kodeProdi: "54207",
    namaProdi: "S1 Bioteknologi",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Bioteknologi",
    cplList: [],
  },
  {
    kodeProdi: "54243",
    namaProdi: "S1 Budidaya Perairan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    namaKaprodi: "Kaprodi S1 Budidaya Perairan",
    cplList: [],
  },
  {
    kodeProdi: "60201",
    namaProdi: "S1 Ekonomi Pembangunan",
    jenjang: "S1",
    fakultas: "FAKULTAS EKONOMI DAN BISNIS",
    namaKaprodi: "Kaprodi S1 Ekonomi Pembangunan",
    cplList: [],
  },
  {
    kodeProdi: "63102",
    namaProdi: "S2 Ekonomi Terapan",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Ekonomi Terapan",
    cplList: [],
  },
  {
    kodeProdi: "48201",
    namaProdi: "S1 Farmasi",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Farmasi",
    cplList: [],
  },
  {
    kodeProdi: "45201",
    namaProdi: "S1 Fisika",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Fisika",
    cplList: [],
  },
  {
    kodeProdi: "13211",
    namaProdi: "S1 Gizi",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Gizi",
    cplList: [],
  },
  {
    kodeProdi: "74204",
    namaProdi: "S1 Hukum (Kampus Kab. Kep. Aru)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN KEPULAUAN ARU",
    namaKaprodi: "Kaprodi S1 Hukum (Kampus Kab. Kep. Aru)",
    cplList: [],
  },
  {
    kodeProdi: "74203",
    namaProdi: "S1 Hukum (Kampus Kab. MBD)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN MALUKU BARAT DAYA",
    namaKaprodi: "Kaprodi S1 Hukum (Kampus Kab. MBD)",
    cplList: [],
  },
  {
    kodeProdi: "63201",
    namaProdi: "S1 Ilmu Administrasi Negara",
    jenjang: "S1",
    fakultas: "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
    namaKaprodi: "Kaprodi S1 Ilmu Administrasi Negara",
    cplList: [],
  },
  {
    kodeProdi: "60101",
    namaProdi: "S2 Ilmu Ekonomi",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Ilmu Ekonomi",
    cplList: [],
  },
  {
    kodeProdi: "74001",
    namaProdi: "S3 Ilmu Hukum",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Ilmu Hukum",
    cplList: [],
  },
  {
    kodeProdi: "74101",
    namaProdi: "S2 Ilmu Hukum",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Ilmu Hukum",
    cplList: [],
  },
  {
    kodeProdi: "74201",
    namaProdi: "S1 Ilmu Hukum",
    jenjang: "S1",
    fakultas: "FAKULTAS HUKUM",
    namaKaprodi: "Kaprodi S1 Ilmu Hukum",
    cplList: [],
  },
  {
    kodeProdi: "54041",
    namaProdi: "S3 Ilmu Kelautan",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Ilmu Kelautan",
    cplList: [],
  },
  {
    kodeProdi: "54141",
    namaProdi: "S2 Ilmu Kelautan",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Ilmu Kelautan",
    cplList: [],
  },
  {
    kodeProdi: "54241",
    namaProdi: "S1 Ilmu Kelautan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    namaKaprodi: "Kaprodi S1 Ilmu Kelautan",
    cplList: [],
  },
  {
    kodeProdi: "55201",
    namaProdi: "S1 Ilmu Komputer",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Ilmu Komputer",
    cplList: [],
  },
  {
    kodeProdi: "70201",
    namaProdi: "S1 Ilmu Komunikasi",
    jenjang: "S1",
    fakultas: "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
    namaKaprodi: "Kaprodi S1 Ilmu Komunikasi",
    cplList: [],
  },
  {
    kodeProdi: "25201",
    namaProdi: "S1 Ilmu Lingkungan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Ilmu Lingkungan",
    cplList: [],
  },
  {
    kodeProdi: "61001",
    namaProdi: "S3 Ilmu Manajemen",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Ilmu Manajemen",
    cplList: [],
  },
  {
    kodeProdi: "65201",
    namaProdi: "S1 Ilmu Pemerintahan",
    jenjang: "S1",
    fakultas: "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
    namaKaprodi: "Kaprodi S1 Ilmu Pemerintahan",
    cplList: [],
  },
  {
    kodeProdi: "11766",
    namaProdi: "Sp-1 Ilmu Penyakit Dalam",
    jenjang: "Spesialis",
    fakultas: "FAKULTAS KEDOKTERAN",
    namaKaprodi: "Kaprodi Sp-1 Ilmu Penyakit Dalam",
    cplList: [],
  },
  {
    kodeProdi: "54001",
    namaProdi: "S3 Ilmu Pertanian",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Ilmu Pertanian",
    cplList: [],
  },
  {
    kodeProdi: "54108",
    namaProdi: "S2 Ilmu Pertanian",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Ilmu Pertanian",
    cplList: [],
  },
  {
    kodeProdi: "54294",
    namaProdi: "S1 Ilmu Tanah",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Ilmu Tanah",
    cplList: [],
  },
  {
    kodeProdi: "12201",
    namaProdi: "S1 Kedokteran Gigi",
    jenjang: "S1",
    fakultas: "FAKULTAS KEDOKTERAN",
    namaKaprodi: "Kaprodi S1 Kedokteran Gigi",
    cplList: [],
  },
  {
    kodeProdi: "13242",
    namaProdi: "S1 Keselamatan dan Kesehatan Kerja",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Keselamatan dan Kesehatan Kerja",
    cplList: [],
  },
  {
    kodeProdi: "94202",
    namaProdi: "S1 Kewirausahaan",
    jenjang: "S1",
    fakultas: "FAKULTAS EKONOMI DAN BISNIS",
    namaKaprodi: "Kaprodi S1 Kewirausahaan",
    cplList: [],
  },
  {
    kodeProdi: "47102",
    namaProdi: "S2 Kimia",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Kimia",
    cplList: [],
  },
  {
    kodeProdi: "54151",
    namaProdi: "S2 Manajemen Hutan",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Manajemen Hutan",
    cplList: [],
  },
  {
    kodeProdi: "86131",
    namaProdi: "S2 Manajemen Pendidikan",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Manajemen Pendidikan",
    cplList: [],
  },
  {
    kodeProdi: "54242",
    namaProdi: "S1 Manajemen Sumber Daya Perairan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    namaKaprodi: "Kaprodi S1 Manajemen Sumber Daya Perairan",
    cplList: [],
  },
  {
    kodeProdi: "54145",
    namaProdi: "S2 Manajemen Sumberdaya Kelautan dan Pulau-pulau Kecil",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Manajemen Sumberdaya Kelautan dan Pulau-pulau Kecil",
    cplList: [],
  },
  {
    kodeProdi: "11716",
    namaProdi: "Sp-1 Obstetri dan Ginekologi",
    jenjang: "Spesialis",
    fakultas: "FAKULTAS KEDOKTERAN",
    namaKaprodi: "Kaprodi Sp-1 Obstetri dan Ginekologi",
    cplList: [],
  },
  {
    kodeProdi: "38201",
    namaProdi: "S1 Oseanografi",
    jenjang: "S1",
    fakultas: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    namaKaprodi: "Kaprodi S1 Oseanografi",
    cplList: [],
  },
  {
    kodeProdi: "54246",
    namaProdi: "S1 Pemanfaatan Sumber Daya Perikanan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    namaKaprodi: "Kaprodi S1 Pemanfaatan Sumber Daya Perikanan",
    cplList: [],
  },
  {
    kodeProdi: "86228",
    namaProdi: "S1 Pembangunan Sosial",
    jenjang: "S1",
    fakultas: "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
    namaKaprodi: "Kaprodi S1 Pembangunan Sosial",
    cplList: [],
  },
  {
    kodeProdi: "54293",
    namaProdi: "S1 Pemuliaan Tanaman",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Pemuliaan Tanaman",
    cplList: [],
  },
  {
    kodeProdi: "86904",
    namaProdi: "Profesi Pendidikan Guru",
    jenjang: "Profesi",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi Profesi Pendidikan Guru",
    cplList: [],
  },
  {
    kodeProdi: "12902",
    namaProdi: "Profesi Pendidikan Profesi Dokter Gigi",
    jenjang: "Profesi",
    fakultas: "FAKULTAS KEDOKTERAN",
    namaKaprodi: "Kaprodi Profesi Pendidikan Profesi Dokter Gigi",
    cplList: [],
  },
  {
    kodeProdi: "88201",
    namaProdi: "S1 Pendidikan Bahasa Dan Sastra Indonesia",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Bahasa Dan Sastra Indonesia",
    cplList: [],
  },
  {
    kodeProdi: "88103",
    namaProdi: "S2 Pendidikan Bahasa Inggris",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Pendidikan Bahasa Inggris",
    cplList: [],
  },
  {
    kodeProdi: "88203",
    namaProdi: "S1 Pendidikan Bahasa Inggris",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Bahasa Inggris",
    cplList: [],
  },
  {
    kodeProdi: "882032",
    namaProdi: "S1 Pendidikan Bahasa Inggris (Kampus Kab. Kep. Aru)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN KEPULAUAN ARU",
    namaKaprodi: "Kaprodi S1 Pendidikan Bahasa Inggris (Kampus Kab. Kep. Aru)",
    cplList: [],
  },
  {
    kodeProdi: "882031",
    namaProdi: "S1 Pendidikan Bahasa Inggris (Kampus Kab. MBD)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN MALUKU BARAT DAYA",
    namaKaprodi: "Kaprodi S1 Pendidikan Bahasa Inggris (Kampus Kab. MBD)",
    cplList: [],
  },
  {
    kodeProdi: "88107",
    namaProdi: "S2 Pendidikan Bahasa Jerman",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Pendidikan Bahasa Jerman",
    cplList: [],
  },
  {
    kodeProdi: "84005",
    namaProdi: "S3 Pendidikan Biologi",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Pendidikan Biologi",
    cplList: [],
  },
  {
    kodeProdi: "84105",
    namaProdi: "S2 Pendidikan Biologi",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Pendidikan Biologi",
    cplList: [],
  },
  {
    kodeProdi: "11201",
    namaProdi: "S1 Pendidikan Dokter",
    jenjang: "S1",
    fakultas: "FAKULTAS KEDOKTERAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Dokter",
    cplList: [],
  },
  {
    kodeProdi: "87203",
    namaProdi: "S1 Pendidikan Ekonomi",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Ekonomi",
    cplList: [],
  },
  {
    kodeProdi: "84203",
    namaProdi: "S1 Pendidikan Fisika",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Fisika",
    cplList: [],
  },
  {
    kodeProdi: "87202",
    namaProdi: "S1 Pendidikan Geografi",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Geografi",
    cplList: [],
  },
  {
    kodeProdi: "86207",
    namaProdi: "S1 Pendidikan Guru Pendidikan Anak Usia Dini",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Guru Pendidikan Anak Usia Dini",
    cplList: [],
  },
  {
    kodeProdi: "86206",
    namaProdi: "S1 Pendidikan Guru Sekolah Dasar",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Guru Sekolah Dasar",
    cplList: [],
  },
  {
    kodeProdi: "862062",
    namaProdi: "S1 Pendidikan Guru Sekolah Dasar (kampus Kab. Kep. Aru)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN KEPULAUAN ARU",
    namaKaprodi: "Kaprodi S1 Pendidikan Guru Sekolah Dasar (kampus Kab. Kep. Aru)",
    cplList: [],
  },
  {
    kodeProdi: "862061",
    namaProdi: "S1 Pendidikan Guru Sekolah Dasar (Kampus Kab. MBD)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN MALUKU BARAT DAYA",
    namaKaprodi: "Kaprodi S1 Pendidikan Guru Sekolah Dasar (Kampus Kab. MBD)",
    cplList: [],
  },
  {
    kodeProdi: "852011",
    namaProdi: "S1 Pendidikan Jasmani (Kampus Kab. Kep. Aru)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN KEPULAUAN ARU",
    namaKaprodi: "Kaprodi S1 Pendidikan Jasmani (Kampus Kab. Kep. Aru)",
    cplList: [],
  },
  {
    kodeProdi: "85201",
    namaProdi: "S1 Pendidikan Jasmani, Kesehatan & Rekreasi",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Jasmani, Kesehatan & Rekreasi",
    cplList: [],
  },
  {
    kodeProdi: "84204",
    namaProdi: "S1 Pendidikan Kimia",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Kimia",
    cplList: [],
  },
  {
    kodeProdi: "86205",
    namaProdi: "S1 Pendidikan Luar Sekolah",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Luar Sekolah",
    cplList: [],
  },
  {
    kodeProdi: "84002",
    namaProdi: "S1 Pendidikan Matematika",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Matematika",
    cplList: [],
  },
  {
    kodeProdi: "84102",
    namaProdi: "S2 Pendidikan Matematika",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Pendidikan Matematika",
    cplList: [],
  },
  {
    kodeProdi: "84202",
    namaProdi: "S3 Pendidikan Matematika",
    jenjang: "S3",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S3 Pendidikan Matematika",
    cplList: [],
  },
  {
    kodeProdi: "842022",
    namaProdi: "S1 Pendidikan Matematika (Kampus Kab Kep. Aru)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN KEPULAUAN ARU",
    namaKaprodi: "Kaprodi S1 Pendidikan Matematika (Kampus Kab Kep. Aru)",
    cplList: [],
  },
  {
    kodeProdi: "842021",
    namaProdi: "S1 Pendidikan Matematika (Kampus Kab. MBD)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN MALUKU BARAT DAYA",
    namaKaprodi: "Kaprodi S1 Pendidikan Matematika (Kampus Kab. MBD)",
    cplList: [],
  },
  {
    kodeProdi: "87157",
    namaProdi: "S2 Pendidikan Pancasila dan Kewarganegaraan",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Pendidikan Pancasila dan Kewarganegaraan",
    cplList: [],
  },
  {
    kodeProdi: "87205",
    namaProdi: "S1 Pendidikan Pancasila Dan Kewarganegaraan",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Pancasila Dan Kewarganegaraan",
    cplList: [],
  },
  {
    kodeProdi: "87201",
    namaProdi: "S1 Pendidikan Sejarah",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Sejarah",
    cplList: [],
  },
  {
    kodeProdi: "54258",
    namaProdi: "S1 Pengelolaan Hutan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Pengelolaan Hutan",
    cplList: [],
  },
  {
    kodeProdi: "54105",
    namaProdi: "S2 Pengelolaan Lahan",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Pengelolaan Lahan",
    cplList: [],
  },
  {
    kodeProdi: "54203",
    namaProdi: "S1 Penyuluhan Pertanian",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Penyuluhan Pertanian",
    cplList: [],
  },
  {
    kodeProdi: "94205",
    namaProdi: "S1 Perdagangan Internasional",
    jenjang: "S1",
    fakultas: "FAKULTAS EKONOMI DAN BISNIS",
    namaKaprodi: "Kaprodi S1 Perdagangan Internasional",
    cplList: [],
  },
  {
    kodeProdi: "35201",
    namaProdi: "S1 Perencanaan Wilayah dan Kota",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Perencanaan Wilayah dan Kota",
    cplList: [],
  },
  {
    kodeProdi: "54231",
    namaProdi: "S1 Peternakan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Peternakan",
    cplList: [],
  },
  {
    kodeProdi: "54232",
    namaProdi: "S1 Peternakan (Kampus Kab. MBD)",
    jenjang: "S1",
    fakultas: "PSDKU KABUPATEN MALUKU BARAT DAYA",
    namaKaprodi: "Kaprodi S1 Peternakan (Kampus Kab. MBD)",
    cplList: [],
  },
  {
    kodeProdi: "11901",
    namaProdi: "Profesi Profesi Dokter",
    jenjang: "Profesi",
    fakultas: "FAKULTAS KEDOKTERAN",
    namaKaprodi: "Kaprodi Profesi Profesi Dokter",
    cplList: [],
  },
  {
    kodeProdi: "21300",
    namaProdi: "S1 Rekayasa Instrumentasi dan Otomasi",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Rekayasa Instrumentasi dan Otomasi",
    cplList: [],
  },
  {
    kodeProdi: "54159",
    namaProdi: "S2 Rekayasa Kelautan",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Rekayasa Kelautan",
    cplList: [],
  },
  {
    kodeProdi: "11312",
    namaProdi: "S1 Sains Biomedis",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Sains Biomedis",
    cplList: [],
  },
  {
    kodeProdi: "69101",
    namaProdi: "S1 Sosiologi",
    jenjang: "S1",
    fakultas: "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
    namaKaprodi: "Kaprodi S1 Sosiologi",
    cplList: [],
  },
  {
    kodeProdi: "69201",
    namaProdi: "S2 Sosiologi",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Sosiologi",
    cplList: [],
  },
  {
    kodeProdi: "34201",
    namaProdi: "S1 Teknik Geologi",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Geologi",
    cplList: [],
  },
  {
    kodeProdi: "26201",
    namaProdi: "S1 Teknik Industri",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Industri",
    cplList: [],
  },
  {
    kodeProdi: "24201",
    namaProdi: "S1 Teknik Kimia",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Kimia",
    cplList: [],
  },
  {
    kodeProdi: "21201",
    namaProdi: "S1 Teknik Mesin",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Mesin",
    cplList: [],
  },
  {
    kodeProdi: "36201",
    namaProdi: "S1 Teknik Perkapalan",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Perkapalan",
    cplList: [],
  },
  {
    kodeProdi: "32201",
    namaProdi: "S1 Teknik Perminyakan",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Perminyakan",
    cplList: [],
  },
  {
    kodeProdi: "22201",
    namaProdi: "S1 Teknik Sipil",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Sipil",
    cplList: [],
  },
  {
    kodeProdi: "36202",
    namaProdi: "S1 Teknik Sistem Perkapalan",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Sistem Perkapalan",
    cplList: [],
  },
  {
    kodeProdi: "21207",
    namaProdi: "S1 Teknik Transportasi Laut",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Transportasi Laut",
    cplList: [],
  },
  {
    kodeProdi: "54244",
    namaProdi: "S1 Teknologi Hasil Perikanan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    namaKaprodi: "Kaprodi S1 Teknologi Hasil Perikanan",
    cplList: [],
  },
  {
    kodeProdi: "41231",
    namaProdi: "S1 Teknologi Hasil Pertanian",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Teknologi Hasil Pertanian",
    cplList: [],
  },
  {
    kodeProdi: "46201",
    namaProdi: "S1 Biologi",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Biologi",
    cplList: [],
  },
  {
    kodeProdi: "33201",
    namaProdi: "S1 Teknik Geofisika",
    jenjang: "S1",
    fakultas: "FAKULTAS TEKNIK",
    namaKaprodi: "Kaprodi S1 Teknik Geofisika",
    cplList: [],
  },
  {
    kodeProdi: "54101",
    namaProdi: "S2 Agribisnis",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Agribisnis",
    cplList: [],
  },
  {
    kodeProdi: "49201",
    namaProdi: "S1 Statistika",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Statistika",
    cplList: [],
  },
  {
    kodeProdi: "61201",
    namaProdi: "S2 Manajemen",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Manajemen",
    cplList: [],
  },
  {
    kodeProdi: "88207",
    namaProdi: "S1 Pendidikan Bahasa Jerman",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Bahasa Jerman",
    cplList: [],
  },
  {
    kodeProdi: "47201",
    namaProdi: "S1 Kimia",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Kimia",
    cplList: [],
  },
  {
    kodeProdi: "54251",
    namaProdi: "S1 Kehutanan",
    jenjang: "S1",
    fakultas: "FAKULTAS PERTANIAN",
    namaKaprodi: "Kaprodi S1 Kehutanan",
    cplList: [],
  },
  {
    kodeProdi: "84205",
    namaProdi: "S1 Pendidikan Biologi",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Biologi",
    cplList: [],
  },
  {
    kodeProdi: "87209",
    namaProdi: "S1 Pendidikan Akuntansi",
    jenjang: "S1",
    fakultas: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    namaKaprodi: "Kaprodi S1 Pendidikan Akuntansi",
    cplList: [],
  },
  {
    kodeProdi: "44201",
    namaProdi: "S1 Matematika",
    jenjang: "S1",
    fakultas: "FAKULTAS SAINS DAN TEKNOLOGI",
    namaKaprodi: "Kaprodi S1 Matematika",
    cplList: [],
  },
  {
    kodeProdi: "62101",
    namaProdi: "S2 Ilmu Akuntansi",
    jenjang: "S2",
    fakultas: "PROGRAM PASCASARJANA",
    namaKaprodi: "Kaprodi S2 Ilmu Akuntansi",
    cplList: [],
  },
];

/**
 * Helper mencari Program Studi berdasarkan Kode Prodi (exact match)
 */
export function findProdiByKode(kode: string): ProdiItem | undefined {
  if (!kode) return undefined;
  const cleaned = kode.trim().toLowerCase();
  return UNPATTI_PRODI_DATABASE.find((p) => p.kodeProdi.toLowerCase() === cleaned);
}

/**
 * Helper mencari Program Studi berdasarkan nama prodi (fuzzy / contains)
 */
export function findProdiByName(name: string): ProdiItem | undefined {
  if (!name) return undefined;
  const cleaned = name.trim().toLowerCase();
  return UNPATTI_PRODI_DATABASE.find((p) =>
    p.namaProdi.toLowerCase().includes(cleaned) || cleaned.includes(p.namaProdi.toLowerCase())
  );
}

/**
 * Helper menyaring prodi berdasarkan Jenjang
 */
export function getProdisByJenjang(jenjang: JenjangPendidikan): ProdiItem[] {
  return UNPATTI_PRODI_DATABASE.filter((p) => p.jenjang === jenjang);
}

/**
 * Helper menyaring prodi berdasarkan Fakultas
 */
export function getProdisByFakultas(fakultas: string): ProdiItem[] {
  const norm = fakultas.trim().toUpperCase();
  return UNPATTI_PRODI_DATABASE.filter((p) => p.fakultas.toUpperCase().includes(norm));
}

/**
 * Helper pencarian fleksibel (kode, nama, fakultas, kaprodi)
 */
export function searchProdi(query: string): ProdiItem[] {
  if (!query) return UNPATTI_PRODI_DATABASE;
  const q = query.trim().toLowerCase();
  return UNPATTI_PRODI_DATABASE.filter(
    (p) =>
      p.kodeProdi.toLowerCase().includes(q) ||
      p.namaProdi.toLowerCase().includes(q) ||
      p.fakultas.toLowerCase().includes(q) ||
      p.jenjang.toLowerCase().includes(q) ||
      p.namaKaprodi.toLowerCase().includes(q)
  );
}
