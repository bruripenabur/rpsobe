import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck,
  Search,
  Filter,
  Check,
  X,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  Building2,
  GraduationCap,
  Sparkles,
  Layers,
  BarChart3,
  Calendar,
  AlertCircle,
  HelpCircle,
  BadgeCheck,
  Send,
  Lock,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Users,
  UserCheck,
  BookOpen,
  ArrowRight,
  Copy,
  RotateCcw,
  Sliders,
  Target,
  Percent,
  Info,
} from "lucide-react";
import { RpsData } from "../types/rps";
import { UserSession } from "../types/auth";
import { UNPATTI_PRODI_DATABASE, ProdiItem } from "../data/unpattiProdiDatabase";
import {
  auditCourseCplAlignment,
  CourseCplAlignmentAuditResult,
  CplEvaluationItem,
} from "../services/apiService";
import { DosenWorkload3YearTrend } from "./DosenWorkload3YearTrend";
import { KaprodiSmartGuide } from "./KaprodiSmartGuide";
import { exportBkdSummaryToPdf, BkdLecturerItem } from "../utils/bkdReportPdfExport";

export type KaprodiSubTab =
  | "matrix"
  | "approval"
  | "dosen_workload"
  | "cpl_alignment_audit"
  | "ami_audit"
  | "bloom_analysis"
  | "pasal59"
  | "export_berita_acara";

interface KaprodiGjmDashboardProps {
  rpsData: RpsData;
  setRpsData?: React.Dispatch<React.SetStateAction<RpsData>>;
  userSession: UserSession | null;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
  onOpenRpsInEditor?: (mkName: string) => void;
  initialSubTab?: KaprodiSubTab;
  onSubTabChange?: (tab: KaprodiSubTab) => void;
}

// Mock mata kuliah se-Program Studi untuk keperluan evaluasi makro kurikulum
export interface ProdiCourseItem {
  id: string;
  kodeMK: string;
  namaMK: string;
  sks: number;
  semester: number;
  dosenPengampu: string;
  cplSupported: string[];
  statusRps: "APPROVED" | "PENDING_GJM" | "REVISION" | "DRAFT";
  skorAmi: number; // 0 - 100
  persenPartisipatifProyek: number; // Pasal 47 Ayat 3 requirement >= 50%
  bloomDominan: "C2" | "C3" | "C4" | "C5" | "C6";
  catatanGjm?: string;
  approvedAt?: string;
}

export interface CourseTeachingShare extends ProdiCourseItem {
  sksShare: number; // Beban SKS per dosen (SKS MK / Jumlah Tim)
  teamSize: number; // Jumlah dosen pengampu
  teamMembers: string[];
  isTeamTeaching: boolean;
}

export interface LecturerWorkloadItem {
  dosen: string;
  totalSks: number;
  courses: CourseTeachingShare[];
  status: "IDEAL" | "RINGAN" | "OVERLOAD";
  teamTeachingCount: number;
  mandiriCount: number;
}

/**
 * Utilitas pembagi daftar dosen pengampu (Team Teaching)
 * Mengurai string dosen pengampu (titik koma, baris bernomor, garis miring)
 */
export function parseLecturersList(raw: string): string[] {
  if (!raw || typeof raw !== "string") return ["Dosen Pengampu"];
  let cleaned = raw.replace(/\r?\n/g, "; ");
  cleaned = cleaned.replace(/\b\d+[\.\)]\s*/g, "; ");
  cleaned = cleaned.replace(/\s+[\/]\s+/g, "; ");
  cleaned = cleaned.replace(/\s+dan\s+(?=[A-Z])/gi, "; ");
  cleaned = cleaned.replace(/\s+&\s+(?=[A-Z])/g, "; ");

  let parts = cleaned.split(";").map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1 && (parts[0].match(/(Prof|Dr|Dra|Drs|Ir)\.?/g) || []).length > 1) {
    const titleRegex = /,\s*(?=(Prof|Dr|Dra|Drs|Ir)\.?\s)/gi;
    const splitByTitles = parts[0].split(titleRegex).map((p) => p.trim()).filter((p) => p && !/^(Prof|Dr|Dra|Drs|Ir)\.?$/i.test(p));
    if (splitByTitles.length > 1) {
      parts = splitByTitles;
    }
  }

  const result = parts
    .map((p) => p.replace(/^[\d\.\-\*\)\(\s]+/, "").trim())
    .filter((p) => p.length > 2);

  return result.length > 0 ? result : [raw.trim()];
}

