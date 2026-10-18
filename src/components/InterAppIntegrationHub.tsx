import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Download,
  Upload,
  Copy,
  Check,
  ExternalLink,
  Code2,
  CheckCircle2,
  AlertCircle,
  Database,
  Link,
  Share2,
  RefreshCw,
  BookOpen,
  Lock,
  ShieldCheck,
  KeyRound,
  Play,
} from "lucide-react";
import { RpsData, CplItem } from "../types/rps";

interface InterAppIntegrationHubProps {
  rpsData: RpsData;
  setRpsData: React.Dispatch<React.SetStateAction<RpsData>>;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
  onLock?: () => void;
}

export const InterAppIntegrationHub: React.FC<InterAppIntegrationHubProps> = ({
  rpsData,
  setRpsData,
  showNotification,
  onLock,
}) => {
  // State for pulling from Simpel-CPL
  const [simpelCplUrl, setSimpelCplUrl] = useState("");
  const [pastedJsonCpl, setPastedJsonCpl] = useState("");
  const [isPullingCpl, setIsPullingCpl] = useState(false);
  const [pullMode, setPullMode] = useState<"url" | "paste">("url");

  // State for publishing RPS to Simpel-CPL
  const [isPublishingRps, setIsPublishingRps] = useState(false);
  const [publishedKey, setPublishedKey] = useState<string | null>(null);
  const [publishedPullUrl, setPublishedPullUrl] = useState<string | null>(null);

  // Copy states
  const [copiedPullUrl, setCopiedPullUrl] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedDeepLink, setCopiedDeepLink] = useState(false);

  // Active guide tab
  const [activeGuideTab, setActiveGuideTab] = useState<"api" | "deeplink" | "firestore" | "prodiAuth">("prodiAuth");

  // State for Prodi Auth Gateway testing & copying
  const [testAuthPassword, setTestAuthPassword] = useState("");
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [testAuthResult, setTestAuthResult] = useState<any>(null);
  const [copiedProdiSnippet, setCopiedProdiSnippet] = useState(false);
  const [copiedProdiListUrl, setCopiedProdiListUrl] = useState(false);

  const handleTestAuth = async (pwd?: string) => {
    const passwordToTest = (pwd !== undefined ? pwd : testAuthPassword).trim();
    if (!passwordToTest) {
      showNotification("Masukkan password atau kode prodi untuk diuji!", "error");
      return;
    }
    if (pwd !== undefined) setTestAuthPassword(pwd);
    setIsTestingAuth(true);
    setTestAuthResult(null);
    try {
      const res = await fetch("/api/prodi/verify-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordToTest }),
      });
      const data = await res.json();
      setTestAuthResult(data);
      if (res.ok && data.success) {
        showNotification(data.message || "Autentikasi Berhasil!", "success");
      } else {
        showNotification(data.message || "Autentikasi Gagal", "error");
      }
    } catch (err: any) {
      setTestAuthResult({ success: false, message: err.message });
      showNotification(`Gagal menghubungi server: ${err.message}`, "error");
    } finally {
      setIsTestingAuth(false);
    }
  };

  // Handler: Tarik CPL dari URL Simpel-CPL
  const handlePullCplFromUrl = async () => {
    if (!simpelCplUrl.trim()) {
      showNotification("Masukkan URL endpoint data CPL dari aplikasi Simpel-CPL!", "error");
      return;
    }

    setIsPullingCpl(true);
    showNotification("Menghubungi aplikasi Simpel-CPL...", "info");

    try {
      // Panggil endpoint proxy server.ts untuk menghindari kendala CORS antar domain AI Studio
      const response = await fetch("/api/integration/fetch-cpl-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: simpelCplUrl.trim() }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Gagal mengambil data dari Simpel-CPL");
      }

      const rawPayload = resData.payload;
      const cplListToApply: CplItem[] = extractCplArray(rawPayload);

      if (cplListToApply.length === 0) {
        throw new Error("Format respon Simpel-CPL tidak memuat daftar CPL yang dikenali.");
      }

      setRpsData((prev) => ({
        ...prev,
        cplList: cplListToApply,
      }));

      showNotification(
        `Sukses! Berhasil menarik ${cplListToApply.length} CPL secara otomatis dari aplikasi Simpel-CPL!`,
        "success"
      );
    } catch (err: any) {
      console.error("Gagal menarik CPL:", err);
      showNotification(`Gagal menarik CPL: ${err.message}`, "error");
    } finally {
      setIsPullingCpl(false);
    }
  };

  // Helper normalisasi kategori CPL
  const normalizeCategory = (cat?: string): CplItem["category"] => {
    if (!cat) return "Keterampilan Khusus";
    const up = cat.toUpperCase();
    if (up.includes("SIKAP")) return "Sikap";
    if (up.includes("UMUM")) return "Keterampilan Umum";
    if (up.includes("PENGETAHUAN")) return "Penguasaan Pengetahuan";
    return "Keterampilan Khusus";
  };

  // Helper untuk mengekstrak array CPL dari berbagai variasi respon JSON
  const extractCplArray = (payload: any): CplItem[] => {
    let list: any[] = [];
    if (Array.isArray(payload)) {
      list = payload;
    } else if (payload && Array.isArray(payload.cpls)) {
      list = payload.cpls;
    } else if (payload && Array.isArray(payload.cplList)) {
      list = payload.cplList;
    } else if (payload && Array.isArray(payload.data)) {
      list = payload.data;
    }

    return list.map((item, idx) => ({
      id: item.id || item.kode || item.kodeCpl || `CPL${idx + 1}`,
      category: normalizeCategory(item.category || item.kategori),
      desc: item.desc || item.deskripsi || item.uraian || item.nama || String(item),
    }));
  };

  // Handler: Terapkan JSON CPL manual
  const handleApplyPastedJson = () => {
    if (!pastedJsonCpl.trim()) {
      showNotification("Tempelkan data JSON CPL terlebih dahulu!", "error");
      return;
    }

    try {
      const parsed = JSON.parse(pastedJsonCpl);
      const cpls = extractCplArray(parsed);
      if (cpls.length === 0) {
        throw new Error("Tidak ditemukan array CPL dalam teks JSON tersebut.");
      }

      setRpsData((prev) => ({
        ...prev,
        cplList: cpls,
      }));

      showNotification(`Berhasil memuat ${cpls.length} CPL dari Simpel-CPL!`, "success");
    } catch (e: any) {
      showNotification(`JSON tidak valid: ${e.message}`, "error");
    }
  };

  // Handler: Isi contoh CPL Simpel-CPL
  const handleLoadSampleSimpelCplData = () => {
    const sample: CplItem[] = [
      { id: "CPL-01", category: "Sikap", desc: "Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius serta etika moral." },
      { id: "CPL-02", category: "Keterampilan Umum", desc: "Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan IPTEK kepulauan." },
      { id: "CPL-03", category: "Penguasaan Pengetahuan", desc: "Menguasai konsep teoretis, prinsip manajemen sumberdaya kepulauan, dan analisis pembangunan multidimensional." },
      { id: "CPL-04", category: "Keterampilan Khusus", desc: "Mampu merancang model intervensi kebijakan dan evaluasi program pemberdayaan masyarakat berbasis data empiris." },
      { id: "CPL-05", category: "Keterampilan Khusus", desc: "Mampu memimpin tim kerja multidisiplin dan mengomunikasikan gagasan strategis secara efektif." },
    ];

    setRpsData((prev) => ({
      ...prev,
      cplList: sample,
    }));
    showNotification("Contoh 5 CPL dari Simpel-CPL berhasil diterapkan ke form RPS!", "success");
  };

  // Handler: Publikasikan RPS aktif agar bisa ditarik Simpel-CPL
  const handlePublishRps = async () => {
    setIsPublishingRps(true);
    try {
      const res = await fetch("/api/integration/publish-rps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rpsData,
          prodiCode: rpsData.kodeProdi || "54201",
          courseCode: rpsData.kodeMK || "MK",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mempublikasikan RPS");
      }

      setPublishedKey(data.key);
      const fullUrl = `${window.location.origin}${data.pullUrl}`;
      setPublishedPullUrl(fullUrl);
      showNotification("RPS berhasil dipublikasikan untuk ditarik oleh aplikasi Simpel-CPL!", "success");
    } catch (err: any) {
      showNotification(`Gagal mempublikasikan RPS: ${err.message}`, "error");
    } finally {
      setIsPublishingRps(false);
    }
  };

  // Download export JSON payload
  const handleDownloadRpsJson = () => {
    const payload = {
      sourceApp: "desain-rpsobe",
      targetApp: "simpel-cpl",
      exportedAt: new Date().toISOString(),
      prodi: {
        nama: rpsData.namaProdi,
        kode: rpsData.kodeProdi,
        fakultas: rpsData.namaFakultas,
        jenjang: rpsData.jenjang,
      },
      mataKuliah: {
        nama: rpsData.namaMK,
        kode: rpsData.kodeMK,
        sks: rpsData.bobotSKS,
        semester: rpsData.semester,
        dosen: rpsData.dosenPengampu,
      },
      kurikulumObe: {
        cplTerpilih: rpsData.selectedCpls,
        cpmk: rpsData.cpmkList,
        subCpmk: rpsData.subCpmkList,
        rubrikPenilaian: rpsData.rubrics,
        bobotPenilaian: rpsData.assessmentWeights,
      },
      fullRpsData: rpsData,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `SIMPEL_CPL_SYNC_${rpsData.kodeMK || "MK"}.json`);
    dlAnchorElem.click();
    showNotification("Berkas sinkronisasi JSON untuk Simpel-CPL berhasil diunduh!", "success");
  };

  // Generate deep-link string
  const origin = typeof window !== "undefined" ? window.location.origin : "https://desain-rpsobe.ai.studio";
  const directDeepLink = `${origin}/?prodi=${encodeURIComponent(rpsData.kodeProdi || "54201")}&source=simpel-cpl`;

  // Code snippet for Simpel-CPL app
  const simpelCplSnippet = `// CONTOH KODE UNTUK APLIKASI "SIMPEL-CPL"
// Menghubungkan Simpel-CPL dengan Desain-RPSOBE

// 1. Tombol Kirim CPL & Buka Editor Desain-RPSOBE
export function openDesainRpsObe(prodiCode, cplArray) {
  const baseUrl = "${origin}";
  const params = new URLSearchParams({
    prodi: prodiCode,
    source: "simpel-cpl",
    cplPayload: JSON.stringify(cplArray.map(c => ({
      id: c.id,
      category: c.kategori || c.category,
      desc: c.deskripsi || c.desc
    })))
  });
  
  // Buka tab baru langsung ke Desain-RPSOBE dengan CPL terisi otomatis
  window.open(\`\${baseUrl}/?\${params.toString()}\`, "_blank");
}

// 2. Menarik Data RPS yang Telah Selesai Di-generate dari Desain-RPSOBE
export async function fetchGeneratedRps(prodiCode, courseCode) {
  const pullUrl = \`${origin}/api/integration/get-rps?prodi=\${prodiCode}&mk=\${courseCode}\`;
  
  try {
    const response = await fetch(pullUrl, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    const result = await response.json();
    
    if (result.success && result.data) {
      console.log("RPS Berhasil Ditarik:", result.data);
      // Di aplikasi Simpel-CPL: Simpan CPMK, Sub-CPMK, dan matriks pemetaan ke database Anda
      return result.data;
    }
  } catch (error) {
    console.error("Gagal menarik RPS:", error);
  }
}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/60 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider mb-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-300" />
              <span>Interoperabilitas Antar Aplikasi (MyApps Ecosystem)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Integrasi Simpel-CPL &amp; Desain-RPSOBE
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Kedua aplikasi di akun Anda dapat terhubung secara langsung: kirim daftar rumusan CPL dari <strong>simpel-cpl</strong> ke <strong>desain-rpsobe</strong>, lalu tarik kembali hasil kurikulum OBE (CPMK, Sub-CPMK, Matriks Bobot 100%, dan Rubrik) ke <strong>simpel-cpl</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Akses Terbuka (Terverifikasi)
            </span>
            {onLock && (
              <button
                type="button"
                onClick={onLock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition cursor-pointer active:scale-95"
                title="Kunci kembali fitur Integrasi Simpel-CPL"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Kunci Akses</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-Way Interaction Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* PANEL 1: Tarik CPL dari Simpel-CPL */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                  <Upload className="w-4 h-4" />
                </span>
                1. Tarik CPL dari Simpel-CPL
              </h3>
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPullMode("url")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                    pullMode === "url" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Via URL API
                </button>
                <button
                  type="button"
                  onClick={() => setPullMode("paste")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                    pullMode === "paste" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tempel JSON
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Ambil data CPL yang sudah dirumuskan di aplikasi <strong>simpel-cpl</strong> agar langsung mengisi bagian Capaian Pembelajaran di RPS ini.
            </p>

            {pullMode === "url" ? (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400">
                  URL Endpoint Simpel-CPL (JSON API)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={simpelCplUrl}
                    onChange={(e) => setSimpelCplUrl(e.target.value)}
                    placeholder="https://simpel-cpl.../api/cpl?prodi=54201"
                    className="flex-1 text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handlePullCplFromUrl}
                    disabled={isPullingCpl}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
                  >
                    {isPullingCpl ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                    <span>Tarik CPL</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400">
                  Tempelkan Respon JSON dari Simpel-CPL
                </label>
                <textarea
                  rows={4}
                  value={pastedJsonCpl}
                  onChange={(e) => setPastedJsonCpl(e.target.value)}
                  placeholder='[{"id": "CPL1", "category": "Sikap", "desc": "..."}]'
                  className="w-full text-xs p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPastedJson}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan CPL ke Form RPS</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              CPL aktif di RPS saat ini: <strong>{(rpsData.cplList || []).length} CPL</strong>
            </span>
            <button
              type="button"
              onClick={handleLoadSampleSimpelCplData}
              className="text-xs text-amber-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Muat Contoh CPL Simpel-CPL</span>
            </button>
          </div>
        </div>

        {/* PANEL 2: Kirim RPS ke Simpel-CPL */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Download className="w-4 h-4" />
                </span>
                2. Tarik RPS dari Desain-RPSOBE ke Simpel-CPL
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                REST API
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Publikasikan dokumen RPS yang telah digenerate (memuat <strong>{rpsData.cpmkList.length} CPMK</strong>, <strong>{rpsData.subCpmkList.length} Sub-CPMK</strong>, dan <strong>{(rpsData.rubrics || []).length} Rubrik</strong>) agar dapat diambil langsung oleh <strong>simpel-cpl</strong>.
            </p>

            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={handlePublishRps}
                disabled={isPublishingRps}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isPublishingRps ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>Publikasikan RPS ke API Integrasi</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadRpsJson}
                className="px-3.5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                title="Unduh file JSON untuk di-import manual ke Simpel-CPL"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unduh JSON</span>
              </button>
            </div>

            {publishedPullUrl && (
              <div className="p-3 rounded-xl bg-slate-900 border border-blue-500/40 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
                  <span>URL Pull untuk Aplikasi Simpel-CPL:</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(publishedPullUrl);
                      setCopiedPullUrl(true);
                      showNotification("URL endpoint ditarik disalin ke clipboard!", "success");
                      setTimeout(() => setCopiedPullUrl(false), 2000);
                    }}
                    className="text-amber-300 hover:text-white flex items-center gap-1 text-[10.5px]"
                  >
                    {copiedPullUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPullUrl ? "Tersalin!" : "Salin URL"}</span>
                  </button>
                </div>
                <div className="font-mono text-[10px] text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800">
                  {publishedPullUrl}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <span>Mata Kuliah: <strong>{rpsData.namaMK || "Belum ditentukan"}</strong></span>
            <span>Prodi: <strong>{rpsData.namaProdi || "UNIVERSITAS PATTIMURA"}</strong></span>
          </div>
        </div>
      </div>

      {/* Deep-Link Generator Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Link className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">
                Tautan Langsung Satu Klik (Deep Linking Antar Aplikasi)
              </h3>
              <p className="text-xs text-slate-300">
                Pasang URL ini pada tombol <em>"Buat RPS di Desain-RPSOBE"</em> pada aplikasi <strong>simpel-cpl</strong>:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(directDeepLink);
              setCopiedDeepLink(true);
              showNotification("Tautan deep link berhasil disalin!", "success");
              setTimeout(() => setCopiedDeepLink(false), 2000);
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            {copiedDeepLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDeepLink ? "Tersalin!" : "Salin Tautan Tombol"}</span>
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 break-all select-all">
          {directDeepLink}
        </div>
      </div>

      {/* Tutorial & Step-by-Step Guide */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-300" />
              Langkah-Langkah Lengkap Mengintegrasikan Antar Aplikasi
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Pilih metode yang paling sesuai dengan kebutuhan arsitektur Anda di AI Studio:
            </p>
          </div>

          {/* Guide switcher */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveGuideTab("prodiAuth")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeGuideTab === "prodiAuth" ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-amber-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Master 117 Prodi &amp; Auth (MyApps)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveGuideTab("api")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeGuideTab === "api" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              1. REST API CPL/RPS
            </button>
            <button
              type="button"
              onClick={() => setActiveGuideTab("deeplink")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeGuideTab === "deeplink" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              2. URL Deep Linking
            </button>
            <button
              type="button"
              onClick={() => setActiveGuideTab("firestore")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeGuideTab === "firestore" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              3. Shared Firestore
            </button>
          </div>
        </div>

        {/* Tab 1: REST API */}
        {activeGuideTab === "api" && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
                <div className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs">1</span>
                  Simpel-CPL Menyediakan CPL
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  Di aplikasi <strong>simpel-cpl</strong>, sediakan endpoint API (misal <code>/api/cpl?prodi=...</code>) atau tombol kirim data via fetch POST.
                </p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
                <div className="font-black text-sm text-cyan-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-xs">2</span>
                  Desain-RPSOBE Memproses OBE
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  CPL tersebut diproses otomatis menjadi rumusan CPMK, Sub-CPMK, Matriks Bobot 100%, Silabus 16 Minggu, dan Rubrik 5 Kriteria.
                </p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-1.5">
                <div className="font-black text-sm text-emerald-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs">3</span>
                  Simpel-CPL Menarik RPS
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  Aplikasi <strong>simpel-cpl</strong> memanggil <code>GET /api/integration/get-rps?prodi=...</code> untuk menarik struktur RPS yang siap ditampilkan atau dicetak.
                </p>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  Kode Siap Pakai di Aplikasi Simpel-CPL (JavaScript / TypeScript):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(simpelCplSnippet);
                    setCopiedSnippet(true);
                    showNotification("Cuplikan kode disalin ke clipboard!", "success");
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? "Tersalin!" : "Salin Kode"}</span>
                </button>
              </div>
              <pre className="font-mono text-[10.5px] text-cyan-300 overflow-x-auto p-3 bg-slate-900/80 rounded-xl leading-relaxed">
                {simpelCplSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: URL Deep Linking */}
        {activeGuideTab === "deeplink" && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong>Metode URL Deep Linking</strong> adalah cara termudah dan tercepat karena <strong>tidak memerlukan backend database bersama</strong>. Aplikasi <em>simpel-cpl</em> cukup membuka tab baru dengan data CPL yang di-encode ke URL.
            </p>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="font-bold text-white text-sm">Langkah Praktis:</div>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>
                  Di aplikasi <strong>simpel-cpl</strong>, pada tabel atau halaman CPL Program Studi, tambahkan sebuah tombol:
                  <div className="my-1.5 p-2 bg-slate-950 font-mono text-amber-300 rounded text-[11px]">
                    &lt;button onClick=&#123;() =&gt; handleBukaDesainRps(prodi)&#125;&gt; Buat RPS di Desain-RPSOBE &lt;/button&gt;
                  </div>
                </li>
                <li>
                  Fungsi <code>handleBukaDesainRps</code> mengirim parameter kode prodi dan data CPL:
                  <div className="my-1.5 p-2 bg-slate-950 font-mono text-cyan-300 rounded text-[11px]">
                    window.open(`https://desain-rpsobe.ai.studio/?prodi=$&#123;prodi.kode&#125;&amp;source=simpel-cpl`, "_blank");
                  </div>
                </li>
                <li>
                  Aplikasi <strong>desain-rpsobe</strong> otomatis terbuka, mengunci portal prodi tersebut, mengkalibrasi jenjang &amp; semester, dan memuat rumusan CPL.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: Shared Firestore */}
        {activeGuideTab === "firestore" && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              <strong>Metode Shared Firestore</strong> cocok jika Anda menginginkan sinkronisasi data real-time permanen:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  Koleksi 1: prodi_cpl
                </div>
                <p className="text-[11.5px] text-slate-300">
                  Dikelola dan ditulis oleh aplikasi <strong>simpel-cpl</strong>. Berisi dokumen per Program Studi dengan daftar CPL resmi. Desain-RPSOBE hanya membaca (*read-only*) koleksi ini saat Dosen menyusun RPS.
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  Koleksi 2: rps_documents
                </div>
                <p className="text-[11.5px] text-slate-300">
                  Ditulis oleh aplikasi <strong>desain-rpsobe</strong> setelah RPS selesai di-generate. Aplikasi <strong>simpel-cpl</strong> membaca koleksi ini untuk menampilkan matriks ketercapaian CPL dan rubrik penilaian setiap mata kuliah.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Master 117 Prodi & Auth Gateway */}
        {activeGuideTab === "prodiAuth" && (
          <div className="space-y-5 text-xs text-slate-300 leading-relaxed animate-fadeIn">
            {/* Header Highlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border border-amber-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-black text-white">
                  Pola Akses &amp; Master 117 Program Studi Universal untuk Seluruh Aplikasi MyApps
                </h4>
              </div>
              <p className="text-[12px] text-slate-200">
                Aplikasi <strong>desain-rpsobe</strong> kini berfungsi sebagai <strong>Master Hub &amp; Gateway Autentikasi</strong>. Aplikasi Anda lainnya di MyApps (seperti <em>simpel-cpl</em>, <em>simpel-rps</em>, atau modul evaluasi CPL) dapat menggunakan <strong>basis data 117 prodi yang sama persis</strong> dan <strong>pola autentikasi berjenjang yang identik</strong>.
              </p>
            </div>

            {/* 3 Arsitektur Pilihan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/30 space-y-2">
                <div className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs">A</span>
                  REST API Terpusat (Direkomendasikan)
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  Aplikasi lain di MyApps memanggil endpoint <code>GET /api/prodi/list</code> dan <code>POST /api/prodi/verify-auth</code>.
                </p>
                <div className="text-[10.5px] text-emerald-400 font-semibold">
                  ✓ Tanpa duplikasi data<br />
                  ✓ Password &amp; 117 prodi selalu up to date otomatis
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="font-black text-sm text-cyan-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center text-xs">B</span>
                  Salin Modul Database (Offline)
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  Salin file <code>src/data/unpattiProdiDatabase.ts</code> atau <code>prodis_generated.json</code> langsung ke source code aplikasi Anda.
                </p>
                <div className="text-[10.5px] text-cyan-300 font-semibold">
                  ✓ Berjalan 100% offline &amp; cepat<br />
                  ✓ Tidak memerlukan koneksi HTTP antar aplikasi
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-2">
                <div className="font-black text-sm text-blue-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 flex items-center justify-center text-xs">C</span>
                  Single Sign-On / URL Parameter
                </div>
                <p className="text-slate-300 text-[11.5px]">
                  Kirim kode prodi via query parameter atau postMessage window: misal <code>simpel-cpl.ai.studio?kodeProdi=54207</code>.
                </p>
                <div className="text-[10.5px] text-blue-300 font-semibold">
                  ✓ User tidak perlu login ulang antar tab<br />
                  ✓ Sekali klik langsung masuk ke prodi terpilih
                </div>
              </div>
            </div>

            {/* Live Interactive Tester */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">
                    Live Testing Endpoint Autentikasi Universal: <code>POST /api/prodi/verify-auth</code>
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  CORS Enabled (Siap Dipanggil dari Aplikasi Manapun)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={testAuthPassword}
                  onChange={(e) => setTestAuthPassword(e.target.value)}
                  placeholder="Masukkan password atau kode prodi..."
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono flex-1 min-w-[200px] focus:outline-hidden focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleTestAuth()}
                  disabled={isTestingAuth}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTestingAuth ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>Uji Autentikasi</span>
                </button>
              </div>

              {/* Quick shortcut chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                <span>Klik untuk uji cepat:</span>
                <button
                  type="button"
                  onClick={() => handleTestAuth("1234")}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[10.5px] border border-slate-700 cursor-pointer"
                >
                  Password Direktori
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAuth("desain-rpsobes1")}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10.5px] border border-slate-700 cursor-pointer"
                >
                  desain-rpsobes1 (S1)
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAuth("desain-rpsobes2")}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[10.5px] border border-slate-700 cursor-pointer"
                >
                  desain-rpsobes2 (S2)
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAuth("54207")}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[10.5px] border border-slate-700 cursor-pointer"
                >
                  54207 (S1 Bioteknologi FST)
                </button>
              </div>

              {testAuthResult && (
                <div className={`p-3 rounded-xl border text-[11px] font-mono animate-fadeIn ${
                  testAuthResult.success
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : "bg-red-950/40 border-red-500/40 text-red-200"
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1.5">
                    {testAuthResult.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span>{testAuthResult.success ? "HTTP 200 OK — AUTENTIKASI DITERIMA" : "HTTP 401 — DITOLAK"}</span>
                  </div>
                  <pre className="text-[10px] overflow-x-auto text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                    {JSON.stringify(testAuthResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Code Snippet untuk Aplikasi Lain */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  Kode Siap Pakai di Aplikasi Lain (Contoh: simpel-cpl) — React / TypeScript:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const code = `// ========================================================
// INTEGRASI UNIVERSAL 117 PRODI & AUTH KE APLIKASI LAIN
// ========================================================

const DESAIN_RPS_URL = "https://desain-rpsobe.ai.studio"; // Atau URL applet Desain-RPSOBE Anda

// 1. Ambil 117 Program Studi UNPATTI Terpusat
export async function fetch117ProdiUNPATTI(filter = {}) {
  const query = new URLSearchParams(filter).toString();
  const res = await fetch(\`\${DESAIN_RPS_URL}/api/prodi/list?\${query}\`);
  const data = await res.json();
  return data.prodis; // Array 117 prodi lengkap kode, jenjang, fakultas
}

// 2. Verifikasi Password / Kode Prodi
export async function authenticateUser(password) {
  const res = await fetch(\`\${DESAIN_RPS_URL}/api/prodi/verify-auth\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: password.trim() }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Password atau Kode Prodi tidak valid");
  }
  return data; // { success: true, authType: "...", jenjang: "...", prodi: {...} }
}

// 3. Pola Akses yang Berlaku Sama di Seluruh Aplikasi:
// - "1234"                  -> Membuka Direktori 117 Program Studi
// - "desain-rpsobes1"       -> Akses Jenjang S1 (8 Semester)
// - "desain-rpsobes2"       -> Akses Jenjang S2 (4 Semester)
// - "desain-rpsobes3"       -> Akses Jenjang S3 (6 Semester)
// - "desain-rpsobess-pesialis" -> Akses Jenjang Spesialis (8 Sem)
// - "desain-rpsobe-profesi" -> Akses Jenjang Profesi (4 Sem)
// - Kode Prodi (e.g. 54207) -> Akses Langsung Program Studi`;
                    navigator.clipboard.writeText(code);
                    setCopiedProdiSnippet(true);
                    showNotification("Kode integrasi disalin ke clipboard!", "success");
                    setTimeout(() => setCopiedProdiSnippet(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedProdiSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedProdiSnippet ? "Tersalin!" : "Salin Kode Integrasi"}</span>
                </button>
              </div>

              <pre className="font-mono text-[10.5px] text-amber-300 overflow-x-auto p-3 bg-slate-900/80 rounded-xl leading-relaxed">
{`// 1. Ambil 117 Program Studi UNPATTI Terpusat
const res = await fetch("https://desain-rpsobe.ai.studio/api/prodi/list");
const { prodis } = await res.json();

// 2. Verifikasi Password / Kode Prodi Terpusat
const authRes = await fetch("https://desain-rpsobe.ai.studio/api/prodi/verify-auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: userInputPassword }),
});
const authData = await authRes.json();`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
