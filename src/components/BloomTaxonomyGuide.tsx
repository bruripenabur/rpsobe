import React, { useState } from "react";
import {
  Lightbulb,
  BookOpen,
  Copy,
  Plus,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  X,
  Target,
} from "lucide-react";

export interface BloomLevelData {
  level: string;
  nameId: string;
  nameEn: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  targetDegree: string;
  description: string;
  verbs: string[];
  examplePhrases: string[];
  obeGuidance: string;
}

export const BLOOM_TAXONOMY_LEVELS: BloomLevelData[] = [
  {
    level: "C1",
    nameId: "Mengingat",
    nameEn: "Remember",
    color: "#64748b",
    badgeBg: "bg-slate-100",
    badgeBorder: "border-slate-300",
    badgeText: "text-slate-800",
    targetDegree: "Tahap Pengenalan Dasar (Pertemuan 1-2)",
    description: "Mengingat kembali fakta, istilah, konsep dasar, atau prinsip tanpa perlu pemahaman mendalam.",
    verbs: [
      "Mengidentifikasi",
      "Menyebutkan",
      "Mendefinisikan",
      "Mendaftar",
      "Mencocokkan",
      "Menamai",
      "Menunjukkan",
      "Mengingat",
      "Mengulang",
    ],
    examplePhrases: [
      "Mahasiswa mampu menyebutkan 5 indikator kemiskinan BPS...",
      "Mahasiswa mampu mendefinisikan konsep dasar kemiskinan absolut...",
    ],
    obeGuidance: "Hanya disarankan untuk tahap awal orientasi materi atau kuis diagnostik. Hindari dominasi C1 pada silabus akhir sarjana (S1).",
  },
  {
    level: "C2",
    nameId: "Memahami",
    nameEn: "Understand",
    color: "#0284c7",
    badgeBg: "bg-sky-100",
    badgeBorder: "border-sky-300",
    badgeText: "text-sky-900",
    targetDegree: "Pondasi Konseptual (Minggu 1-5)",
    description: "Menjelaskan ide atau konsep, meringkas informasi, dan menginterpretasikan fakta dengan kata-kata sendiri.",
    verbs: [
      "Menjelaskan",
      "Menguraikan",
      "Membedakan",
      "Mengklasifikasikan",
      "Merangkum",
      "Menginterpretasikan",
      "Memberi contoh",
      "Memperjelas",
      "Mengilustrasikan",
    ],
    examplePhrases: [
      "Mahasiswa mampu menjelaskan perbedaan kemiskinan absolut dan relatif...",
      "Mahasiswa mampu menguraikan konsep Indeks Kemiskinan Manusia...",
    ],
    obeGuidance: "Sangat baik untuk membangun landasan teori sebelum masuk ke analisis kasus lapangan.",
  },
  {
    level: "C3",
    nameId: "Menerapkan",
    nameEn: "Apply",
    color: "#059669",
    badgeBg: "bg-emerald-100",
    badgeBorder: "border-emerald-300",
    badgeText: "text-emerald-900",
    targetDegree: "Praktik & Perhitungan (Minggu 4-10)",
    description: "Menggunakan informasi, metode, konsep, atau teori dalam situasi nyata atau komputasi perhitungan data.",
    verbs: [
      "Menerapkan",
      "Mengimplementasikan",
      "Menghitung",
      "Mengolah",
      "Mendemonstrasikan",
      "Menggunakan",
      "Mengoperasikan",
      "Memecahkan masalah",
      "Menyajikan data",
    ],
    examplePhrases: [
      "Mahasiswa mampu mengolah data sekunder kemiskinan BPS menggunakan perangkat lunak...",
      "Mahasiswa mampu menerapkan metode pengukuran Alkire-Foster...",
    ],
    obeGuidance: "Kunci untuk memenuhi SKS Praktikum dan tugas terstruktur berbasis data empiris.",
  },
  {
    level: "C4",
    nameId: "Menganalisis",
    nameEn: "Analyze",
    color: "#d97706",
    badgeBg: "bg-amber-100",
    badgeBorder: "border-amber-300",
    badgeText: "text-amber-900",
    targetDegree: "Inti Capaian Sarjana S1 (Minggu 7-14)",
    description: "Memecah materi menjadi bagian-bagian, menguji relasi sebab-akibat, dan menelaah struktur masalah kompleks.",
    verbs: [
      "Menganalisis",
      "Membandingkan",
      "Menelaah",
      "Mendiagnosis",
      "Mengaitkan",
      "Mengurai faktor",
      "Membedah",
      "Menyelidiki",
      "Menguji keterkaitan",
    ],
    examplePhrases: [
      "Mahasiswa mampu menganalisis determinan sosial kemiskinan di pulau-pulau kecil...",
      "Mahasiswa mampu menelaah kritik terhadap konsep kebudayaan kemiskinan...",
    ],
    obeGuidance: "Wajib ada sebagai kemampuan analitis mahasiswa tingkat sarjana dalam memecahkan masalah pertanian.",
  },
  {
    level: "C5",
    nameId: "Mengevaluasi",
    nameEn: "Evaluate",
    color: "#9333ea",
    badgeBg: "bg-purple-100",
    badgeBorder: "border-purple-300",
    badgeText: "text-purple-900",
    targetDegree: "Tingkat Lanjut & Kebijakan (Minggu 11-15)",
    description: "Membuat penilaian atau keputusan berdasarkan kriteria dan standar validitas, efektivitas, dan etika.",
    verbs: [
      "Mengevaluasi",
      "Menilai",
      "Mengkritisi",
      "Memvalidasi",
      "Mempertimbangkan",
      "Menjustifikasi",
      "Menguji efektivitas",
      "Membandingkan alternatif",
    ],
    examplePhrases: [
      "Mahasiswa mampu mengevaluasi efektivitas program perlindungan sosial di wilayah pedesaan...",
      "Mahasiswa mampu menilai keabsahan data indikator pembangunan...",
    ],
    obeGuidance: "Cocok untuk capaian CPMK tingkat tinggi dan bahan penilaian ujian komprehensif atau makalah studi kasus.",
  },
  {
    level: "C6",
    nameId: "Mencipta / Berkreasi",
    nameEn: "Create",
    color: "#e11d48",
    badgeBg: "bg-rose-100",
    badgeBorder: "border-rose-300",
    badgeText: "text-rose-900",
    targetDegree: "Puncak Capaian & Tugas Proyek (Minggu 13-16)",
    description: "Menyatukan elemen-elemen untuk membentuk suatu struktur baru yang koheren, merancang solusi orisinal atau rekomendasi.",
    verbs: [
      "Merumuskan",
      "Merancang",
      "Mendesain",
      "Menyusun rekomendasi",
      "Mengembangkan model",
      "Mengkonstruksi",
      "Memprakarsai",
      "Mengintegrasikan",
      "Menciptakan strategi",
    ],
    examplePhrases: [
      "Mahasiswa mampu merumuskan rekomendasi penanggulangan kemiskinan multidimensional berbasis kearifan lokal kepulauan...",
      "Mahasiswa mampu merancang strategi pemberdayaan komunitas petani...",
    ],
    obeGuidance: "Merupakan target tertinggi OBE yang sangat ideal untuk pemenuhan Hasil Proyek (Pasal 47 Peraturan Rektor UNPATTI No. 12/2026).",
  },
];