export const KaprodiGjmDashboard: React.FC<KaprodiGjmDashboardProps> = ({
  rpsData,
  setRpsData,
  userSession,
  showNotification,
  onOpenRpsInEditor,
  initialSubTab,
  onSubTabChange,
}) => {
  const isGjmRole = userSession?.role === "gjm";
  const isKaprodiRole = userSession?.role === "kaprodi";

  // Mode Tampilan: Terkunci sesuai role sesi login
  const [activeRoleView, setActiveRoleView] = useState<"KAPRODI" | "GJM">(
    isGjmRole ? "GJM" : "KAPRODI"
  );

  // Sub-Tab Navigasi (Default tab spesifik sesuai role)
  const [activeTab, setActiveTab] = useState<KaprodiSubTab>(
    initialSubTab || (isGjmRole ? "ami_audit" : "matrix")
  );

  // Mode Tampilan Matriks CPL di Mobile: "table" atau "cards"
  const [matrixViewMode, setMatrixViewMode] = useState<"table" | "cards">("cards");

  // Sinkronisasi status role dan subtab ketika session berubah
  useEffect(() => {
    if (userSession?.role === "gjm") {
      setActiveRoleView("GJM");
      if (initialSubTab && initialSubTab !== "approval") {
        setActiveTab(initialSubTab);
      } else {
        setActiveTab("ami_audit");
      }
    } else if (userSession?.role === "kaprodi") {
      setActiveRoleView("KAPRODI");
      if (initialSubTab && initialSubTab !== "ami_audit") {
        setActiveTab(initialSubTab);
      } else {
        setActiveTab("matrix");
      }
    }
  }, [userSession?.role, initialSubTab]);

  const handleSwitchTab = (tab: KaprodiSubTab) => {
    setActiveTab(tab);
    onSubTabChange?.(tab);
  };

  // Filter semester dan search mata kuliah
  const [selectedSemester, setSelectedSemester] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Selected course for detail audit / revision note
  const [selectedCourseForAction, setSelectedCourseForAction] = useState<ProdiCourseItem | null>(null);
  const [actionModalType, setActionModalType] = useState<"APPROVE" | "REVISE" | "AUDIT" | null>(null);
  const [revisionNote, setRevisionNote] = useState<string>("");

  // Nama Kaprodi & GJM default
  const namaProdiAktif = rpsData.namaProdi || userSession?.namaProdi || "S1 Penyuluhan Pertanian";
  const fakultasAktif = rpsData.namaFakultas || userSession?.namaFakultas || "Fakultas Pertanian";
  const jenjangAktif = rpsData.jenjang || userSession?.jenjang || "S1";
  const namaKaprodiAktif = rpsData.kaprodi || (userSession?.role === "kaprodi" ? userSession.nama : "Ketua Program Studi");
  const namaGjmKetua = "Tim Gugus Jaminan Mutu (GJM) Fakultas";

  // Data CPL Kurikulum Program Studi (10 CPL Standar OBE)
  const defaultProdiCpls = [
    { kode: "CPL-01", ranah: "Sikap", deskripsi: "Bertakwa kepada Tuhan Yang Maha Esa dan menjunjung tinggi nilai kemanusiaan serta etika akademik." },
    { kode: "CPL-02", ranah: "Sikap", deskripsi: "Menunjukkan integritas, tanggung jawab, dan kepedulian lingkungan sosial kepulauan." },
    { kode: "CPL-03", ranah: "Keterampilan Umum", deskripsi: "Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam IPTEK." },
    { kode: "CPL-04", ranah: "Keterampilan Umum", deskripsi: "Mampu mengambil keputusan tepat berbasis analisis informasi empiris dan data ilmiah." },
    { kode: "CPL-05", ranah: "Keterampilan Umum", deskripsi: "Mampu memelihara jaringan kerja dan memimpin kerja sama tim multidisiplin." },
    { kode: "CPL-06", ranah: "Pengetahuan", deskripsi: "Menguasai konsep teoretis keilmuan, prinsip analisis sosial-ekonomi pedesaan, dan kemiskinan kepulauan." },
    { kode: "CPL-07", ranah: "Pengetahuan", deskripsi: "Menguasai metodologi penelitian terapan dan formulasi kebijakan berbasis bukti (evidence-based)." },
    { kode: "CPL-08", ranah: "Keterampilan Khusus", deskripsi: "Mampu merancang model intervensi pemberdayaan dan program pengentasan kemiskinan." },
    { kode: "CPL-09", ranah: "Keterampilan Khusus", deskripsi: "Mampu mengevaluasi implementasi program pembangunan berbasis indikator multidimensional (Alkire-Foster)." },
    { kode: "CPL-10", ranah: "Keterampilan Khusus", deskripsi: "Mampu mengomunikasikan gagasan strategis dan inovasi teknologi kepada masyarakat pesisir." },
  ];

  // Daftar Mata Kuliah se-Program Studi (Simulasi Lengkap 1 Kurikulum S1/S2 dengan Model Team Teaching & Mandiri)
  const [courses, setCourses] = useState<ProdiCourseItem[]>([
    {
      id: "mk-1",
      kodeMK: rpsData.kodeMK || "PPP224127",
      namaMK: rpsData.namaMK || "Kemiskinan Multidimensional",
      sks: rpsData.bobotSKS || 3,
      semester: 4,
      dosenPengampu: rpsData.dosenPengampu || "1. Dr. Bruri Penabur, M.Si; 2. Prof. Dr. Ir. J. Pattiasina, M.Sc; 3. Dr. H. Tuanakotta, M.Si",
      cplSupported: ["CPL-01", "CPL-03", "CPL-06", "CPL-08", "CPL-09"],
      statusRps: "APPROVED",
      skorAmi: 96,
      persenPartisipatifProyek: 65,
      bloomDominan: "C5",
      approvedAt: "14 Oktober 2026",
    },
    {
      id: "mk-2",
      kodeMK: "PPP221101",
      namaMK: "Pengantar Sosiologi Pedesaan & Kepulauan",
      sks: 3,
      semester: 1,
      dosenPengampu: "Prof. Dr. Ir. J. Pattiasina, M.Sc; Dra. M. Soplanit, M.P",
      cplSupported: ["CPL-01", "CPL-02", "CPL-06"],
      statusRps: "APPROVED",
      skorAmi: 92,
      persenPartisipatifProyek: 55,
      bloomDominan: "C3",
      approvedAt: "10 Oktober 2026",
    },
    {
      id: "mk-3",
      kodeMK: "PPP222114",
      namaMK: "Metodologi Penelitian Sosial Ekonomi",
      sks: 3,
      semester: 3,
      dosenPengampu: "Dr. H. Tuanakotta, M.Si; Dr. Ir. E. Wattimena, M.App.Sc",
      cplSupported: ["CPL-03", "CPL-04", "CPL-07"],
      statusRps: "APPROVED",
      skorAmi: 94,
      persenPartisipatifProyek: 60,
      bloomDominan: "C4",
      approvedAt: "12 Oktober 2026",
    },
    {
      id: "mk-4",
      kodeMK: "PPP223120",
      namaMK: "Komunikasi Pembangunan & Penyuluhan",
      sks: 3,
      semester: 3,
      dosenPengampu: "Dra. M. Soplanit, M.P; Prof. Dr. Ir. A. Matakupan, M.Sc",
      cplSupported: ["CPL-03", "CPL-05", "CPL-10"],
      statusRps: "PENDING_GJM",
      skorAmi: 88,
      persenPartisipatifProyek: 52,
      bloomDominan: "C4",
    },
    {
      id: "mk-5",
      kodeMK: "PPP225132",
      namaMK: "Perencanaan & Evaluasi Program Pemberdayaan",
      sks: 3,
      semester: 5,
      dosenPengampu: "1. Dr. Ir. E. Wattimena, M.App.Sc; 2. Dr. Bruri Penabur, M.Si; 3. Dra. M. Soplanit, M.P",
      cplSupported: ["CPL-04", "CPL-08", "CPL-09"],
      statusRps: "APPROVED",
      skorAmi: 95,
      persenPartisipatifProyek: 70,
      bloomDominan: "C6",
      approvedAt: "08 Oktober 2026",
    },
    {
      id: "mk-6",
      kodeMK: "PPP226145",
      namaMK: "Kebijakan Pembangunan Pertanian Kepulauan",
      sks: 2,
      semester: 6,
      dosenPengampu: "Dr. Bruri Penabur, M.Si; Dr. H. Tuanakotta, M.Si",
      cplSupported: ["CPL-02", "CPL-06", "CPL-07", "CPL-08"],
      statusRps: "REVISION",
      skorAmi: 78,
      persenPartisipatifProyek: 45,
      bloomDominan: "C4",
      catatanGjm: "Bobot Case Method & Project-Based Learning baru 45% (Wajib >= 50% sesuai Pasal 47 Peraturan Rektor Universitas Pattimura No. 12 Tahun 2026). Rubrik penilaian asesmen tugas perlu diperjelas.",
    },
    {
      id: "mk-7",
      kodeMK: "PPP227150",
      namaMK: "Kapita Selekta Dinamika Komunitas Pesisir",
      sks: 2,
      semester: 7,
      dosenPengampu: "Prof. Dr. Ir. A. Matakupan, M.Sc; Prof. Dr. Ir. J. Pattiasina, M.Sc",
      cplSupported: ["CPL-06", "CPL-08", "CPL-10"],
      statusRps: "DRAFT",
      skorAmi: 65,
      persenPartisipatifProyek: 40,
      bloomDominan: "C5",
      catatanGjm: "Dokumen RPS belum melampirkan matriks penilaian Sub-CPMK ke instrumen asesmen.",
    },
    {
      id: "mk-8",
      kodeMK: "PPP228199",
      namaMK: "Tugas Akhir / Skripsi",
      sks: 6,
      semester: 8,
      dosenPengampu: "1. Prof. Dr. Ir. A. Matakupan, M.Sc; 2. Prof. Dr. Ir. J. Pattiasina, M.Sc; 3. Dr. Bruri Penabur, M.Si",
      cplSupported: ["CPL-01", "CPL-02", "CPL-03", "CPL-04", "CPL-05", "CPL-06", "CPL-07", "CPL-08", "CPL-09", "CPL-10"],
      statusRps: "APPROVED",
      skorAmi: 98,
      persenPartisipatifProyek: 100,
      bloomDominan: "C6",
      approvedAt: "01 Oktober 2026",
    },
    {
      id: "mk-9",
      kodeMK: "PPP222115",
      namaMK: "Ekonomi Pertanian & Sumberdaya Hayati Laut",
      sks: 3,
      semester: 2,
      dosenPengampu: "Dr. Bruri Penabur, M.Si; Dr. Ir. E. Wattimena, M.App.Sc",
      cplSupported: ["CPL-03", "CPL-06", "CPL-08"],
      statusRps: "APPROVED",
      skorAmi: 93,
      persenPartisipatifProyek: 58,
      bloomDominan: "C4",
      approvedAt: "11 Oktober 2026",
    },
    {
      id: "mk-10",
      kodeMK: "PPP224128",
      namaMK: "Statistika Sosial & Analisis Data Survei",
      sks: 3,
      semester: 4,
      dosenPengampu: "Dr. H. Tuanakotta, M.Si; Dra. M. Soplanit, M.P",
      cplSupported: ["CPL-03", "CPL-04", "CPL-09"],
      statusRps: "APPROVED",
      skorAmi: 91,
      persenPartisipatifProyek: 55,
      bloomDominan: "C4",
      approvedAt: "13 Oktober 2026",
    },
    {
      id: "mk-11",
      kodeMK: "PPP223121",
      namaMK: "Dinamika Kelompok & Kepemimpinan Adat",
      sks: 3,
      semester: 3,
      dosenPengampu: "Prof. Dr. Ir. J. Pattiasina, M.Sc; Dr. H. Tuanakotta, M.Si",
      cplSupported: ["CPL-01", "CPL-05", "CPL-10"],
      statusRps: "APPROVED",
      skorAmi: 95,
      persenPartisipatifProyek: 68,
      bloomDominan: "C5",
      approvedAt: "09 Oktober 2026",
    },
    {
      id: "mk-12",
      kodeMK: "PPP225133",
      namaMK: "Kewirausahaan Agribisnis & Produk Olahan Maritim",
      sks: 3,
      semester: 5,
      dosenPengampu: "1. Dra. M. Soplanit, M.P; 2. Dr. Ir. E. Wattimena, M.App.Sc; 3. Dr. Bruri Penabur, M.Si",
      cplSupported: ["CPL-04", "CPL-08", "CPL-10"],
      statusRps: "APPROVED",
      skorAmi: 94,
      persenPartisipatifProyek: 75,
      bloomDominan: "C6",
      approvedAt: "07 Oktober 2026",
    },
    {
      id: "mk-13",
      kodeMK: "PPP226146",
      namaMK: "Tata Kelola Lingkungan & Adaptasi Perubahan Iklim",
      sks: 3,
      semester: 6,
      dosenPengampu: "Dr. Ir. E. Wattimena, M.App.Sc; Prof. Dr. Ir. A. Matakupan, M.Sc",
      cplSupported: ["CPL-02", "CPL-07", "CPL-09"],
      statusRps: "APPROVED",
      skorAmi: 96,
      persenPartisipatifProyek: 62,
      bloomDominan: "C5",
      approvedAt: "15 Oktober 2026",
    },
    {
      id: "mk-14",
      kodeMK: "PPP221102",
      namaMK: "Etika Akademik & Kearifan Lokal Kepulauan",
      sks: 2,
      semester: 1,
      dosenPengampu: "Prof. Dr. Ir. A. Matakupan, M.Sc; Prof. Dr. Ir. J. Pattiasina, M.Sc",
      cplSupported: ["CPL-01", "CPL-02"],
      statusRps: "APPROVED",
      skorAmi: 97,
      persenPartisipatifProyek: 50,
      bloomDominan: "C3",
      approvedAt: "06 Oktober 2026",
    },
    {
      id: "mk-15",
      kodeMK: "PPP224129",
      namaMK: "Manajemen Agribisnis Kepulauan",
      sks: 3,
      semester: 4,
      dosenPengampu: "Dr. Bruri Penabur, M.Si; Dra. M. Soplanit, M.P",
      cplSupported: ["CPL-04", "CPL-07", "CPL-09"],
      statusRps: "APPROVED",
      skorAmi: 92,
      persenPartisipatifProyek: 60,
      bloomDominan: "C4",
      approvedAt: "10 Oktober 2026",
    },
    {
      id: "mk-16",
      kodeMK: "PPP222116",
      namaMK: "Sosiologi Organisasi Petani & Nelayan",
      sks: 3,
      semester: 2,
      dosenPengampu: "Prof. Dr. Ir. J. Pattiasina, M.Sc; Dr. H. Tuanakotta, M.Si",
      cplSupported: ["CPL-01", "CPL-03", "CPL-06"],
      statusRps: "APPROVED",
      skorAmi: 94,
      persenPartisipatifProyek: 55,
      bloomDominan: "C4",
      approvedAt: "08 Oktober 2026",
    },
  ]);

  // ----------------------------------------------------
  // STATE & LOGIK BEBAN KERJA DOSEN (BKD PER SEMESTER)
  // ----------------------------------------------------
  const [workloadSemester, setWorkloadSemester] = useState<number | "ALL" | "GANJIL" | "GENAP">("ALL");
  const [workloadSearchDosen, setWorkloadSearchDosen] = useState<string>("");
  const [workloadStatusFilter, setWorkloadStatusFilter] = useState<"ALL" | "IDEAL" | "RINGAN" | "OVERLOAD">("ALL");
  const [workloadViewMode, setWorkloadViewMode] = useState<"current_semester" | "trend_3_tahun">("current_semester");
  const [selectedLecturerDetail, setSelectedLecturerDetail] = useState<string | null>(null);
  const [isSmartGuideOpen, setIsSmartGuideOpen] = useState<boolean>(false);
  const [isExportingBkdPdf, setIsExportingBkdPdf] = useState<boolean>(false);

  // Filter courses for workload calculations
  const workloadCourses = courses.filter((c) => {
    if (workloadSemester === "GANJIL") return c.semester % 2 !== 0;
    if (workloadSemester === "GENAP") return c.semester % 2 === 0;
    if (workloadSemester !== "ALL") return c.semester === workloadSemester;
    return true;
  });

  // Group courses by lecturer with exact Team Teaching calculation:
  // SKS Mata kuliah dibagi dengan jumlah dosen pengampu mata kuliah.
  // Mis. SKS Mata kuliah A adalah 3 SKS dan 3 dosen pengampu, maka beban SKS per dosen adalah 3 / 3 = 1 SKS.
  const lecturerMap: Record<string, LecturerWorkloadItem> = {};

  workloadCourses.forEach((c) => {
    const teamMembers = parseLecturersList(c.dosenPengampu);
    const teamSize = Math.max(1, teamMembers.length);
    const sksShare = Number((c.sks / teamSize).toFixed(2));
    const isTeamTeaching = teamSize > 1;

    teamMembers.forEach((dosenName) => {
      const dosen = dosenName.trim();
      if (!lecturerMap[dosen]) {
        lecturerMap[dosen] = {
          dosen,
          totalSks: 0,
          courses: [],
          teamTeachingCount: 0,
          mandiriCount: 0,
          status: "RINGAN",
        };
      }
      lecturerMap[dosen].totalSks = Number((lecturerMap[dosen].totalSks + sksShare).toFixed(2));
      if (isTeamTeaching) {
        lecturerMap[dosen].teamTeachingCount += 1;
      } else {
        lecturerMap[dosen].mandiriCount += 1;
      }
      lecturerMap[dosen].courses.push({
        ...c,
        sksShare,
        teamSize,
        teamMembers,
        isTeamTeaching,
      });
    });
  });

  const lecturerWorkloadList = Object.values(lecturerMap)
    .map((item) => {
      let status: "IDEAL" | "RINGAN" | "OVERLOAD" = "RINGAN";
      // Sesuai Pedoman Operasional BKD:
      // Unsur Pendidikan (Mengajar) minimal 3 SKS, unsur Pendidikan + Penelitian minimal 9 SKS,
      // Total 12 - 16 SKS merupakan gabungan Tridharma (Pendidikan + Penelitian + Pengabdian/PkM + Penunjang).
      // Oleh karena itu, standar wajar beban mengajar Program Studi adalah 3 s.d. 9 SKS per semester (atau 6 - 18 jika ALL).
      const minIdeal = workloadSemester === "ALL" ? 6 : 3;
      const maxIdeal = workloadSemester === "ALL" ? 18 : 9;
      if (item.totalSks >= minIdeal && item.totalSks <= maxIdeal) {
        status = "IDEAL";
      } else if (item.totalSks > maxIdeal) {
        status = "OVERLOAD";
      } else {
        status = "RINGAN";
      }
      return { ...item, status };
    })
    .filter((item) => {
      const matchSearch = item.dosen.toLowerCase().includes(workloadSearchDosen.toLowerCase());
      const matchStatus = workloadStatusFilter === "ALL" || item.status === workloadStatusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => b.totalSks - a.totalSks);

  const maxWorkloadSks = Math.max(workloadSemester === "ALL" ? 20 : 12, ...lecturerWorkloadList.map((l) => l.totalSks), 10);

  // Handler ekspor PDF Laporan Ringkasan BKD Bidang Pendidikan
  const handleExportBkdPdf = async () => {
    setIsExportingBkdPdf(true);
    showNotification?.("Menyiapkan dokumen PDF Laporan BKD Bidang Pendidikan...", "info");
    const semLabel =
      workloadSemester === "ALL"
        ? "Semua Semester (1 s.d. 8)"
        : workloadSemester === "GANJIL"
        ? "Semester Ganjil"
        : workloadSemester === "GENAP"
        ? "Semester Genap"
        : `Semester ${workloadSemester}`;

    const ok = await exportBkdSummaryToPdf(
      lecturerWorkloadList as BkdLecturerItem[],
      {
        namaProdi: namaProdiAktif,
        namaFakultas: fakultasAktif,
        semesterLabel: semLabel,
        tahunAkademik: "TA 2026/2027",
      },
      (msg) => {
        showNotification?.(msg, "info");
      }
    );
    setIsExportingBkdPdf(false);
    if (ok) {
      showNotification?.("Laporan PDF BKD Bidang Pendidikan siap cetak berhasil diunduh!", "success");
    } else {
      showNotification?.("Gagal membuat laporan PDF BKD.", "error");
    }
  };

  // Palet warna estetik untuk segmen mata kuliah pada diagram batang
  const courseBarColors = [
    "from-emerald-500 to-teal-600 border-emerald-400",
    "from-blue-500 to-indigo-600 border-blue-400",
    "from-amber-500 to-orange-600 border-amber-400",
    "from-purple-500 to-violet-600 border-purple-400",
    "from-cyan-500 to-sky-600 border-cyan-400",
    "from-rose-500 to-pink-600 border-rose-400",
    "from-lime-500 to-emerald-600 border-lime-400",
    "from-fuchsia-500 to-pink-600 border-fuchsia-400",
  ];

  // -------------------------------------------------------------------
  // STATE & LOGIK AUDIT KESELARASAN DESKRIPSI MK VS CPL BERBASIS AI
  // -------------------------------------------------------------------
  const [auditTargetCourseId, setAuditTargetCourseId] = useState<string>("active");
  const [auditCourseName, setAuditCourseName] = useState<string>(rpsData.namaMK || "Kemiskinan Multidimensional");
  const [auditCourseCode, setAuditCourseCode] = useState<string>(rpsData.kodeMK || "PPP224127");
  const [auditCourseDesc, setAuditCourseDesc] = useState<string>(
    rpsData.deskripsiMK ||
      "Mata kuliah ini membahas konsep teoretis kemiskinan, kemiskinan multidimensional (Alkire-Foster), karakteristik kerentanan sosial-ekonomi di wilayah kepulauan Maluku, metode analisis data indikator kesejahteraan, dan perumusan rekomendasi kebijakan penanggulangan kemiskinan berbasis kearifan lokal."
  );
  const [isAuditingAlignment, setIsAuditingAlignment] = useState(false);
  const [alignmentResult, setAlignmentResult] = useState<CourseCplAlignmentAuditResult | null>(null);

  // Sinkronisasi saat target mata kuliah audit diubah
  const handleSelectAuditTarget = (courseId: string) => {
    setAuditTargetCourseId(courseId);
    if (courseId === "active") {
      setAuditCourseName(rpsData.namaMK || "Kemiskinan Multidimensional");
      setAuditCourseCode(rpsData.kodeMK || "PPP224127");
      setAuditCourseDesc(
        rpsData.deskripsiMK ||
          "Mata kuliah ini membahas konsep teoretis kemiskinan, kemiskinan multidimensional (Alkire-Foster), karakteristik kerentanan sosial-ekonomi di wilayah kepulauan Maluku, metode analisis data indikator kesejahteraan, dan perumusan rekomendasi kebijakan penanggulangan kemiskinan berbasis kearifan lokal."
      );
    } else {
      const c = courses.find((item) => item.id === courseId);
      if (c) {
        setAuditCourseName(c.namaMK);
        setAuditCourseCode(c.kodeMK);
        setAuditCourseDesc(
          `Mata kuliah ${c.namaMK} (${c.kodeMK}) dengan bobot ${c.sks} SKS semester ${c.semester}. Membahas landasan teoretis keilmuan, prinsip analisis sosial-ekonomi terapan, metodologi pemecahan masalah konteks kepulauan Maluku, serta pencapaian profil lulusan program studi secara terukur.`
        );
      }
    }
    setAlignmentResult(null);
  };

  // Jalankan Audit Keselarasan AI
  const handleRunAlignmentAudit = async () => {
    if (!auditCourseDesc.trim()) {
      showNotification("Deskripsi mata kuliah tidak boleh kosong!", "error");
      return;
    }
    setIsAuditingAlignment(true);
    showNotification("Menjalankan audit keselarasan AI (Gemini 2.5 Flash)...", "info");

    try {
      const selectedCpls =
        rpsData.cplList && rpsData.cplList.length > 0
          ? rpsData.cplList.map((c) => ({ id: c.id, desc: c.desc, category: c.category }))
          : defaultProdiCpls.map((c) => ({ id: c.kode, desc: c.deskripsi, category: c.ranah }));

      const res = await auditCourseCplAlignment({
        courseName: auditCourseName,
        courseCode: auditCourseCode,
        courseDescription: auditCourseDesc,
        selectedCpls,
        cpmkList: rpsData.cpmkList || [],
      });

      setAlignmentResult(res);
      showNotification(`Audit selesai! Skor Keselarasan: ${res.alignmentScore}% (${res.grade})`, "success");
    } catch (e: any) {
      console.error("Alignment audit error:", e);
      showNotification("Terjadi kendala saat audit AI, silakan periksa koneksi.", "error");
    } finally {
      setIsAuditingAlignment(false);
    }
  };

  // Terapkan Deskripsi Hasil Rekomendasi AI ke RPS Aktif
  const handleApplyAiDescription = () => {
    if (!alignmentResult?.improvedCourseDescription) return;
    setAuditCourseDesc(alignmentResult.improvedCourseDescription);
    if (setRpsData) {
      setRpsData((prev) => ({
        ...prev,
        deskripsiMK: alignmentResult.improvedCourseDescription,
      }));
    }
    showNotification("Deskripsi hasil rekomendasi AI berhasil diterapkan ke RPS dokumen aktif!", "success");
  };


  // Handler Approval oleh Kaprodi
  const handleApproveCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              statusRps: "APPROVED",
              approvedAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
              catatanGjm: undefined,
            }
          : c
      )
    );
    showNotification(`RPS Mata Kuliah resmi disahkan dan disetujui oleh Kaprodi!`, "success");
    setActionModalType(null);
  };

  // Handler Revisi oleh GJM/Kaprodi
  const handleReviseCourse = (courseId: string) => {
    if (!revisionNote.trim()) {
      showNotification("Tuliskan catatan perbaikan atau rekomendasi revisi!", "error");
      return;
    }
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              statusRps: "REVISION",
              catatanGjm: revisionNote.trim(),
            }
          : c
      )
    );
    showNotification(`Catatan revisi berhasil dikirim kepada Dosen Pengampu MK.`, "info");
    setActionModalType(null);
    setRevisionNote("");
  };

  // Filter list
  const filteredCourses = courses.filter((c) => {
    const matchSem = selectedSemester === "ALL" ? true : c.semester === selectedSemester;
    const matchStatus = statusFilter === "ALL" ? true : c.statusRps === statusFilter;
    const matchSearch =
      c.namaMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.kodeMK.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dosenPengampu.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSem && matchStatus && matchSearch;
  });

  // KPI Makro Kurikulum
  const totalCourses = courses.length;
  const approvedCourses = courses.filter((c) => c.statusRps === "APPROVED").length;
  const pendingCourses = courses.filter((c) => c.statusRps === "PENDING_GJM").length;
  const revisionCourses = courses.filter((c) => c.statusRps === "REVISION").length;
  const draftCourses = courses.filter((c) => c.statusRps === "DRAFT").length;
  const approvalRate = Math.round((approvedCourses / totalCourses) * 100);

  // Kepatuhan Pasal 47 Peraturan Rektor No. 12/2026 (Partisipatif & Proyek >= 50%)
  const coursesComplyingPasal59 = courses.filter((c) => c.persenPartisipatifProyek >= 50).length;
  const pasal59Rate = Math.round((coursesComplyingPasal59 / totalCourses) * 100);

  // Rata-rata Skor AMI
  const avgAmiScore = Math.round(courses.reduce((acc, c) => acc + c.skorAmi, 0) / totalCourses);

  // Sebaran Taksonomi Bloom (HOTS C4-C6)
  const hotsCoursesCount = courses.filter((c) => ["C4", "C5", "C6"].includes(c.bloomDominan)).length;
  const hotsPercentage = Math.round((hotsCoursesCount / totalCourses) * 100);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* HEADER DASHBOARD KHUSUS KAPRODI & GJM */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 shadow-md">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {activeRoleView === "KAPRODI"
                    ? "Dashboard Ketua Program Studi (Kaprodi)"
                    : "Portal Gugus Jaminan Mutu (GJM) Fakultas"}
                </h1>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    activeRoleView === "KAPRODI"
                      ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                      : "bg-blue-400/20 text-blue-300 border-blue-400/30"
                  }`}
                >
                  {activeRoleView === "KAPRODI" ? "Wewenang Kaprodi" : "Wewenang GJM"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {jenjangAktif} {namaProdiAktif} &bull; {fakultasAktif} &bull; Universitas Pattimura
              </p>
            </div>
          </div>

          {/* Role Indicator / Switcher */}
          <div className="flex items-center gap-2">
            {isKaprodiRole && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Akun Terverifikasi: Kaprodi {namaKaprodiAktif}</span>
              </div>
            )}
            {isGjmRole && (
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center gap-1.5 shadow-xs">
                <Award className="w-4 h-4 text-blue-400" />
                <span>Akun Terverifikasi: Auditor GJM Fakultas</span>
              </div>
            )}
            {!isKaprodiRole && !isGjmRole && (
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleView("KAPRODI");
                    setActiveTab("matrix");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeRoleView === "KAPRODI"
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Kaprodi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleView("GJM");
                    setActiveTab("ami_audit");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeRoleView === "GJM"
                      ? "bg-blue-600 text-white font-black shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>GJM</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Macro KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Validasi RPS Semester</span>
              <span className="font-bold text-emerald-400">{approvalRate}%</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">
              {approvedCourses} <span className="text-xs text-slate-400 font-normal">/ {totalCourses} MK Disahkan</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${approvalRate}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Kepatuhan Pasal 47 (No. 12/2026)</span>
              <span className={`font-bold ${pasal59Rate >= 80 ? "text-emerald-400" : "text-amber-400"}`}>{pasal59Rate}%</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">
              {coursesComplyingPasal59} <span className="text-xs text-slate-400 font-normal">/ {totalCourses} MK (Case &amp; PjBL &ge; 50%)</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${pasal59Rate}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Indeks Audit Mutu AMI</span>
              <span className="font-bold text-cyan-400">{avgAmiScore}/100</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5 flex items-center gap-1.5">
              <span>{avgAmiScore >= 90 ? "UNGGUL" : "BAIK SEKALI"}</span>
              <BadgeCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${avgAmiScore}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Proporsi HOTS (C4-C6)</span>
              <span className="font-bold text-indigo-400">{hotsPercentage}%</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">
              {hotsCoursesCount} <span className="text-xs text-slate-400 font-normal">/ {totalCourses} MK Analisis/Kreasi</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${hotsPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Responsif Swipe Horizontal di Mobile / Tablet) */}
        <div className="flex items-center gap-2 mt-4 pt-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
          {/* TABS KHUSUS KAPRODI */}
          {activeRoleView === "KAPRODI" ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "matrix"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1. Matriks Kurikulum (CPL vs MK)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("approval")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "approval"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>2. Validasi &amp; Pengesahan RPS ({approvedCourses}/{totalCourses})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("dosen_workload")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "dosen_workload"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>3. Beban Kerja Dosen (BKD per Semester)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("cpl_alignment_audit")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "cpl_alignment_audit"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>4. Audit Keselarasan CPL (AI)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bloom_analysis")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "bloom_analysis"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>5. Keseimbangan Bloom (C1-C6)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pasal59")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "pasal59"
                    ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>6. Kepatuhan Pasal 47 (Case/PjBL &ge; 50%)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("export_berita_acara")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "export_berita_acara"
                    ? "bg-emerald-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>7. Pengesahan Berita Acara</span>
              </button>
            </>
          ) : (
            /* TABS KHUSUS GJM (GUGUS JAMINAN MUTU) */
            <>
              <button
                type="button"
                onClick={() => setActiveTab("ami_audit")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "ami_audit"
                    ? "bg-blue-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>1. Audit Mutu Internal (AMI) 8 Standar SN-Dikti</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("cpl_alignment_audit")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "cpl_alignment_audit"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>2. Audit Keselarasan Deskripsi vs CPL (AI)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("dosen_workload")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "dosen_workload"
                    ? "bg-blue-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>3. Distribusi Beban Dosen (BKD)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pasal59")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "pasal59"
                    ? "bg-blue-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>4. Kepatuhan Pasal 47 (Case/PjBL &ge; 50%)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bloom_analysis")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "bloom_analysis"
                    ? "bg-blue-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>5. Evaluasi Kematangan HOTS Bloom (C4-C6)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("export_berita_acara")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "export_berita_acara"
                    ? "bg-emerald-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>6. Berita Acara Review Mutu GJM</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[40px] ${
                  activeTab === "matrix"
                    ? "bg-blue-600 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white bg-slate-800/60"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>5. Matriks Kurikulum (Monitoring Mutu)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* BODY KONTEN DASHBOARD (Responsif iPhone, Android & Tablet) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8 space-y-6">
        {/* ======================================================== */}
        {/* TAB 1: MATRIKS KURIKULUM PRODI (CPL vs MATA KULIAH)     */}
        {/* ======================================================== */}
        {activeTab === "matrix" && (
          <div className="space-y-4 max-w-7xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Matriks Ketercapaian Kurikulum Program Studi (Curriculum Map)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pemetaan sebaran pembebanan 10 CPL ke seluruh mata kuliah untuk memastikan tidak ada CPL yang kosong (*orphan CPL*) atau beban berlebih (*overloaded*).
                </p>
              </div>

              {/* Controls: Filter & View Switcher (Responsif Tablet / Smartphone) */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                {/* Switcher Tampilan (Kartu Mobile vs Tabel Luas) */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setMatrixViewMode("cards")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      matrixViewMode === "cards"
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Tampilan Kartu Ringkas (Sangat nyaman di Ponsel & Tablet)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kartu MK</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMatrixViewMode("table")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      matrixViewMode === "table"
                        ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                    title="Tampilan Matriks Lengkap (Tabel Luas)"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Tabel Luas</span>
                  </button>
                </div>

                {/* Semester Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400">Semester:</span>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                    className="bg-transparent text-xs text-white font-bold focus:outline-hidden cursor-pointer"
                  >
                    <option value="ALL" className="bg-slate-900 text-white">Semua (1-8)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-white">Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* TAMPILAN 1: KARTU MK MOBILE-OPTIMIZED (IPHONE & ANDROID / TABLET) */}
            {matrixViewMode === "cards" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredCourses.map((mk) => (
                    <div
                      key={mk.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                              {mk.kodeMK}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                              Smt {mk.semester} &bull; {mk.sks} SKS
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-white mt-1">{mk.namaMK}</h3>
                          <p className="text-xs text-slate-400">{mk.dosenPengampu}</p>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap flex-shrink-0 ${
                            mk.statusRps === "APPROVED"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : mk.statusRps === "PENDING_GJM"
                              ? "bg-blue-950 text-blue-300 border-blue-800"
                              : mk.statusRps === "REVISION"
                              ? "bg-amber-950 text-amber-300 border-amber-800"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {mk.statusRps === "APPROVED"
                            ? "Disahkan"
                            : mk.statusRps === "PENDING_GJM"
                            ? "Review GJM"
                            : mk.statusRps === "REVISION"
                            ? "Revisi"
                            : "Draf"}
                        </span>
                      </div>

                      {/* Covered CPL List */}
                      <div>
                        <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Pembebanan CPL ({mk.cplSupported.length} CPL Terhubung):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {mk.cplSupported.map((cplCode) => {
                            const cplInfo = defaultProdiCpls.find((c) => c.kode === cplCode);
                            return (
                              <span
                                key={cplCode}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-[10.5px] font-mono text-amber-300"
                                title={cplInfo ? `${cplInfo.kode} (${cplInfo.ranah}): ${cplInfo.deskripsi}` : cplCode}
                              >
                                <span className="text-emerald-400 font-bold">✓</span>
                                {cplCode}
                                {cplInfo && (
                                  <span className="text-[9px] text-slate-400 font-sans">
                                    ({cplInfo.ranah.substring(0, 3)})
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick Action Button */}
                      {onOpenRpsInEditor && (
                        <div className="pt-2 border-t border-slate-800 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onOpenRpsInEditor(mk.namaMK)}
                            className="px-2.5 py-1 text-xs font-bold text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900 rounded-lg border border-blue-500/30 flex items-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Periksa Berkas RPS</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAMPILAN 2: TABEL LUAS DENGAN SCROLL HORIZONTAL */}
            {matrixViewMode === "table" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Petunjuk swipe di smartphone */}
                <div className="sm:hidden px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px] text-amber-300 flex items-center justify-between">
                  <span>👉 Geser layar ke samping untuk melihat seluruh CPL 1 s.d 10</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                        <th className="p-3 font-bold sticky left-0 bg-slate-950 z-10 w-20">Kode MK</th>
                        <th className="p-3 font-bold sticky left-20 bg-slate-950 z-10 min-w-[220px]">Nama Mata Kuliah</th>
                        <th className="p-3 font-bold text-center w-12">Smt</th>
                        <th className="p-3 font-bold text-center w-12">SKS</th>
                        {defaultProdiCpls.map((cpl) => (
                          <th key={cpl.kode} className="p-2 font-mono text-center w-16 border-l border-slate-800" title={`${cpl.kode} (${cpl.ranah}): ${cpl.deskripsi}`}>
                            <div className="font-bold text-amber-300">{cpl.kode}</div>
                            <div className="text-[9px] text-slate-500 uppercase">{cpl.ranah.substring(0, 4)}</div>
                          </th>
                        ))}
                        <th className="p-3 font-bold text-center w-28 border-l border-slate-800">Status RPS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredCourses.map((mk) => (
                        <tr key={mk.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-mono font-bold text-amber-300 sticky left-0 bg-slate-900 z-10">
                            {mk.kodeMK}
                          </td>
                          <td className="p-3 sticky left-20 bg-slate-900 z-10 font-medium">
                            <div className="text-white font-bold">{mk.namaMK}</div>
                            <div className="text-[10px] text-slate-400">{mk.dosenPengampu}</div>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-300">{mk.semester}</td>
                          <td className="p-3 text-center font-bold text-slate-300">{mk.sks}</td>
                          {defaultProdiCpls.map((cpl) => {
                            const isSupported = mk.cplSupported.includes(cpl.kode);
                            return (
                              <td key={cpl.kode} className="p-2 text-center border-l border-slate-800/60">
                                {isSupported ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs" title={`${mk.namaMK} mendukung ${cpl.kode}`}>
                                    ✓
                                  </span>
                                ) : (
                                  <span className="text-slate-700">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="p-3 text-center border-l border-slate-800">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                mk.statusRps === "APPROVED"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  : mk.statusRps === "PENDING_GJM"
                                  ? "bg-blue-950 text-blue-300 border-blue-800"
                                  : mk.statusRps === "REVISION"
                                  ? "bg-amber-950 text-amber-300 border-amber-800"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {mk.statusRps === "APPROVED"
                                ? "Disahkan"
                                : mk.statusRps === "PENDING_GJM"
                                ? "Menunggu GJM"
                                : mk.statusRps === "REVISION"
                                ? "Revisi Dosen"
                                : "Draf"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Summary Footer CPL Count */}
                    <tfoot>
                      <tr className="bg-slate-950 border-t-2 border-slate-700 text-xs font-bold">
                        <td colSpan={4} className="p-3 text-right text-slate-400 uppercase tracking-wider text-[11px]">
                          Total Mata Kuliah Pendukung CPL:
                        </td>
                        {defaultProdiCpls.map((cpl) => {
                          const count = courses.filter((c) => c.cplSupported.includes(cpl.kode)).length;
                          return (
                            <td key={cpl.kode} className="p-2 text-center border-l border-slate-800 text-amber-400 font-bold">
                              {count} MK
                            </td>
                          );
                        })}
                        <td className="p-3 text-center border-l border-slate-800 text-emerald-400">
                          {courses.length} MK
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* CPL Coverage Analysis Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Konfirmasi Penyelarasan OBE Program Studi
                </div>
                <p className="text-[11.5px] text-slate-400">
                  Seluruh 10 CPL Program Studi telah terdistribusi secara seimbang ke seluruh tahapan semester (1 s.d. 8). Tidak ada CPL yang tidak memiliki mata kuliah pengukur ketercapaian.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => showNotification("Matriks kurikulum berhasil disinkronkan dengan data Simpel-CPL!", "success")}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Sinkronkan dengan Simpel-CPL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: WORKFLOW VALIDASI & PENGESAHAN RPS PRODI          */}
        {/* ======================================================== */}
        {activeTab === "approval" && (
          <div className="space-y-4 max-w-7xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Alur Validasi &amp; Pengesahan Dokumen RPS Semester
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kaprodi berwenang memvalidasi, mengesahkan secara digital, atau mengembalikan RPS dengan catatan revisi sebelum semester perkuliahan dimulai.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 font-bold"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="APPROVED">Disahkan (Approved)</option>
                  <option value="PENDING_GJM">Menunggu Review GJM</option>
                  <option value="REVISION">Perlu Revisi Dosen</option>
                  <option value="DRAFT">Draf Belum Selesai</option>
                </select>
              </div>
            </div>

            {/* List of Courses for Approval */}
            <div className="grid grid-cols-1 gap-3">
              {filteredCourses.map((mk) => (
                <div
                  key={mk.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs mt-0.5 border border-amber-500/30">
                        {mk.kodeMK}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">{mk.namaMK}</h3>
                        <p className="text-xs text-slate-400">
                          Dosen Koordinator: <strong className="text-slate-300">{mk.dosenPengampu}</strong> &bull; Semester {mk.semester} &bull; {mk.sks} SKS
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                          mk.statusRps === "APPROVED"
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-600"
                            : mk.statusRps === "PENDING_GJM"
                            ? "bg-blue-950/80 text-blue-300 border-blue-600"
                            : mk.statusRps === "REVISION"
                            ? "bg-amber-950/80 text-amber-300 border-amber-600"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {mk.statusRps === "APPROVED" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {mk.statusRps === "REVISION" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                        {mk.statusRps === "PENDING_GJM" && <Clock className="w-3.5 h-3.5 text-blue-400" />}
                        <span>
                          {mk.statusRps === "APPROVED"
                            ? "Disahkan Kaprodi"
                            : mk.statusRps === "PENDING_GJM"
                            ? "Review Gugus Mutu"
                            : mk.statusRps === "REVISION"
                            ? "Perlu Revisi Dosen"
                            : "Draf"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Kepatuhan & Nilai Audit */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 text-[11px]">Skor Mutu AMI:</span>
                      <div className="font-bold text-white flex items-center gap-1">
                        <span className={mk.skorAmi >= 90 ? "text-emerald-400" : "text-amber-400"}>{mk.skorAmi} / 100</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px]">Pasal 47 (Case &amp; Proyek):</span>
                      <div className={`font-bold ${mk.persenPartisipatifProyek >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                        {mk.persenPartisipatifProyek}% {mk.persenPartisipatifProyek >= 50 ? "(Lolos)" : "(Kurang)"}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px]">Kognitif Dominan:</span>
                      <div className="font-bold text-cyan-300">{mk.bloomDominan} (Bloom)</div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px]">Tanggal Pengesahan:</span>
                      <div className="font-bold text-slate-300">{mk.approvedAt || "Belum Disahkan"}</div>
                    </div>
                  </div>

                  {mk.catatanGjm && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Catatan Gugus Jaminan Mutu (GJM) / Kaprodi:
                      </div>
                      <p>{mk.catatanGjm}</p>
                    </div>
                  )}

                  {/* Tombol Aksi Kaprodi & GJM */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400">
                      CPL Terkait: <span className="font-mono text-slate-200">{mk.cplSupported.join(", ")}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenRpsInEditor && (
                        <button
                          type="button"
                          onClick={() => onOpenRpsInEditor(mk.namaMK)}
                          className="px-3 py-1.5 bg-blue-950/70 hover:bg-blue-900 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          title="Buka dan baca dokumen RPS mata kuliah ini di Pratinjau"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                          <span>Periksa Berkas</span>
                        </button>
                      )}

                      {mk.statusRps !== "APPROVED" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseForAction(mk);
                              setActionModalType("REVISE");
                              setRevisionNote(mk.catatanGjm || "");
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Beri Catatan Revisi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveCourse(mk.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Sahkan &amp; Tanda Tangani RPS</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                            <BadgeCheck className="w-4 h-4" />
                            RPS Resmi Berlaku (Stempel Digital Kaprodi)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourseForAction(mk);
                              setActionModalType("REVISE");
                            }}
                            className="text-xs text-slate-400 hover:text-white underline cursor-pointer ml-2"
                          >
                            Tinjau Ulang
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: VISUALISASI BEBAN KERJA DOSEN (BKD PER SEMESTER)     */}
        {/* ======================================================== */}
        {activeTab === "dosen_workload" && (
          <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
            {/* Header Seksi BKD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Users className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      Visualisasi Beban Kerja Dosen (BKD) Bidang Pendidikan
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Standar Pengajaran: 3 - 9 SKS
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Monitoring beban mengajar riil Program Studi {namaProdiAktif} dengan pembagian Team Teaching proporsional sesuai Pedoman BKD Nasional.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Legenda & Aksi Utama (Smart Guide & Ekspor PDF) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap text-[11px] font-bold bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Ideal (3 - 9 SKS)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Kurang (&lt; 3 SKS)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Overload (&gt; 9 SKS)
                  </span>
                </div>

                {/* Tombol Smart Guide */}
                <button
                  type="button"
                  onClick={() => setIsSmartGuideOpen(!isSmartGuideOpen)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isSmartGuideOpen
                      ? "bg-amber-500 text-slate-950 font-black"
                      : "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40"
                  }`}
                  title="Buka panduan kontekstual penyeimbang beban dosen"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Smart Guide</span>
                </button>

                {/* Tombol Ekspor PDF Ringkasan BKD */}
                <button
                  type="button"
                  onClick={handleExportBkdPdf}
                  disabled={isExportingBkdPdf}
                  className="px-3.5 py-2 rounded-xl text-xs font-black text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 transition flex items-center gap-1.5 cursor-pointer shadow-sm border border-red-600"
                  title="Unduh Laporan Ringkasan BKD Bidang Pendidikan Siap Cetak (PDF)"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isExportingBkdPdf ? "Membuat PDF..." : "Cetak Laporan BKD"}</span>
                </button>
              </div>
            </div>

            {/* Smart Guide Panel */}
            {isSmartGuideOpen && (
              <KaprodiSmartGuide
                isOpen={isSmartGuideOpen}
                onClose={() => setIsSmartGuideOpen(false)}
                lecturers={lecturerWorkloadList as BkdLecturerItem[]}
                namaProdi={namaProdiAktif}
                semesterAktif={
                  workloadSemester === "ALL"
                    ? "Semua Semester"
                    : `Semester ${workloadSemester}`
                }
                onSelectLecturer={(dosen) => setSelectedLecturerDetail(dosen)}
              />
            )}

            {/* Navigasi Sub-Tampilan BKD */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setWorkloadViewMode("current_semester")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  workloadViewMode === "current_semester"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>1. Beban Semester Berjalan (Team Teaching)</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkloadViewMode("trend_3_tahun")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  workloadViewMode === "trend_3_tahun"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <TrendingUp className="w-4 h-4 text-cyan-300" />
                <span>2. Tren Beban Dosen 3 Tahun Terakhir (2024 - 2026)</span>
              </button>
            </div>

            {/* KONTEN SUB-TAMPILAN TREN 3 TAHUN */}
            {workloadViewMode === "trend_3_tahun" ? (
              <DosenWorkload3YearTrend
                namaProdi={namaProdiAktif}
                showNotification={showNotification}
              />
            ) : (
              <>
                {/* Filter Kontrol & Pencarian */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Filter Semester Utama */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                      <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Semester:
                      </span>
                      {[
                        { id: "ALL", label: "Semua Semester" },
                        { id: "GANJIL", label: "Ganjil (1, 3, 5, 7)" },
                        { id: "GENAP", label: "Genap (2, 4, 6, 8)" },
                      ].map((sem) => (
                        <button
                          key={sem.id}
                          type="button"
                          onClick={() => setWorkloadSemester(sem.id as any)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                            workloadSemester === sem.id
                              ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {sem.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Dosen */}
                    <div className="relative w-full md:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={workloadSearchDosen}
                        onChange={(e) => setWorkloadSearchDosen(e.target.value)}
                        placeholder="Cari nama dosen pengampu..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Sub-filter per individual semester 1..8 */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 pb-1">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Spesifik:</span>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setWorkloadSemester(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          workloadSemester === s
                            ? "bg-blue-600 text-white font-black shadow-xs"
                            : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        Sem {s}
                      </button>
                    ))}

                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-500">Filter Beban:</span>
                      <select
                        value={workloadStatusFilter}
                        onChange={(e: any) => setWorkloadStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1 font-bold focus:outline-none focus:border-amber-500"
                      >
                        <option value="ALL">Semua Kategori</option>
                        <option value="IDEAL">Ideal (3 - 9 SKS)</option>
                        <option value="RINGAN">Kurang (&lt; 3 SKS)</option>
                        <option value="OVERLOAD">Overload (&gt; 9 SKS)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Banner Penjelasan Formula Team Teaching & Pedoman BKD */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-300 shadow-sm">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-300 block mb-0.5">
                      Pedoman BKD Bidang Pendidikan &amp; Formula Team Teaching:
                    </span>
                    <span>
                      Sesuai Pedoman Operasional BKD Dikti: Unsur Pendidikan (Mengajar) minimal <strong>3 SKS</strong> dan batas wajar <strong>9 SKS</strong> (total BKD Tridharma 12–16 SKS bersama riset &amp; pengabdian). Beban SKS dosen dihitung dari <strong>besaran SKS mata kuliah dibagi jumlah dosen pengampu</strong> (mis. MK 3 SKS dengan 3 dosen pengampu = <code className="text-amber-300 font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-700">3 / 3 = 1.0 SKS</code> per dosen).
                    </span>
                  </div>
                </div>

                {/* Statistik Ringkas Beban Kerja */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-400">Total Dosen Terdata</div>
                    <div className="text-xl font-black text-white mt-1 flex items-baseline gap-1.5">
                      <span>{lecturerWorkloadList.length}</span>
                      <span className="text-xs font-normal text-slate-500">Dosen</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-400">Total SKS Terdistribusi</div>
                    <div className="text-xl font-black text-amber-400 mt-1 flex items-baseline gap-1.5">
                      <span>
                        {Number(
                          lecturerWorkloadList.reduce((acc, l) => acc + l.totalSks, 0).toFixed(1)
                        )}
                      </span>
                      <span className="text-xs font-normal text-slate-500">SKS</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-400">Rata-Rata SKS / Dosen</div>
                    <div className="text-xl font-black text-blue-400 mt-1 flex items-baseline gap-1.5">
                      <span>
                        {lecturerWorkloadList.length > 0
                          ? (
                              lecturerWorkloadList.reduce((acc, l) => acc + l.totalSks, 0) /
                              lecturerWorkloadList.length
                            ).toFixed(1)
                          : 0}
                      </span>
                      <span className="text-xs font-normal text-slate-500">SKS</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-slate-400">Memenuhi Target BKD (3-9 SKS)</div>
                    <div className="text-xl font-black text-emerald-400 mt-1 flex items-baseline gap-1.5">
                      <span>
                        {lecturerWorkloadList.filter((l) => l.status === "IDEAL").length} /{" "}
                        {lecturerWorkloadList.length}
                      </span>
                      <span className="text-xs font-normal text-emerald-500">Dosen</span>
                    </div>
                  </div>
                </div>

                {/* DIAGRAM BATANG VISUALISASI SKS (BAR CHART) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-amber-400" />
                        Diagram Batang: Beban Mengajar Dosen per Mata Kuliah (Team Teaching Aware)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Setiap segmen batang mewakili beban riil SKS mata kuliah setelah dibagi dengan anggota Team Teaching. Klik segmen untuk rincian.
                      </p>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Batas Ideal Pengajaran: <strong className="text-amber-400">3 SKS</strong> s.d.{" "}
                      <strong className="text-rose-400">9 SKS</strong>
                    </div>
                  </div>

                  {/* Batang-batang Diagram */}
                  <div className="space-y-4">
                    {lecturerWorkloadList.map((item, idx) => {
                      return (
                        <div
                          key={item.dosen}
                          className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition"
                        >
                          {/* Baris Nama Dosen & Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-black text-white tracking-wide cursor-pointer hover:text-amber-400 transition" onClick={() => setSelectedLecturerDetail(item.dosen)}>
                                  {item.dosen}
                                </span>
                                <span className="text-[11px] text-slate-400 ml-2">
                                  ({item.courses.length} MK &bull; {item.teamTeachingCount} Team Teaching)
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                                {item.totalSks.toFixed(1)} SKS Pengajaran
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                  item.status === "IDEAL"
                                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                    : item.status === "OVERLOAD"
                                    ? "bg-rose-950 text-rose-300 border-rose-800"
                                    : "bg-amber-950 text-amber-300 border-amber-800"
                                }`}
                              >
                                {item.status === "IDEAL"
                                  ? "Optimal Pengajaran (3-9 SKS)"
                                  : item.status === "OVERLOAD"
                                  ? "Kelebihan Beban (> 9 SKS)"
                                  : "Beban Kurang (< 3 SKS)"}
                              </span>
                            </div>
                          </div>

                          {/* Bar Container dengan Garis Panduan 3 & 9 SKS */}
                          <div className="relative pt-1 pb-1">
                            {/* Garis Panduan Ideal 3 SKS */}
                            <div
                              className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-400/50 pointer-events-none z-10"
                              style={{ left: `${Math.min(95, (3 / maxWorkloadSks) * 100)}%` }}
                              title="Batas Minimum Pengajaran (3 SKS)"
                            >
                              <span className="text-[9px] font-mono font-bold text-amber-300 absolute -top-4 -translate-x-1/2 bg-slate-900 px-1 rounded">
                                Min 3
                              </span>
                            </div>

                            {/* Garis Panduan Ideal 9 SKS */}
                            <div
                              className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-400/50 pointer-events-none z-10"
                              style={{ left: `${Math.min(98, (9 / maxWorkloadSks) * 100)}%` }}
                              title="Batas Maksimum Pengajaran (9 SKS)"
                            >
                              <span className="text-[9px] font-mono font-bold text-rose-300 absolute -top-4 -translate-x-1/2 bg-slate-900 px-1 rounded">
                                Max 9
                              </span>
                            </div>

                            {/* Batang Segmen Bersusun (Stacked Bar) Menggunakan sksShare */}
                            <div className="h-8 bg-slate-900 rounded-xl overflow-hidden flex border border-slate-800 p-0.5">
                              {item.courses.map((c, cIdx) => {
                                const segWidthPct = (c.sksShare / maxWorkloadSks) * 100;
                                const colorClass = courseBarColors[cIdx % courseBarColors.length];
                                return (
                                  <div
                                    key={c.id}
                                    style={{ width: `${Math.max(5, segWidthPct)}%` }}
                                    className={`h-full bg-gradient-to-r ${colorClass} rounded-lg flex items-center justify-between px-2 text-[10.5px] font-black text-white shadow-xs cursor-pointer hover:brightness-110 transition mr-0.5 relative group`}
                                    title={`${c.kodeMK} - ${c.namaMK} (${c.sksShare} SKS dari ${c.sks} SKS, ${c.teamSize} Dosen)`}
                                    onClick={() => setSelectedLecturerDetail(item.dosen)}
                                  >
                                    <span className="truncate mr-1 font-mono">{c.kodeMK}</span>
                                    <span className="bg-black/40 px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap">
                                      {c.sksShare % 1 === 0 ? c.sksShare : c.sksShare.toFixed(1)} SKS
                                      {c.isTeamTeaching && (
                                        <span className="ml-1 text-[8px] text-amber-300 font-bold">
                                          (TT:{c.teamSize})
                                        </span>
                                      )}
                                    </span>

                                    {/* Tooltip hover interaktif dengan rincian Team Teaching */}
                                    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 bg-slate-950 text-white text-xs rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap z-30 pointer-events-none">
                                      <div className="font-bold text-amber-300">
                                        {c.kodeMK}: {c.namaMK}
                                      </div>
                                      <div className="text-[10.5px] text-slate-300 mt-0.5">
                                        Total Mata Kuliah: <strong>{c.sks} SKS</strong> &bull; Semester {c.semester} &bull; Status: {c.statusRps}
                                      </div>
                                      {c.isTeamTeaching ? (
                                        <div className="text-[10.5px] text-emerald-300 font-bold border-t border-slate-800 pt-1 mt-1">
                                          Team Teaching ({c.teamSize} Dosen): {c.sks} SKS / {c.teamSize} = <strong>{c.sksShare} SKS</strong> untuk dosen ini
                                          <div className="text-[9.5px] text-slate-400 font-normal mt-0.5">
                                            Tim: {c.teamMembers.join("; ")}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-[10.5px] text-blue-300 border-t border-slate-800 pt-1 mt-1">
                                          Pengampu Mandiri (1 Dosen): Beban penuh <strong>{c.sks} SKS</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Daftar Mata Kuliah Chips di Bawah Bar */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-2">
                            {item.courses.map((c) => (
                              <div
                                key={c.id}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1 cursor-pointer hover:border-slate-700"
                                onClick={() => setSelectedLecturerDetail(item.dosen)}
                              >
                                <span className="font-bold text-amber-400">Sem {c.semester}:</span>
                                <span className="font-semibold">{c.namaMK}</span>
                                <span className="font-bold text-emerald-400">
                                  ({c.sksShare % 1 === 0 ? c.sksShare : c.sksShare.toFixed(1)} SKS
                                  {c.isTeamTeaching ? ` &bull; ${c.sks}/${c.teamSize} TT` : ""})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* TABEL RINCIAN SEBARAN MATA KULIAH */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                      Tabel Rincian Beban Mengajar Dosen se-Program Studi (Team Teaching)
                    </h3>
                    <span className="text-xs text-slate-400">
                      Menampilkan pembagian proporsional SKS mata kuliah
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px]">
                          <th className="p-3">Dosen / Tim Pengampu</th>
                          <th className="p-3">Kode MK</th>
                          <th className="p-3">Nama Mata Kuliah</th>
                          <th className="p-3 text-center">Semester</th>
                          <th className="p-3 text-center">Total MK</th>
                          <th className="p-3 text-center">Beban SKS / Dosen</th>
                          <th className="p-3 text-center">Status RPS</th>
                          <th className="p-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {workloadCourses.map((c) => {
                          const members = parseLecturersList(c.dosenPengampu);
                          const teamCount = Math.max(1, members.length);
                          const perLecturer = Number((c.sks / teamCount).toFixed(2));
                          return (
                            <tr key={c.id} className="hover:bg-slate-800/40 transition">
                              <td className="p-3">
                                <div className="font-bold text-white">{c.dosenPengampu}</div>
                                {teamCount > 1 && (
                                  <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                                    Team Teaching: {teamCount} Dosen
                                  </div>
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold text-amber-400">{c.kodeMK}</td>
                              <td className="p-3 font-semibold text-slate-200">{c.namaMK}</td>
                              <td className="p-3 text-center font-bold text-slate-300">Sem {c.semester}</td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs">
                                  {c.sks} SKS
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-xs inline-block">
                                  {perLecturer % 1 === 0 ? perLecturer : perLecturer.toFixed(2)} SKS
                                  {teamCount > 1 ? ` (${c.sks}/${teamCount})` : ""}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    c.statusRps === "APPROVED"
                                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                      : c.statusRps === "PENDING_GJM"
                                      ? "bg-blue-950 text-blue-300 border-blue-800"
                                      : c.statusRps === "REVISION"
                                      ? "bg-amber-950 text-amber-300 border-amber-800"
                                      : "bg-slate-800 text-slate-400 border-slate-700"
                                  }`}
                                >
                                  {c.statusRps === "APPROVED"
                                    ? "Disahkan"
                                    : c.statusRps === "PENDING_GJM"
                                    ? "Menunggu GJM"
                                    : c.statusRps === "REVISION"
                                    ? "Perlu Revisi"
                                    : "Draft"}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => onOpenRpsInEditor?.(c.namaMK)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center gap-1 mx-auto cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Lihat RPS</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* MODAL RINCIAN DOSEN DETAIL */}
            {selectedLecturerDetail && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white">
                          Rincian Beban Mengajar: {selectedLecturerDetail}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Program Studi {namaProdiAktif} &bull; Beban Terhitung Proporsional Team Teaching
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedLecturerDetail(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {lecturerMap[selectedLecturerDetail] && (
                    <div className="space-y-4">
                      {/* Kartu Ringkasan SKS */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-bold">Total Beban SKS:</span>
                          <span className="text-xl font-black text-amber-400 font-mono">
                            {lecturerMap[selectedLecturerDetail].totalSks.toFixed(1)} SKS
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-bold">Jumlah Mata Kuliah:</span>
                          <span className="text-xl font-black text-white">
                            {lecturerMap[selectedLecturerDetail].courses.length} MK
                          </span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-bold">Status BKD:</span>
                          <span className="text-xs font-black text-emerald-400 block mt-1">
                            {lecturerMap[selectedLecturerDetail].status === "IDEAL"
                              ? "Optimal (12-16 SKS)"
                              : lecturerMap[selectedLecturerDetail].status === "OVERLOAD"
                              ? "Overload (>16 SKS)"
                              : "Ringan (<12 SKS)"}
                          </span>
                        </div>
                      </div>

                      {/* Tabel Rincian MK Dosen Ini */}
                      <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Kode &amp; Mata Kuliah</th>
                              <th className="p-2.5 text-center">Semester</th>
                              <th className="p-2.5 text-center">Total MK</th>
                              <th className="p-2.5 text-center">Tim Pengampu</th>
                              <th className="p-2.5 text-center">Beban Dosen Ini</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                            {lecturerMap[selectedLecturerDetail].courses.map((c) => (
                              <tr key={c.id}>
                                <td className="p-2.5">
                                  <div className="font-bold text-white">{c.namaMK}</div>
                                  <div className="font-mono text-amber-400 text-[10px]">{c.kodeMK}</div>
                                </td>
                                <td className="p-2.5 text-center text-slate-300">Sem {c.semester}</td>
                                <td className="p-2.5 text-center font-bold text-white">{c.sks} SKS</td>
                                <td className="p-2.5 text-center">
                                  {c.isTeamTeaching ? (
                                    <span className="text-[10.5px] text-amber-300 font-bold block" title={c.teamMembers.join("; ")}>
                                      Team Teaching ({c.teamSize} Dosen)
                                    </span>
                                  ) : (
                                    <span className="text-[10.5px] text-blue-300 font-bold">
                                      Mandiri (1 Dosen)
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-center font-mono font-bold text-emerald-400">
                                  {c.sksShare} SKS
                                  {c.isTeamTeaching && (
                                    <div className="text-[9px] text-slate-400 font-normal">
                                      ({c.sks} / {c.teamSize})
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedLecturerDetail(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MODUL AUDIT KESELARASAN DESKRIPSI MK VS CPL BERBASIS AI             */}
        {/* ========================================================================= */}
        {activeTab === "cpl_alignment_audit" && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
            {/* Header Modul Audit Keselarasan */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    Modul Audit Keselarasan Deskripsi Mata Kuliah vs CPL
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      Berbasis Gemini 2.5 Flash
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Memeriksa kesesuaian antara rumusan deskripsi mata kuliah dengan CPL yang dibebankan, memberikan skor keselarasan (alignment score) dan rekomendasi perbaikan berbasis AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Panel Form Target & Input Deskripsi */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pilih Mata Kuliah untuk Diaudit
                  </label>
                  <select
                    value={auditTargetCourseId}
                    onChange={(e) => handleSelectAuditTarget(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">
                      ★ RPS Aktif: {rpsData.kodeMK || "PPP224127"} - {rpsData.namaMK || "Kemiskinan Multidimensional"}
                    </option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.kodeMK} - {c.namaMK} (Sem {c.semester}, {c.sks} SKS)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kode MK</label>
                  <input
                    type="text"
                    value={auditCourseCode}
                    onChange={(e) => setAuditCourseCode(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-amber-400 uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Textarea Deskripsi Mata Kuliah */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Deskripsi / Ringkasan Mata Kuliah Saat Ini
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Dapat diedit langsung sebelum audit dijalankan
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={auditCourseDesc}
                  onChange={(e) => setAuditCourseDesc(e.target.value)}
                  placeholder="Ketikkan atau sesuaikan deskripsi mata kuliah..."
                  className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Daftar CPL yang Menjadi Pembanding */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  CPL yang Dibebankan pada Mata Kuliah Ini ({rpsData.cplList?.length || defaultProdiCpls.length} CPL)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  {(rpsData.cplList && rpsData.cplList.length > 0 ? rpsData.cplList : defaultProdiCpls).map(
                    (cpl: any) => (
                      <span
                        key={cpl.id || cpl.kode}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold flex items-center gap-1"
                        title={cpl.desc || cpl.deskripsi}
                      >
                        <span>{cpl.id || cpl.kode}</span>
                        <span className="text-slate-400 font-normal">
                          ({(cpl.category || cpl.ranah || "OBE").slice(0, 10)})
                        </span>
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Tombol Eksekusi Audit */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunAlignmentAudit}
                  disabled={isAuditingAlignment}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isAuditingAlignment ? "animate-spin text-slate-900" : ""}`} />
                  <span>
                    {isAuditingAlignment
                      ? "Sedang Menganalisis Keselarasan dengan AI..."
                      : "Jalankan Audit Keselarasan AI (Gemini 2.5 Flash)"}
                  </span>
                </button>
              </div>
            </div>

            {/* HASIL AUDIT KESELARASAN AI */}
            {alignmentResult && (
              <div className="space-y-5 animate-fadeIn">
                {/* Skor Keselarasan Utama & Eksekutif */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex flex-col items-center justify-center text-slate-950 shadow-lg flex-shrink-0">
                      <span className="text-2xl font-black leading-none">{alignmentResult.alignmentScore}%</span>
                      <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">Skor CPL</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                            alignmentResult.alignmentScore >= 90
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : alignmentResult.alignmentScore >= 80
                              ? "bg-blue-950 text-blue-300 border-blue-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          }`}
                        >
                          {alignmentResult.grade}
                        </span>
                        <span className="text-xs text-slate-400">
                          Standar Penjaminan Mutu UNPATTI
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-white">
                        Indeks Keselarasan Deskripsi Mata Kuliah terhadap CPL
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {alignmentResult.executiveSummary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Dimensi Pilar Evaluasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Taksonomi Bloom (HOTS C4-C6)",
                      score: alignmentResult.dimensionScores.cognitiveBloom,
                      color: "from-blue-500 to-indigo-600",
                    },
                    {
                      label: "Relevansi Substansi CPL",
                      score: alignmentResult.dimensionScores.contentRelevance,
                      color: "from-emerald-500 to-teal-600",
                    },
                    {
                      label: "Konteks Kepulauan & PIP",
                      score: alignmentResult.dimensionScores.pipMalukuContext,
                      color: "from-amber-500 to-orange-600",
                    },
                    {
                      label: "Keterampilan Proyek (Pasal 47)",
                      score: alignmentResult.dimensionScores.practicalSkills,
                      color: "from-purple-500 to-pink-600",
                    },
                  ].map((dim) => (
                    <div key={dim.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">{dim.label}</span>
                        <span className="text-xs font-mono font-black text-amber-400">{dim.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full bg-gradient-to-r ${dim.color} rounded-full transition-all duration-700`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Matriks Evaluasi per-CPL */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                  <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                    Matriks Analisis Kesesuaian Tiap Butir CPL
                  </h3>

                  <div className="space-y-2.5">
                    {alignmentResult.cplEvaluations.map((item) => (
                      <div
                        key={item.cplId}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-start justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md">
                              {item.cplId}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                item.status === "SELARAS_PENUH"
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                  : item.status === "SELARAS_SEBAGIAN"
                                  ? "bg-amber-950 text-amber-300 border-amber-800"
                                  : "bg-rose-950 text-rose-300 border-rose-800"
                              }`}
                            >
                              {item.status === "SELARAS_PENUH"
                                ? "Selaras Penuh"
                                : item.status === "SELARAS_SEBAGIAN"
                                ? "Selaras Sebagian"
                                : "Kurang Terwakili"}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              Kecocokan: <strong>{item.matchScore}%</strong>
                            </span>
                          </div>

                          {item.cplDesc && (
                            <p className="text-[11px] text-slate-400 italic">
                              "{item.cplDesc}"
                            </p>
                          )}

                          <p className="text-xs text-slate-300 mt-1">
                            <strong className="text-white">Analisis:</strong> {item.strengths} {item.gaps}
                          </p>

                          {item.matchingKeywords.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] text-slate-500 font-bold">Kata Kunci Terdeteksi:</span>
                              {item.matchingKeywords.map((k) => (
                                <span
                                  key={k}
                                  className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="md:w-64 flex-shrink-0 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-amber-200">
                          <strong className="text-amber-400 block mb-0.5">Saran Penyelarasan:</strong>
                          <span>{item.suggestion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rekomendasi Perbaikan & Rumusan Deskripsi Hasil AI */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Rekomendasi Perbaikan Berbasis AI &amp; Rumusan Deskripsi Optimal
                    </h3>
                  </div>

                  {/* Bullet Rekomendasi */}
                  <div className="space-y-2">
                    {alignmentResult.actionableRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rumusan Deskripsi Baru Hasil AI */}
                  <div className="p-4 bg-slate-950 rounded-xl border-2 border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4" />
                        Rumusan Deskripsi Mata Kuliah Hasil Optimasi AI (Siap Pakai)
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      {alignmentResult.improvedCourseDescription}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(alignmentResult.improvedCourseDescription);
                          showNotification("Rumusan deskripsi AI disalin ke clipboard!", "info");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Teks</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApplyAiDescription}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Terapkan Deskripsi Baru ke RPS</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ======================================================== */}
        {/* TAB 3: AUDIT MUTU INTERNAL (AMI) OLEH GJM FAKULTAS       */}
        {/* ======================================================== */}
        {activeTab === "ami_audit" && (
          <div className="space-y-4 max-w-5xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-black text-white">
                    Instrumen Audit Mutu Internal (AMI) RPS Berbasis Standar Nasional SN-Dikti
                  </h2>
                  <p className="text-xs text-slate-400">
                    Panduan kepatuhan dokumen RPS mengacu Permendiktisaintek No. 39 Tahun 2025, Permendiktisaintek No. 10 Tahun 2026 dan Peraturan Rektor Unpatti No. 12 Tahun 2026 dan Standar Mutu Akademik Universitas Pattimura.
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist 8 Elemen Audit Mutu */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                8 Indikator Kepatuhan Dokumen RPS Mutu Tinggi
              </h3>

              <div className="space-y-3">
                {[
                  {
                    no: 1,
                    judul: "Ketajaman Penurunan CPL ke CPMK dan Sub-CPMK",
                    standar: "Setiap Sub-CPMK memiliki kata kerja operasional (KKO) Bloom yang terukur dan selaras dengan CPL.",
                    status: "TERPENUHI",
                    skor: 96,
                  },
                  {
                    no: 2,
                    judul: "Kepatuhan Pasal 47 Peraturan Rektor No. 12/2026 (Case Method & PjBL >= 50%)",
                    standar: "Metode pembelajaran partisipatif dan proyek memiliki bobot evaluasi minimal 50% dari total nilai akhir sesuai Pasal 47 Ayat 3.",
                    status: "TERPENUHI",
                    skor: 95,
                  },
                  {
                    no: 3,
                    judul: "Rubrik Penilaian Asesmen Holistik & Analitik",
                    standar: "Memiliki rubrik 5 skala kriteria penilaian yang objektif, transparan, dan dapat diakses mahasiswa.",
                    status: "TERPENUHI",
                    skor: 94,
                  },
                  {
                    no: 4,
                    judul: "Kemutakhiran Bahan Kajian & Referensi Jurnal (< 5 Tahun)",
                    standar: "Daftar pustaka memuat referensi jurnal bereputasi mutakhir format APA 7th yang terhubung isu kepulauan.",
                    status: "TERPENUHI",
                    skor: 92,
                  },
                  {
                    no: 5,
                    judul: "Kesesuaian Beban Belajar SKS dengan Alokasi Waktu (Permendikbud 39/2025 pasal 16)",
                    standar: "1 SKS setara dengan 45 jam per semester (Belajar Terbimbing, penugasan terstruktur, dan kegiatan mandiri).",
                    status: "TERPENUHI",
                    skor: 98,
                  },
                  {
                    no: 6,
                    judul: "Rancangan Intervensi Wilayah Kepulauan Maluku (Pola Ilmiah Pokok)",
                    standar: "Konteks pembelajaran terintegrasi dengan kearifan lokal kepulauan, ketahanan pangan, dan pesisir.",
                    status: "TERPENUHI",
                    skor: 95,
                  },
                  {
                    no: 7,
                    judul: "Validitas Evaluasi Tengah Semester (UTS) & Akhir (UAS)",
                    standar: "Bentuk evaluasi berbasis studi kasus autentik dan portofolio proyek terintegrasi.",
                    status: "TERPENUHI",
                    skor: 90,
                  },
                  {
                    no: 8,
                    judul: "Ketersediaan Tanda Tangan Pengesahan Kaprodi & Dosen Pengampu",
                    standar: "Dokumen RPS dilengkapi lembar validasi resmi, tanggal pengesahan, dan identitas NIDN/NIP.",
                    status: "TERPENUHI",
                    skor: 100,
                  },
                ].map((item) => (
                  <div key={item.no} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {item.no}
                      </span>
                      <div>
                        <div className="font-bold text-white text-xs">{item.judul}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.standar}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 pl-9 sm:pl-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                        Skor: {item.skor}/100
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rekomendasi Auditor GJM */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">Catatan Auditor Gugus Jaminan Mutu (GJM) Fakultas:</div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-serif italic">
                  &ldquo;Dokumen kurikulum dan RPS yang dievaluasi telah memenuhi standar mutu akademik SN-Dikti dengan predikat SANGAT BAIK (Skor 94.2/100). Disarankan dosen pengampu mata kuliah tingkat lanjut semester 6-7 mempertahankan bobot metode pemecahan kasus (Case Method) dan Project-Based Learning agar mahasiswa memiliki kesiapan portofolio kerja unggul.&rdquo;
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: KESEIMBANGAN TAKSONOMI BLOOM (C1-C6)              */}
        {/* ======================================================== */}
        {activeTab === "bloom_analysis" && (
          <div className="space-y-4 max-w-5xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                Distribusi Taksonomi Bloom Program Studi (Kognitif C1 - C6)
              </h2>
              <p className="text-xs text-slate-400">
                Memantau proporsi kemampuan kognitif agar kurikulum sarjana (S1) didominasi oleh Higher-Order Thinking Skills (HOTS: C4 Menganalisis, C5 Mengevaluasi, C6 Mencipta).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Sebaran Level Kognitif se-Program Studi
                </h3>

                <div className="space-y-3">
                  {[
                    { level: "C6 - Mencipta / Merancang (Create)", persen: 25, count: "2 MK", color: "bg-indigo-500", note: "Tugas Akhir, Perencanaan Program" },
                    { level: "C5 - Mengevaluasi (Evaluate)", persen: 25, count: "2 MK", color: "bg-blue-500", note: "Kemiskinan Multidimensional, Evaluasi Kebijakan" },
                    { level: "C4 - Menganalisis (Analyze)", persen: 25, count: "2 MK", color: "bg-cyan-500", note: "Metodologi Penelitian, Komunikasi Pembangunan" },
                    { level: "C3 - Menerapkan (Apply)", persen: 12.5, count: "1 MK", color: "bg-emerald-500", note: "Sosiologi Pedesaan" },
                    { level: "C2 - Memahami (Understand)", persen: 12.5, count: "1 MK", color: "bg-amber-500", note: "Pengantar Ilmu Sosial" },
                    { level: "C1 - Mengingat (Remember)", persen: 0, count: "0 MK", color: "bg-rose-500", note: "Tidak ada mata kuliah hafalan murni" },
                  ].map((b) => (
                    <div key={b.level} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{b.level}</span>
                        <span className="font-mono text-slate-400">{b.persen}% ({b.count})</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className={`${b.color} h-full rounded-full`} style={{ width: `${b.persen}%` }}></div>
                      </div>
                      <div className="text-[10px] text-slate-500">{b.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Analisis Kematangan Taksonomi Bloom
                  </h3>

                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4" />
                      Kurikulum Unggul: 75% Berbasis HOTS (C4-C6)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Standar Akreditasi Internasional dan BAN-PT mensyaratkan kurikulum sarjana memiliki minimal 50% capaian HOTS. Program studi Anda saat ini mencapai <strong>75%</strong>, mencerminkan kurikulum riset dan pemecahan masalah nyata kepulauan yang sangat matang.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      <span>Semester 1-2: Pembekalan konsep dasar &amp; pemahaman (C2-C3).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      <span>Semester 3-5: Penguatan metodologi, analisis kritis, dan intervensi (C4-C5).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                      <span>Semester 6-8: Perancangan kebijakan, model inovasi, dan skripsi (C5-C6).</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  Data ini diselaraskan otomatis dengan rumusan Sub-CPMK dari setiap mata kuliah di form RPS.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: KEPATUHAN PASAL 59 STATUTA UNPATTI                */}
        {/* ======================================================== */}
        {activeTab === "pasal59" && (
          <div className="space-y-4 max-w-5xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-black text-white">
                    Audit Kepatuhan Pasal 47 Peraturan Rektor Universitas Pattimura No. 12 Tahun 2026
                  </h2>
                  <p className="text-xs text-slate-400">
                    Amanat Pasal 47 Ayat 3: Bobot evaluasi pembelajaran berbasis <strong>Case Method (Pemecahan Kasus)</strong> dan <strong>Project-Based Learning (PBL)</strong> wajib $\ge 50\%$ untuk setiap mata kuliah.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Mata Kuliah</th>
                    <th className="p-3 text-center">Semester</th>
                    <th className="p-3 text-center">Bobot Partisipatif &amp; Proyek</th>
                    <th className="p-3 text-center">Status Pasal 47</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {courses.map((mk) => {
                    const isLolos = mk.persenPartisipatifProyek >= 50;
                    return (
                      <tr key={mk.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3">
                          <div className="font-bold text-white">{mk.namaMK}</div>
                          <div className="text-[10px] text-slate-400">{mk.dosenPengampu}</div>
                        </td>
                        <td className="p-3 text-center font-bold text-slate-300">{mk.semester}</td>
                        <td className="p-3 text-center">
                          <div className="font-mono font-bold text-white">{mk.persenPartisipatifProyek}%</div>
                          <div className="w-24 bg-slate-950 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLolos ? "bg-emerald-500" : "bg-rose-500"}`}
                              style={{ width: `${Math.min(100, mk.persenPartisipatifProyek)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border inline-flex items-center gap-1 ${
                              isLolos
                                ? "bg-emerald-950/70 text-emerald-300 border-emerald-600"
                                : "bg-rose-950/70 text-rose-300 border-rose-600"
                            }`}
                          >
                            {isLolos ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                            <span>{isLolos ? "MEMENUHI SYARAT" : "PERLU PENYESUAIAN"}</span>
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {!isLolos ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourseForAction(mk);
                                setActionModalType("REVISE");
                                setRevisionNote(
                                  `Bobot Case Method & PjBL saat ini ${mk.persenPartisipatifProyek}%. Harap disesuaikan minimal 50% sesuai Pasal 47 Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik.`
                                );
                              }}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Kirim Peringatan Dosen
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500">Kepatuhan Terverifikasi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: BERITA ACARA PENGESAHAN DOKUMEN AKREDITASI        */}
        {/* ======================================================== */}
        {activeTab === "export_berita_acara" && (
          <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Berita Acara Validasi Mutu &amp; Pengesahan RPS OBE
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dokumen resmi bukti penjaminan mutu kurikulum untuk instrumen akreditasi BAN-PT, LAM, atau akreditasi internasional.
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Berita Acara</span>
              </button>
            </div>

            {/* Preview Berita Acara Resmi */}
            <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-300 font-serif space-y-6 leading-relaxed">
              {/* Kop Surat */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="font-bold text-sm tracking-wider uppercase">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
                <div className="font-black text-lg uppercase tracking-tight">UNIVERSITAS PATTIMURA</div>
                <div className="font-bold text-base uppercase">{fakultasAktif.toUpperCase()}</div>
                <div className="font-bold text-sm uppercase text-slate-700">PROGRAM STUDI {namaProdiAktif.toUpperCase()} ({jenjangAktif})</div>
                <div className="text-xs italic text-slate-600">Kampus Poka, Jl. Ir. M. Putuhena, Ambon - Maluku 97233</div>
              </div>

              {/* Judul Berita Acara */}
              <div className="text-center space-y-1">
                <h3 className="font-bold text-base uppercase underline tracking-wide">
                  BERITA ACARA VALIDASI DAN PENGESAHAN DOKUMEN RPS
                </h3>
                <div className="text-xs font-mono text-slate-600">
                  Nomor: 114/UN13.F1/GJM-OBE/{new Date().getFullYear()}
                </div>
              </div>

              <p className="text-xs text-justify">
                Pada hari ini, <strong>Kamis, 15 Oktober 2026</strong>, bertempat di Ruang Rapat Program Studi {namaProdiAktif}, {fakultasAktif} Universitas Pattimura, telah dilaksanakan Rapat Pleno Validasi dan Audit Mutu Dokumen Rencana Pembelajaran Semester (RPS) Berbasis <em>Outcome-Based Education (OBE)</em> untuk Semester Gasal Tahun Akademik 2026/2027.
              </p>

              <div className="text-xs space-y-2">
                <div className="font-bold">Berdasarkan hasil verifikasi Gugus Jaminan Mutu (GJM) dan Ketua Program Studi:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-800 pl-2">
                  <li>Seluruh Capaian Pembelajaran Lulusan (CPL) telah terpetakan secara konstruktif (*constructive alignment*) ke dalam rumusan CPMK dan Sub-CPMK.</li>
                  <li>Metode evaluasi telah memenuhi amanat Pasal 47 Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik dengan proporsi pembelajaran partisipatif (Case Method) dan berbasis proyek (Project-Based Learning) mencapai <strong>{pasal59Rate}%</strong>.</li>
                  <li>Tingkat kepatuhan mutu dokumen kurikulum mencapai skor <strong>{avgAmiScore}/100</strong> dengan predikat <strong>UNGGUL</strong>.</li>
                  <li>Sebanyak <strong>{approvedCourses} dari {totalCourses} mata kuliah</strong> dinyatakan <strong>LAYAK DAN DISAHKAN</strong> untuk diterapkan dalam proses belajar mengajar.</li>
                </ol>
              </div>

              <p className="text-xs text-justify">
                Demikian Berita Acara ini dibuat dengan sebenarnya untuk dipergunakan sebagai dokumen pemenuhan Standar Nasional Pendidikan Tinggi (SN-Dikti) dan kelengkapan akreditasi program studi.
              </p>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center">
                <div className="space-y-16">
                  <div>
                    Mengetahui / Memvalidasi:<br />
                    <strong>Ketua Gugus Jaminan Mutu (GJM)</strong>
                  </div>
                  <div>
                    <strong className="underline uppercase">Dr. Ir. J. M. Matitaputty, M.Sc</strong><br />
                    <span>NIP. 197408122001121002</span>
                  </div>
                </div>

                <div className="space-y-16">
                  <div>
                    Mengesahkan:<br />
                    <strong>Ketua Program Studi {namaProdiAktif}</strong>
                  </div>
                  <div>
                    <strong className="underline uppercase">{namaKaprodiAktif}</strong><br />
                    <span>NIP/NIDN. 197805212005011003</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL REVISI / AUDIT ACTION */}
      {actionModalType === "REVISE" && selectedCourseForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-950" />
                <h3 className="text-sm font-black">Kirim Catatan Revisi Dokumen RPS</h3>
              </div>
              <button
                type="button"
                onClick={() => setActionModalType(null)}
                className="p-1 rounded-lg bg-slate-950/20 hover:bg-slate-950/30 text-slate-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-400">Mata Kuliah:</span>
                <div className="text-sm font-bold text-white">{selectedCourseForAction.namaMK} ({selectedCourseForAction.kodeMK})</div>
                <div className="text-xs text-slate-400">Dosen Pengampu: {selectedCourseForAction.dosenPengampu}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Uraian Rekomendasi Revisi untuk Dosen:
                </label>
                <textarea
                  rows={4}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Contoh: Sesuaikan persentase Case Method agar minimal 50% sesuai Pasal 47 Peraturan Rektor No. 12/2026..."
                  className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionModalType(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleReviseCourse(selectedCourseForAction.id)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Dosen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
