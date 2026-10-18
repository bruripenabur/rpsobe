import { CourseObjectiveRubric } from "./rubric";

export interface CplItem {
  id: string;
  desc: string;
  category?: "Sikap" | "Keterampilan Umum" | "Keterampilan Khusus" | "Penguasaan Pengetahuan" | "Integrasi (S, P, K)";
}

export interface SdgItem {
  id: number;
  name: string;
  color?: string;
}

export interface PipUnpattiItem {
  id: string; // e.g. "BMK-01"
  code: string; // "BMK-01"
  title: string;
  category: string;
  description: string;
  focusArea: string;
  keywords: string[];
}

export interface KkniLevelOption {
  level: number; // 6, 7, 8, 9
  label: string;
  degree: string;
  color: string;
  description: string;
}

export interface KkniDescriptorItem {
  id: string; // e.g. "KKNI-6.1"
  code: string;
  level: number; // 6, 7, 8, or 9
  levelTitle: string;
  title: string;
  category: "Kemampuan Kerja" | "Penguasaan Pengetahuan" | "Manajerial & Pengambilan Keputusan" | "Sikap & Akuntabilitas";
  description: string;
  focus: string;
  keywords: string[];
}

export interface CpmkItem {
  id: string;
  desc: string;
  cplRefs?: string[]; // Kode CPL yang dibebankan pada CPMK ini (contoh: ["CPL02", "CPL06"])
}

export interface SubCpmkItem {
  id: string;
  cpmkRef: string;
  bloom: string; // e.g. "C2-Pemahaman", "C3-Penerapan", "C4-Analisis", "C5-Evaluasi", "C6-Kreasi"
  desc: string;
}

export interface SyllabusWeek {
  week: string;
  sub: string;
  materi: string;
  metode: string;
  asesmen: string;
  indikator: string;
  bobot: string;
  isExam?: boolean;
  deliveryMode?: "luring" | "daring" | "hybrid"; // Pasal 43 Ayat 4: Batas daring maksimal 40%
  lmsPlatform?: string; // Pasal 43 Ayat 5: Wajib terkelola di LMS
}

export interface AssessmentWeights {
  partisipatif: number;
  proyek: number;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
}

export interface CplAttainmentEvaluation {
  cplId: string;
  cplDesc: string;
  targetPercentage: number; // Default 75% (Standar Ketercapaian Minimum UNPATTI)
  averageScore: number; // 0 - 100%
  status: "TERCAPAI" | "BELUM_TERCAPAI";
  evaluatedCpmks: string[];
  assessmentSources: string[];
  analisisAkarMasalah?: string;
  rencanaTindakLanjut?: string; // Continuous Quality Improvement (CQI)
  semesterEvaluasi?: string;
}

export interface RpsData {
  namaKampus: string;
  namaFakultas: string;
  namaProdi: string;
  kodeProdi?: string;
  kodeDokumen: string;
  tglPengesahan: string;
  namaMK: string;
  kodeMK: string;
  rumpunMK: string;
  jenisMK: string;
  bobotSKS: number;
  sksTeori: number;
  sksPraktik: number;
  semester: string;
  revisiKe: string;
  koorMK: string;
  kaprodi: string;
  wadirAkademik: string;
  dosenPengampu: string;
  deskripsiMK: string;
  bahanKajian: string;
  daftarPustaka: string;
  selectedSdgs: number[];
  selectedPipItems?: string[];
  selectedKkniLevels?: number[];
  selectedKkniItems?: string[];
  jenjang?: "S1" | "S2" | "S3" | "Profesi" | "Spesialis" | "Pro" | "Vok";
  cplList?: CplItem[];
  selectedCpls: string[];
  cpmkList: CpmkItem[];
  subCpmkList: SubCpmkItem[];
  syllabusList: SyllabusWeek[];
  assessmentWeights: AssessmentWeights;
  rubrics?: CourseObjectiveRubric[];
  cplEvaluations?: CplAttainmentEvaluation[]; // Pasal 72: Evaluasi Ketercapaian CPL & CQI
  cqiNotes?: string;
}

export interface OpenAlexWork {
  id: string;
  title: string;
  publication_year: number;
  doi?: string;
  authorships: Array<{
    author: {
      display_name: string;
    };
  }>;
  primary_location?: {
    source?: {
      display_name?: string;
    };
    landing_page_url?: string;
    pdf_url?: string;
  };
  open_access?: {
    is_oa: boolean;
    oa_url?: string;
  };
  cited_by_count?: number;
  concepts?: Array<{
    display_name: string;
    score: number;
  }>;
}

export interface WorldBankIndicatorRecord {
  date: string;
  value: number | null;
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
}

export interface AiAuditResult {
  skorKelayakanOBE: number;
  statusAudit: string;
  kesesuaianTaksonomiBloom: string;
  kesesuaianPasal47Unpatti?: string;
  kesesuaianPasal59Unpatti?: string;
  rekomendasiPerbaikan: string[];
  studiKasusKepulauan: string;
}

export interface LiteratureGapItem {
  gap: string;
  urgensi: "Tinggi" | "Sedang" | "Rendah";
  buktiTrenOpenAlex: string;
}

export interface LiteratureGapResult {
  skorKemutakhiran: number;
  statusKemutakhiran: string;
  ringkasanTrenGlobal: string;
  topikYangSudahRelevan: string[];
  kesenjanganMateri: LiteratureGapItem[];
  rekomendasiPenyesuaian: string[];
  bahanKajianTermutakhirkan: string;
  rekomendasiPustakaPendukung: string[];
}