interface BloomTaxonomyGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerb?: (verb: string, levelCode: string) => void;
  jenjang?: string;
}

export const BloomTaxonomyGuide: React.FC<BloomTaxonomyGuideProps> = ({
  isOpen,
  onClose,
  onSelectVerb,
  jenjang,
}) => {
  const targetBloomLevels =
    jenjang === "S1"
      ? ["C1", "C2", "C3", "C4"]
      : jenjang === "S2"
      ? ["C4", "C5", "C6"]
      : jenjang === "S3"
      ? ["C5", "C6"]
      : jenjang === "Profesi"
      ? ["C3", "C4", "C5"]
      : jenjang === "Spesialis"
      ? ["C4", "C5", "C6"]
      : ["C1", "C2", "C3", "C4", "C5", "C6"];

  const defaultLevel = targetBloomLevels.includes("C4") ? "C4" : targetBloomLevels[0] || "C2";
  const [selectedLevel, setSelectedLevel] = useState<string>(defaultLevel);
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);

  // Auto-switch level when jenjang changes
  React.useEffect(() => {
    if (!targetBloomLevels.includes(selectedLevel)) {
      setSelectedLevel(targetBloomLevels[0] || "C2");
    }
  }, [jenjang]);

  if (!isOpen) return null;

  const visibleBloomList = BLOOM_TAXONOMY_LEVELS.filter((l) =>
    targetBloomLevels.includes(l.level)
  );

  const currentLevelData =
    visibleBloomList.find((l) => l.level === selectedLevel) || visibleBloomList[0] || BLOOM_TAXONOMY_LEVELS[1];

  const handleCopyVerb = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 1800);
  };

  const handleUseVerb = (verb: string) => {
    if (onSelectVerb) {
      onSelectVerb(verb, `${currentLevelData.level}-${currentLevelData.nameId}`);
    }
    handleCopyVerb(verb);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full h-[90vh] max-h-[720px] shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-5 py-3.5 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Lightbulb className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <span>Panduan Kata Kerja Operasional (KKO) Taksonomi Bloom</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  OBE Dikti &amp; UNPATTI
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Pilih KKO terukur untuk merumuskan CPMK dan Sub-CPMK bertingkat kognitif C1-C6
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Tabs (Difilter sesuai Jenjang Pendidikan Terpilih) */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between overflow-x-auto flex-shrink-0">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {visibleBloomList.map((item) => {
            const isSelected = selectedLevel === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => setSelectedLevel(item.level)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-sm border border-slate-300 ring-2 ring-emerald-600/30"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="font-mono">{item.level}</span>
                <span>{item.nameId}</span>
              </button>
            );
          })}
          </div>
          {jenjang && (
            <span className="hidden sm:inline-block text-[10.5px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md whitespace-nowrap">
              Jenjang: {jenjang}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Level Overview Banner */}
          <div
            className={`p-4 rounded-xl border ${currentLevelData.badgeBg} ${currentLevelData.badgeBorder}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-sm px-2 py-0.5 rounded bg-white border border-slate-300 shadow-xs">
                  {currentLevelData.level}
                </span>
                <span className="text-sm font-black text-slate-900">
                  {currentLevelData.nameId} ({currentLevelData.nameEn})
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700">
                🎯 {currentLevelData.targetDegree}
              </span>
            </div>
            <p className="text-slate-700 font-medium leading-relaxed mb-2">
              {currentLevelData.description}
            </p>
            <div className="text-[11px] bg-white/80 p-2.5 rounded-lg border border-slate-200 text-slate-800">
              <strong className="text-emerald-800 font-bold">Rekomendasi OBE UNPATTI:</strong>{" "}
              {currentLevelData.obeGuidance}
            </div>
          </div>

          {/* Action Verbs (KKO) Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-700" />
                Pilihan Kata Kerja Operasional (Klik untuk Menyisipkan/Salin)
              </h4>
              <span className="text-[10px] text-slate-500">
                Total: {currentLevelData.verbs.length} kata kerja terukur
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentLevelData.verbs.map((verb) => {
                const isCopied = copiedVerb === verb;
                return (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => handleUseVerb(verb)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 text-left transition group flex items-center justify-between shadow-xs"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-emerald-900">
                      {verb}
                    </span>
                    <span className="text-slate-400 group-hover:text-emerald-700 flex items-center">
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Example Learning Outcomes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Contoh Rumusan Sub-CPMK Mata Kuliah S1 Penyuluhan:
            </h4>
            <div className="space-y-1.5">
              {currentLevelData.examplePhrases.map((phrase, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 italic flex items-center justify-between gap-2"
                >
                  <span className="leading-snug">&ldquo;{phrase}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => handleCopyVerb(phrase)}
                    title="Salin contoh"
                    className="p-1 text-slate-400 hover:text-slate-700 flex-shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* OBE Principles Footnote */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 space-y-1">
            <strong className="block font-black">
              📌 Prinsip Outcome-Based Education (OBE) dalam Taksonomi Bloom:
            </strong>
            <p className="leading-relaxed text-blue-800">
              1. Hindari kata kerja non-operasional seperti <em>&ldquo;mengetahui&rdquo;</em>, <em>&ldquo;memahami secara umum&rdquo;</em>, atau <em>&ldquo;mengerti&rdquo;</em> karena sulit diukur secara objektif.
              <br />
              2. Pada program Sarjana (S1), kurikulum minimal mencapai level <strong>C4 (Menganalisis)</strong>, dan idealnya bermuara pada <strong>C5/C6 (Evaluasi &amp; Kreasi Proyek Lapangan)</strong> untuk memenuhi Pasal 47 Peraturan Rektor UNPATTI No. 12 Tahun 2026.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            Taksonomi Bloom (Anderson &amp; Krathwohl) &bull; Standar Kurikulum OBE UNPATTI
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
