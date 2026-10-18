import React, { useState, useEffect } from "react";
import {
  Globe2,
  BookOpen,
  TrendingUp,
  Sparkles,
  Search,
  ExternalLink,
  Plus,
  Check,
  RefreshCw,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Copy,
  FileSearch,
  AlertTriangle,
  Target,
  ArrowLeftRight,
  Lock,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { SdgAlignmentRadarChart } from "./SdgAlignmentRadarChart";
import { InterAppIntegrationHub } from "./InterAppIntegrationHub";
import {
  OpenAlexWork,
  RpsData,
  WorldBankIndicatorRecord,
  AiAuditResult,
  LiteratureGapResult,
} from "../types/rps";
import {
  searchOpenAlexWorks,
  formatOpenAlexToApa,
  WORLD_BANK_INDICATORS,
  fetchWorldBankData,
  generateCurriculumWithAi,
  auditRpsWithAi,
  analyzeLiteratureGap,
} from "../services/apiService";

interface RealTimeApiHubProps {
  rpsData: RpsData;
  setRpsData: React.Dispatch<React.SetStateAction<RpsData>>;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const RealTimeApiHub: React.FC<RealTimeApiHubProps> = ({
  rpsData,
  setRpsData,
  showNotification,
}) => {
  const [subTab, setSubTab] = useState<"openalex" | "worldbank" | "ai" | "gap_analysis" | "sdg_radar" | "simpel_cpl">("openalex");

  // OpenAlex State - dikosongkan secara default sesuai permintaan pengguna agar dosen mengetik kata kunci sendiri
  const [openAlexQuery, setOpenAlexQuery] = useState("");
  const [openAlexResults, setOpenAlexResults] = useState<OpenAlexWork[]>([]);
  const [isLoadingOpenAlex, setIsLoadingOpenAlex] = useState(false);
  const [addedWorks, setAddedWorks] = useState<Set<string>>(new Set());

  // World Bank State
  const [wbIndicator, setWbIndicator] = useState("SI.POV.NAHC");
  const [wbCountry, setWbCountry] = useState("IDN");
  const [wbRecords, setWbRecords] = useState<WorldBankIndicatorRecord[]>([]);
  const [isLoadingWb, setIsLoadingWb] = useState(false);

  // AI State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<AiAuditResult | null>(null);
  const [customFocus, setCustomFocus] = useState(
    "Pertanian kepulauan Maluku, kemiskinan multidimensional pedesaan pesisir, dan transformasi kelembagaan petani"
  );

  // Literature Gap Analysis State
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [gapResult, setGapResult] = useState<LiteratureGapResult | null>(null);

  // Security Password State for Integrasi Simpel-CPL (Password = 1234)
  const [isSimpelCplUnlocked, setIsSimpelCplUnlocked] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [enteredPassword, setEnteredPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Handler buka tab Integrasi Simpel-CPL dengan validasi password
  const handleOpenSimpelCplTab = () => {
    if (isSimpelCplUnlocked) {
      setSubTab("simpel_cpl");
    } else {
      setEnteredPassword("");
      setPasswordError("");
      setIsPasswordModalOpen(true);
    }
  };

  // Handler verifikasi password
  const handleVerifyPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (enteredPassword.trim() === "1234") {
      setIsSimpelCplUnlocked(true);
      setIsPasswordModalOpen(false);
      setSubTab("simpel_cpl");
      setPasswordError("");
      showNotification("Password benar! Akses Integrasi Simpel-CPL berhasil dibuka.", "success");
    } else {
      setPasswordError("Password salah! Masukkan password keamanan yang valid.");
    }
  };

  // Handler kunci kembali akses
  const handleLockSimpelCpl = () => {
    setIsSimpelCplUnlocked(false);
    setSubTab("openalex");
    showNotification("Fitur Integrasi Simpel-CPL telah dikunci kembali.", "info");
  };

  // Fetch OpenAlex on mount jika ada query awal
  useEffect(() => {
    if (openAlexQuery.trim()) {
      handleSearchOpenAlex();
    }
  }, []);

  // Fetch World Bank on mount
  useEffect(() => {
    handleFetchWorldBank();
  }, [wbIndicator, wbCountry]);

  // OpenAlex search handler
  const handleSearchOpenAlex = async () => {
    const trimmedQuery = openAlexQuery.trim();
    if (!trimmedQuery) {
      showNotification("Silakan ketik topik, judul, atau kata kunci pencarian literatur terlebih dahulu.", "info");
      return;
    }

    setIsLoadingOpenAlex(true);
    try {
      const results = await searchOpenAlexWorks(trimmedQuery);
      setOpenAlexResults(results);
      if (results.length > 0) {
        showNotification(
          `Ditemukan ${results.length} publikasi ilmiah real-time dari OpenAlex API!`,
          "success"
        );
      } else {
        showNotification("Tidak ada karya ilmiah ditemukan untuk kata kunci ini.", "info");
      }
    } catch (err: any) {
      showNotification("Gagal mengambil data OpenAlex: " + err.message, "error");
    } finally {
      setIsLoadingOpenAlex(false);
    }
  };

  // Add work to RPS bibliography
  const handleAddWorkToRps = (work: OpenAlexWork) => {
    const citation = formatOpenAlexToApa(work);
    setRpsData((prev) => {
      const existing = prev.daftarPustaka.trim();
      const updated = existing ? `${existing}\n${citation}` : citation;
      return { ...prev, daftarPustaka: updated };
    });
    setAddedWorks((prev) => new Set(prev).add(work.id));
    showNotification("Sitasi berhasil ditambahkan ke Daftar Pustaka RPS!", "success");
  };

  // Copy citation
  const handleCopyCitation = (work: OpenAlexWork) => {
    const citation = formatOpenAlexToApa(work);
    navigator.clipboard.writeText(citation);
    showNotification("Sitasi APA 7th disalin ke clipboard!", "info");
  };

  // World Bank fetch handler
  const handleFetchWorldBank = async () => {
    setIsLoadingWb(true);
    try {
      const { records } = await fetchWorldBankData(wbIndicator, wbCountry);
      setWbRecords(records.filter((r) => r.value !== null));
    } catch (err: any) {
      showNotification("Gagal memuat indikator World Bank: " + err.message, "error");
    } finally {
      setIsLoadingWb(false);
    }
  };

  // Insert World Bank data into course description or notes
  const handleInsertWbDataToDeskripsi = () => {
    if (wbRecords.length === 0) return;
    const latest = wbRecords[0];
    const indObj = WORLD_BANK_INDICATORS.find((i) => i.code === wbIndicator);
    const textSnippet = `\n[Catatan Data Riil Real-Time World Bank API]: Menurut data resmi tahun ${latest.date}, ${indObj?.name || latest.indicator.value} untuk ${latest.country.value} tercatat sebesar ${latest.value?.toFixed(2)}%. Angka ini menjadi basis empiris perumusan intervensi kebijakan dalam perkuliahan.`;

    setRpsData((prev) => ({
      ...prev,
      deskripsiMK: prev.deskripsiMK + textSnippet,
    }));
    showNotification("Data real-time World Bank berhasil disisipkan ke Deskripsi MK!", "success");
  };

  // AI Generation Handler
  const handleGenerateCurriculumWithAi = async () => {
    setIsAiGenerating(true);
    showNotification("Menghubungi Gemini 3.8 Flash untuk menyusun kurikulum OBE...", "info");
    try {
      const result = await generateCurriculumWithAi({
        courseName: rpsData.namaMK,
        courseCode: rpsData.kodeMK,
        sks: rpsData.bobotSKS,
        semester: rpsData.semester,
        selectedCpls: rpsData.selectedCpls,
        focusTopic: customFocus,
      });

      if (result) {
        setRpsData((prev) => ({
          ...prev,
          deskripsiMK: result.deskripsiMK || prev.deskripsiMK,
          bahanKajian: result.bahanKajian || prev.bahanKajian,
          cpmkList: result.cpmk || prev.cpmkList,
          subCpmkList: result.subCpmk || prev.subCpmkList,
          syllabusList: result.syllabus16Weeks || prev.syllabusList,
          daftarPustaka: result.rekomendasiPustaka || prev.daftarPustaka,
        }));
        showNotification("RPS lengkap berhasil disusun oleh Gemini AI sesuai standar OBE!", "success");
      }
    } catch (err: any) {
      showNotification("Gagal menghasilkan kurikulum dengan AI: " + err.message, "error");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // AI Audit Handler
  const handleAuditRps = async () => {
    setIsAiAuditing(true);
    showNotification("Menjalankan audit OBE & kesesuaian Pasal 47 Peraturan Rektor No. 12/2026 UNPATTI...", "info");
    try {
      const result = await auditRpsWithAi({
        courseName: rpsData.namaMK,
        cpmk: rpsData.cpmkList,
        subCpmk: rpsData.subCpmkList,
        assessmentWeights: rpsData.assessmentWeights,
        syllabus: rpsData.syllabusList,
      });
      setAiAuditResult(result);
      showNotification("Audit OBE selesai! Skor: " + result.skorKelayakanOBE + "/100", "success");
    } catch (err: any) {
      showNotification("Audit AI gagal: " + err.message, "error");
    } finally {
      setIsAiAuditing(false);
    }
  };

  // Literature Gap Analysis Handler
  const handleAnalyzeLiteratureGap = async () => {
    setIsAnalyzingGap(true);
    showNotification("Menganalisis kesenjangan Bahan Kajian vs publikasi OpenAlex terkini...", "info");

    try {
      // Ensure we have OpenAlex works
      let worksToCompare = openAlexResults;
      if (worksToCompare.length === 0) {
        worksToCompare = await searchOpenAlexWorks(openAlexQuery || rpsData.namaMK);
        setOpenAlexResults(worksToCompare);
      }

      const result = await analyzeLiteratureGap({
        courseName: rpsData.namaMK,
        currentTopics: rpsData.bahanKajian,
        currentDescription: rpsData.deskripsiMK,
        openAlexWorks: worksToCompare,
      });

      setGapResult(result);
      showNotification(`Analisis kesenjangan selesai! Skor kemutakhiran: ${result.skorKemutakhiran}/100`, "success");
    } catch (err: any) {
      showNotification("Gagal menganalisis kesenjangan literatur: " + err.message, "error");
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  // Apply modernized topics to RPS
  const handleApplyUpdatedTopics = () => {
    if (!gapResult?.bahanKajianTermutakhirkan) return;
    setRpsData((prev) => ({
      ...prev,
      bahanKajian: gapResult.bahanKajianTermutakhirkan,
    }));
    showNotification("Bahan Kajian RPS berhasil diperbarui dengan topik termutakhir!", "success");
  };

  // Apply gap references to RPS bibliography
  const handleApplyGapReferences = () => {
    if (!gapResult?.rekomendasiPustakaPendukung || gapResult.rekomendasiPustakaPendukung.length === 0) return;
    const newRefs = gapResult.rekomendasiPustakaPendukung.join("\n");
    setRpsData((prev) => {
      const existing = prev.daftarPustaka.trim();
      const updated = existing ? `${existing}\n${newRefs}` : newRefs;
      return { ...prev, daftarPustaka: updated };
    });
    showNotification("Daftar pustaka RPS berhasil diperkaya dengan publikasi terkini!", "success");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sub-tab Navigation */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-black tracking-wide uppercase text-slate-200">
            Real-Time Academic &amp; Data Intelligence Hub
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setSubTab("openalex")}
            className={`px-3 py-1.2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              subTab === "openalex"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>OpenAlex Pustaka</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("worldbank")}
            className={`px-3 py-1.2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              subTab === "worldbank"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>World Bank Data</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("ai")}
            className={`px-3 py-1.2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              subTab === "ai"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI OBE Engine</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("gap_analysis")}
            className={`px-3 py-1.2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              subTab === "gap_analysis"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileSearch className="w-3.5 h-3.5 text-amber-300" />
            <span>Kesenjangan Riset</span>
            <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded font-bold border border-amber-400/30 hidden sm:inline">
              OpenAlex+AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("sdg_radar")}
            className={`px-3 py-1.2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              subTab === "sdg_radar"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-300" />
            <span>Radar SDGs</span>
            <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1 py-0.2 rounded font-bold border border-emerald-400/30 hidden sm:inline">
              Recharts
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenSimpelCplTab}
            className={`px-3 py-1.2 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
              subTab === "simpel_cpl"
                ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                : "text-blue-300 hover:text-white bg-blue-950/40 border border-blue-500/30"
            }`}
            title="Integrasi data dua arah dengan aplikasi Simpel-CPL (Perlu Password Keamanan)"
          >
            {isSimpelCplUnlocked ? (
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Integrasi Simpel-CPL</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                isSimpelCplUnlocked
                  ? "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
                  : "bg-amber-400/20 text-amber-300 border-amber-400/30"
              }`}
            >
              {isSimpelCplUnlocked ? "Terbuka" : "Terkunci"}
            </span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* SUBTAB 1: OPENALEX */}
        {subTab === "openalex" && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    Pencarian Literatur Ilmiah Real-Time (OpenAlex API)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Akses jutaan jurnal terindeks Scopus, Web of Science, dan Open Access untuk
                    memperkaya Daftar Pustaka RPS dengan 1-klik format APA 7th.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-semibold">
                    API LIVE
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={openAlexQuery}
                    onChange={(e) => setOpenAlexQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchOpenAlex()}
                    placeholder="Ketik topik, judul, atau kata kunci pencarian jurnal ilmiah..."
                    className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchOpenAlex}
                  disabled={isLoadingOpenAlex}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-950 disabled:opacity-50"
                >
                  {isLoadingOpenAlex ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Cari Jurnal</span>
                </button>
              </div>

              {/* Preset Search Chips */}
              <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
                <span className="text-slate-400 font-medium py-0.5">Rekomendasi Kata Kunci:</span>
                {[
                  "multidimensional poverty Alkire Foster",
                  "agricultural extension small islands",
                  "poverty reduction rural Indonesia",
                  "penyuluhan pertanian kepulauan Maluku",
                  "social change agrarian community",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setOpenAlexQuery(chip);
                      setTimeout(() => handleSearchOpenAlex(), 50);
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-medium transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Quick Banner to Literature Gap Analysis */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-600/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                    <FileSearch className="w-4 h-4 text-amber-400" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white">
                      Analisis Kesenjangan Bahan Kajian vs Riset Terkini
                    </h4>
                    <p className="text-[10.5px] text-amber-200/80 leading-snug">
                      Bandingkan topik materi RPS dengan tren publikasi OpenAlex 3 tahun terakhir untuk menemukan materi yang tertinggal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubTab("gap_analysis");
                    if (!gapResult) handleAnalyzeLiteratureGap();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                >
                  <span>Buka Analisis Kesenjangan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* OpenAlex Search Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
                <span>Daftar Publikasi Terkait ({openAlexResults.length})</span>
                <span>Format Sitasi Otomatis: APA 7th Edition</span>
              </div>

              {isLoadingOpenAlex ? (
                <div className="p-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Menghubungi OpenAlex API &amp; mengambil metadata sitasi...
                  </p>
                </div>
              ) : openAlexResults.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  Tidak ada hasil. Ketik kata kunci di atas dan tekan Cari.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {openAlexResults.map((work) => {
                    const isAdded = addedWorks.has(work.id);
                    return (
                      <div
                        key={work.id}
                        className="bg-slate-800/80 border border-slate-700/70 hover:border-cyan-500/50 rounded-xl p-4 transition flex flex-col justify-between shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              {work.publication_year || "Tahun N/A"}
                            </span>
                            {work.open_access?.is_oa && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Open Access PDF
                              </span>
                            )}
                            {work.cited_by_count !== undefined && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                📚 {work.cited_by_count} Sitasi
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                            {work.title || "Tanpa Judul"}
                          </h4>

                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {work.authorships?.map((a) => a.author?.display_name).join(", ") ||
                              "Penulis Anonim"}
                          </p>

                          <p className="text-[10.5px] text-cyan-400/90 italic truncate">
                            {work.primary_location?.source?.display_name || "Jurnal Akademik"}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          {work.doi ? (
                            <a
                              href={work.doi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Lihat DOI</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-500">No DOI</span>
                          )}

                          <div className="flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyCitation(work)}
                              title="Salin Sitasi APA"
                              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddWorkToRps(work)}
                              disabled={isAdded}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                isAdded
                                  ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700 cursor-default"
                                  : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Sudah Masuk</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Masukkan RPS</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: WORLD BANK */}
        {subTab === "worldbank" && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                    Data Indikator Kemiskinan &amp; Pertanian (World Bank API)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data empiris time-series resmi dari World Bank Open Data API untuk mendasari bahan
                    kajian dan tugas analisis kemiskinan berbasis data riil.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                    REAL-TIME SYNC
                  </span>
                </div>
              </div>

              {/* Selector Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pilih Indikator Ekonomi &amp; Kemiskinan
                  </label>
                  <select
                    value={wbIndicator}
                    onChange={(e) => setWbIndicator(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {WORLD_BANK_INDICATORS.map((ind) => (
                      <option key={ind.code} value={ind.code}>
                        {ind.name} ({ind.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Negara Target
                  </label>
                  <select
                    value={wbCountry}
                    onChange={(e) => setWbCountry(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="IDN">Indonesia (IDN)</option>
                    <option value="PHL">Filipina (PHL)</option>
                    <option value="VNM">Vietnam (VNM)</option>
                    <option value="THA">Thailand (THA)</option>
                    <option value="WLD">Rata-Rata Dunia (WLD)</option>
                  </select>
                </div>
              </div>

              {/* Indicator description */}
              <div className="mt-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <strong className="text-emerald-400">Deskripsi Indikator:</strong>{" "}
                  {WORLD_BANK_INDICATORS.find((i) => i.code === wbIndicator)?.description}
                </div>
                <button
                  type="button"
                  onClick={handleInsertWbDataToDeskripsi}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1.5 flex-shrink-0 ml-3"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Sisipkan ke Deskripsi RPS</span>
                </button>
              </div>
            </div>

            {/* World Bank Records Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
                <span>
                  Tren Tahunan Real-Time ({wbCountry} - {wbRecords.length} Periode Terbaru)
                </span>
                <span>Sumber: World Bank Group Data Portal</span>
              </div>

              {isLoadingWb ? (
                <div className="p-12 text-center bg-slate-800/30 rounded-2xl border border-slate-800">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Mengambil data time-series dari World Bank API...
                  </p>
                </div>
              ) : wbRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/30 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                  Tidak ada data untuk indikator dan negara ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {wbRecords.map((rec) => (
                    <div
                      key={rec.date}
                      className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center space-y-1 shadow-sm"
                    >
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        Tahun {rec.date}
                      </div>
                      <div className="text-base font-black text-emerald-400">
                        {rec.value !== null ? rec.value.toFixed(2) : "-"}%
                      </div>
                      <div className="text-[9px] text-slate-400 line-clamp-1">
                        {rec.country.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: AI OBE ENGINE */}
        {subTab === "ai" && (
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Banner AI */}
            <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </span>
                    <h3 className="text-base font-black text-white">
                      AI OBE Curriculum Designer &amp; Auditor (Gemini 3.8 Flash)
                    </h3>
                  </div>
                  <p className="text-xs text-purple-200/80 max-w-2xl leading-relaxed">
                    Menyelaraskan deskripsi mata kuliah, CPMK, Sub-CPMK bertingkat Bloom (C2-C6), dan
                    silabus 16 minggu dengan karakteristik kepulauan Maluku &amp; Pasal 47 Peraturan Rektor No. 12/2026 UNPATTI.
                  </p>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleGenerateCurriculumWithAi}
                    disabled={isAiGenerating}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-950 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAiGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    ) : (
                      <Cpu className="w-4 h-4 text-amber-300" />
                    )}
                    <span>Susun RPS Lengkap via AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAuditRps}
                    disabled={isAiAuditing}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-purple-700/50 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAiAuditing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>Audit OBE &amp; Bloom</span>
                  </button>
                </div>
              </div>

              {/* Custom prompt focus input */}
              <div className="mt-4 pt-4 border-t border-purple-900/60">
                <label className="block text-xs font-bold text-purple-300 mb-1">
                  Konteks Khusus / Penekanan Wilayah (Kearifan Lokal &amp; Isu Wilayah):
                </label>
                <input
                  type="text"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  placeholder="Misal: Kemiskinan di pulau-pulau kecil Maluku, rantai pasok pala dan cengkeh..."
                  className="w-full text-xs px-3.5 py-2 bg-slate-950/80 border border-purple-800/60 rounded-xl text-white font-medium focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Audit Results Card */}
            {aiAuditResult && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-black text-white">Hasil Evaluasi &amp; Audit OBE</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-semibold">Skor Kelayakan OBE:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {aiAuditResult.skorKelayakanOBE} / 100
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                      {aiAuditResult.statusAudit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-amber-300 block font-bold">
                      Distribusi Taksonomi Bloom (C1-C6):
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      {aiAuditResult.kesesuaianTaksonomiBloom}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 block font-bold">
                      Kepatuhan Pasal 47 Peraturan Rektor No. 12/2026 UNPATTI:
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      {aiAuditResult.kesesuaianPasal47Unpatti || aiAuditResult.kesesuaianPasal59Unpatti}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <strong className="text-cyan-400 block font-bold">
                    Rekomendasi Peningkatan Kurikulum:
                  </strong>
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    {aiAuditResult.rekomendasiPerbaikan?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Archipelago Case Study */}
                {aiAuditResult.studiKasusKepulauan && (
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <strong className="text-purple-300 block font-bold">
                      💡 Rekomendasi Kasus Proyek Lapangan Wilayah Kepulauan:
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      {aiAuditResult.studiKasusKepulauan}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: LITERATURE GAP ANALYSIS */}
        {subTab === "gap_analysis" && (
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border border-amber-600/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <FileSearch className="w-5 h-5 text-amber-300" />
                    </span>
                    <h3 className="text-base font-black text-white">
                      Analisis Kesenjangan Literatur (Literature Gap Analysis)
                    </h3>
                  </div>
                  <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
                    Membandingkan Bahan Kajian RPS saat ini dengan tren publikasi ilmiah terbaru dari{" "}
                    <strong>OpenAlex API (2023–2026)</strong>, mendeteksi materi tertinggal, dan merekomendasikan penyesuaian materi agar kurikulum up-to-date.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeLiteratureGap}
                  disabled={isAnalyzingGap}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-950 transition flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                >
                  {isAnalyzingGap ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  )}
                  <span>
                    {isAnalyzingGap ? "Menganalisis Kesenjangan..." : "Mulai Analisis Kesenjangan"}
                  </span>
                </button>
              </div>

              {/* Status Comparison Preview Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-amber-900/60 text-xs">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40">
                  <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                    📖 Bahan Kajian RPS Saat Ini ({rpsData.namaMK})
                  </div>
                  <div className="text-slate-300 line-clamp-3 whitespace-pre-line text-[11px] leading-relaxed">
                    {rpsData.bahanKajian || "(Bahan kajian kosong)"}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-900/40">
                  <div className="text-[10px] uppercase font-bold text-cyan-400 mb-1">
                    🌐 Basis Data Pembanding OpenAlex ({openAlexResults.length} Karya Ilmiah)
                  </div>
                  <div className="text-slate-300 text-[11px] line-clamp-3 leading-relaxed">
                    {openAlexResults.length > 0
                      ? openAlexResults
                          .slice(0, 3)
                          .map((w) => `• [${w.publication_year}] ${w.title}`)
                          .join("\n")
                      : "Akan mengambil publikasi OpenAlex terkini secara otomatis..."}
                  </div>
                </div>
              </div>
            </div>

            {/* Gap Analysis Loading State */}
            {isAnalyzingGap && (
              <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-700 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  Menganalisis Tren Riset OpenAlex vs Bahan Kajian RPS...
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Gemini sedang memetakan konsep kunci riset 2023–2026, menghitung skor kemutakhiran, dan merumuskan topik materi yang perlu ditambahkan ke RPS.
                </p>
              </div>
            )}

            {/* Gap Analysis Results */}
            {gapResult && !isAnalyzingGap && (
              <div className="space-y-4">
                {/* Score & Summary Banner */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-lg text-amber-300">
                        {gapResult.skorKemutakhiran}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-black text-white">
                            Skor Kemutakhiran Kurikulum
                          </h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-black border ${
                              gapResult.skorKemutakhiran >= 80
                                ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                                : gapResult.skorKemutakhiran >= 65
                                ? "bg-amber-950 text-amber-300 border-amber-800"
                                : "bg-rose-950 text-rose-300 border-rose-800"
                            }`}
                          >
                            {gapResult.statusKemutakhiran}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Skala 0-100 mengukur keselarasan materi silabus dengan publikasi sains mutakhir
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyUpdatedTopics}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950 flex items-center gap-1.5 transition flex-shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Terapkan Pembaruan ke RPS</span>
                    </button>
                  </div>

                  <div className="text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                    <strong className="text-amber-300 font-bold block mb-1">
                      🌍 Ringkasan Tren Publikasi Global (OpenAlex 2023–2026):
                    </strong>
                    {gapResult.ringkasanTrenGlobal}
                  </div>
                </div>

                {/* Two Columns: Topik Relevan vs Gaps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Topik Relevan */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Materi yang Sudah Relevan &amp; Mutakhir</span>
                    </div>
                    <div className="space-y-1.5">
                      {gapResult.topikYangSudahRelevan?.map((topik, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/90 p-2.5 rounded-xl border border-emerald-900/30 text-xs text-slate-300 flex items-start gap-2"
                        >
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{topik}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kesenjangan Materi */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Kesenjangan Materi Teridentifikasi (Gaps)</span>
                    </div>
                    <div className="space-y-2">
                      {gapResult.kesenjanganMateri?.map((item, i) => (
                        <div
                          key={i}
                          className="bg-slate-900/90 p-3 rounded-xl border border-amber-900/40 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-amber-200">{item.gap}</strong>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                item.urgensi === "Tinggi"
                                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                                  : "bg-amber-950 text-amber-300 border border-amber-800"
                              }`}
                            >
                              Urgensi {item.urgensi}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            Bukti Tren Riset: {item.buktiTrenOpenAlex}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rekomendasi Penyesuaian Materi */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Saran Penyesuaian &amp; Pembaruan Materi Pembelajaran
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {gapResult.rekomendasiPenyesuaian?.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-slate-200 flex items-start gap-2 leading-relaxed"
                      >
                        <span className="font-bold text-amber-400 font-mono">#{i + 1}</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rumusan Bahan Kajian Termutakhirkan (Siap Pakai) */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Rumusan Bahan Kajian yang Telah Dimutakhirkan (Siap Pakai)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Daftar materi lengkap yang telah diselaraskan dengan tren publikasi terkini
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyUpdatedTopics}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Terapkan ke Bahan Kajian RPS</span>
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                    {gapResult.bahanKajianTermutakhirkan}
                  </div>
                </div>

                {/* Rekomendasi Jurnal Pendukung */}
                {gapResult.rekomendasiPustakaPendukung?.length > 0 && (
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        Publikasi Riset Pendukung Terkini (Format APA 7th)
                      </h4>

                      <button
                        type="button"
                        onClick={handleApplyGapReferences}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambahkan Semua ke Daftar Pustaka</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      {gapResult.rekomendasiPustakaPendukung.map((refStr, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-start justify-between gap-2"
                        >
                          <span className="leading-relaxed">{refStr}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(refStr);
                              showNotification("Sitasi disalin ke clipboard!", "info");
                            }}
                            title="Salin sitasi"
                            className="p-1 text-slate-400 hover:text-white flex-shrink-0"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 5: SDG RADAR ALIGNMENT CHART */}
        {subTab === "sdg_radar" && (
          <div className="max-w-5xl mx-auto space-y-4">
            <SdgAlignmentRadarChart
              rpsData={rpsData}
              setRpsData={setRpsData}
              showNotification={showNotification}
            />
          </div>
        )}

        {/* SUBTAB 6: SIMPEL-CPL & MYAPPS INTER-APP INTEGRATION */}
        {subTab === "simpel_cpl" && (
          isSimpelCplUnlocked ? (
            <InterAppIntegrationHub
              rpsData={rpsData}
              setRpsData={setRpsData}
              showNotification={showNotification}
              onLock={handleLockSimpelCpl}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-slate-900/90 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Akses Terproteksi
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">
                  Autentikasi Integrasi Simpel-CPL
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Fitur pertukaran data dua arah dengan aplikasi <strong>simpel-cpl</strong> memerlukan password keamanan akses.
                </p>
              </div>

              <form onSubmit={handleVerifyPassword} className="space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password Keamanan</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={enteredPassword}
                      onChange={(e) => {
                        setEnteredPassword(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="Masukkan password..."
                      autoFocus
                      required
                      className="w-full text-xs px-3 py-2.5 pl-9 pr-9 bg-slate-950 border-2 border-slate-700 rounded-xl font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Buka Akses Integrasi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubTab("openalex")}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )
        )}
      </div>

      {/* POPUP MODAL KEAMANAN PASSWORD SIMPEL-CPL (JIKA DIKLIK DARI TAB BAR) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl border-2 border-amber-500/50 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Kop Modal */}
            <div className="p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-950/20">
                  <Shield className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight">
                    Keamanan Akses Integrasi
                  </h3>
                  <p className="text-[11px] font-bold text-slate-900/80">
                    Aplikasi Simpel-CPL &amp; Desain-RPSOBE
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Isi Form Modal */}
            <form onSubmit={handleVerifyPassword} className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-300">
                Fitur integrasi data dengan aplikasi <strong>simpel-cpl</strong> memerlukan password keamanan untuk membuka akses.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password Akses</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={enteredPassword}
                    onChange={(e) => {
                      setEnteredPassword(e.target.value);
                      setPasswordError("");
                    }}
                    placeholder="Masukkan password..."
                    autoFocus
                    required
                    className="w-full text-xs px-3 py-2.5 pl-9 pr-9 bg-slate-950 border-2 border-slate-700 rounded-xl font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Buka Integrasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
