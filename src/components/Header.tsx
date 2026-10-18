import React, { useState } from "react";
import {
  BookOpen,
  Globe2,
  Sparkles,
  FileText,
  Download,
  Loader2,
  Upload,
  Printer,
  HardDriveUpload,
  User,
  RotateCcw,
  LogOut,
  LogIn,
  Building2,
  Share2,
  Link,
  Lock,
  ArrowLeftRight,
  ShieldCheck,
  GraduationCap,
  Award,
  Menu,
  X,
  Sliders,
  ChevronRight,
  ExternalLink,
  FileCheck,
  Layers,
  BarChart3,
  TrendingUp,
  BadgeCheck,
  Users,
} from "lucide-react";
import { UNPATTI_LOGO_DATA_URL } from "../data/unpattiLogo";
import { RpsData } from "../types/rps";
import { UserSession, UserRole } from "../types/auth";

interface HeaderProps {
  rpsData: RpsData;
  activeTab: "form" | "apihub" | "preview" | "kaprodi_gjm";
  setActiveTab: (tab: "form" | "apihub" | "preview" | "kaprodi_gjm") => void;
  onResetKemiskinan: () => void;
  onLoadPreset: (presetKey: "kemiskinan" | "pembangunan" | "sosiologi") => void;
  onOpenChat: () => void;
  isChatOpen: boolean;
  onDownloadPdf?: () => void;
  onExportDocx?: () => void;
  onUploadRps?: (file: File) => Promise<void>;
  onPrint?: () => void;
  onOpenGoogleDriveModal?: () => void;
  onOpenLoginModal?: () => void;
  onOpenProdiDirectory?: () => void;
  onOpenSimpelCpl?: () => void;
  onCopyProdiLink?: () => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
  isExportingPdf?: boolean;
  isExportingDocx?: boolean;
  isUploadingRps?: boolean;
  isPrinting?: boolean;
  onSelectKaprodiSubTab?: (
    subTab:
      | "matrix"
      | "approval"
      | "dosen_workload"
      | "cpl_alignment_audit"
      | "ami_audit"
      | "bloom_analysis"
      | "pasal59"
      | "export_berita_acara"
  ) => void;
}

export const Header: React.FC<HeaderProps> = ({
  rpsData,
  activeTab,
  setActiveTab,
  onResetKemiskinan,
  onLoadPreset,
  onOpenChat,
  isChatOpen,
  onDownloadPdf,
  onExportDocx,
  onUploadRps,
  onPrint,
  onOpenGoogleDriveModal,
  onOpenLoginModal,
  onOpenProdiDirectory,
  onOpenSimpelCpl,
  onCopyProdiLink,
  userSession,
  onLogout,
  isExportingPdf,
  isExportingDocx,
  isUploadingRps,
  isPrinting,
  onSelectKaprodiSubTab,
}) => {
  const [isMobileActionDrawerOpen, setIsMobileActionDrawerOpen] = useState(false);

  const role: UserRole = userSession?.role || "dosen";
  const isDosen = role === "dosen";
  const isKaprodi = role === "kaprodi";
  const isGjm = role === "gjm";

  const hasProdi = Boolean(rpsData?.namaProdi && rpsData.namaProdi.trim());
  const hasFakultas = Boolean(rpsData?.namaFakultas && rpsData.namaFakultas.trim());
  const cleanProdi = hasProdi
    ? rpsData.namaProdi.replace(/^PROGRAM\s+STUDI\s+(S1|S2|S3|D3|D4)?\s*/i, "").trim()
    : "";
  const cleanFakultas = hasFakultas
    ? rpsData.namaFakultas.replace(/^FAKULTAS\s+/i, "").trim()
    : "";
  const jenjangBadge = rpsData?.jenjang || "S1";

  // Label peran user
  const roleBadgeLabel = isKaprodi
    ? "Ketua Program Studi"
    : isGjm
    ? "Gugus Jaminan Mutu (GJM)"
    : "Dosen Pengampu MK";

  const roleBadgeColor = isKaprodi
    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
    : isGjm
    ? "bg-blue-400/20 text-blue-300 border-blue-400/40"
    : "bg-emerald-400/20 text-emerald-300 border-emerald-400/40";

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between z-30 flex-shrink-0 shadow-lg no-print">
        {/* BRANDING & IDENTITY */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-700 shadow-sm p-0.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src={UNPATTI_LOGO_DATA_URL}
              alt="Logo UNPATTI"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-xs sm:text-base font-black tracking-tight text-white truncate">
                RPS OBE Portal
              </span>
              <span
                className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider flex-shrink-0 ${roleBadgeColor}`}
              >
                {roleBadgeLabel}
              </span>
            </div>
            {hasProdi || hasFakultas ? (
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:block">
                {jenjangBadge} {cleanProdi} {cleanFakultas ? `• ${cleanFakultas}` : ""} &bull; {rpsData.namaKampus || "UNPATTI"}
              </p>
            ) : (
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:block">
                Kurikulum OBE &bull; {rpsData?.namaKampus || "UNIVERSITAS PATTIMURA"}
              </p>
            )}
          </div>
        </div>

        {/* NAVIGATION & ACTION ITEMS */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* ======================================================== */}
          {/* TABS KHUSUS BERDASARKAN PERAN (ROLE-BASED TABS)          */}
          {/* ======================================================== */}
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 hidden md:flex items-center gap-1 shadow-inner">
            {/* 1. JIKA LOGIN SEBAGAI DOSEN: Muncul Tugas Dosen Saja */}
            {isDosen && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "form"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title="Editor Formulir RPS Mata Kuliah (Khusus Dosen)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Editor RPS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title="Pratinjau Dokumen RPS Mata Kuliah"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Pratinjau</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("apihub")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "apihub"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title="Integrasi Simpel-CPL, Riset OpenAlex & Generator AI"
                >
                  <Globe2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Integrasi &amp; AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                </button>
              </>
            )}

            {/* 2. JIKA LOGIN SEBAGAI KAPRODI: Hanya Muncul Dashboard Kaprodi & Pratinjau Dokumen */}
            {isKaprodi && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("kaprodi_gjm")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "kaprodi_gjm"
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "text-amber-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title="Dashboard Kaprodi: Matriks Kurikulum Prodi, Validasi & Pengesahan RPS Semester"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Dashboard Kaprodi</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                    Prodi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title="Periksa Dokumen RPS Mata Kuliah yang Diajukan Dosen"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Pratinjau Berkas RPS</span>
                </button>
              </>
            )}

            {/* 3. JIKA LOGIN SEBAGAI GJM: Hanya Muncul Audit Mutu GJM & Pratinjau Dokumen */}
            {isGjm && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("kaprodi_gjm")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "kaprodi_gjm"
                      ? "bg-blue-600 text-white font-black shadow-sm"
                      : "text-blue-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title="Audit Mutu Internal (AMI) 8 Standar SN-Dikti & Berita Acara Akreditasi"
                >
                  <Award className="w-4 h-4" />
                  <span>Audit Mutu GJM</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-400/20 text-blue-200 border border-blue-400/40 font-bold">
                    AMI
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title="Periksa Dokumen RPS Mata Kuliah yang Sedang Diaudit"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Pratinjau Dokumen</span>
                </button>
              </>
            )}
          </div>

          {/* QUICK ACTIONS: DESKTOP & TABLET */}
          <div className="flex items-center space-x-1.5 border-l border-slate-700/80 pl-2">
            {/* 1. DOSEN ACTIONS */}
            {isDosen && (
              <>
                {onResetKemiskinan && (
                  <button
                    type="button"
                    onClick={onResetKemiskinan}
                    className="hidden lg:flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/40 shadow-xs cursor-pointer active:scale-95"
                    title="Reset formulir menjadi kosong bersih"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span className="hidden xl:inline">Reset</span>
                  </button>
                )}

                {onUploadRps && (
                  <label
                    className={`hidden lg:flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 border shadow-xs cursor-pointer active:scale-95 ${
                      isUploadingRps
                        ? "bg-slate-800 text-slate-400 border-slate-700 opacity-60 pointer-events-none"
                        : "bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 hover:text-white border-emerald-500/50"
                    }`}
                    title="Unggah berkas RPS (.docx / .json / .xlsx / .pdf)"
                  >
                    {isUploadingRps ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="hidden xl:inline">
                      {isUploadingRps ? "Memproses..." : "Unggah RPS"}
                    </span>
                    <input
                      type="file"
                      accept=".json,.docx,.xlsx,.xls,.pdf,.txt,.doc"
                      className="hidden"
                      disabled={isUploadingRps}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onUploadRps(file);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                )}

                {onExportDocx && (
                  <button
                    type="button"
                    onClick={onExportDocx}
                    disabled={isExportingDocx}
                    className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-500/40 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Ekspor dokumen RPS ke format Word (.docx)"
                  >
                    {isExportingDocx ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-300" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-300" />
                    )}
                    <span className="hidden md:inline">Ekspor Word</span>
                  </button>
                )}

                {onDownloadPdf && (
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    disabled={isExportingPdf}
                    className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-red-800/80 hover:bg-red-700 text-white border border-red-500/50 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Unduh dokumen RPS ke format PDF Legal"
                  >
                    {isExportingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-white" />
                    )}
                    <span className="hidden md:inline">Unduh PDF</span>
                  </button>
                )}

                {onOpenGoogleDriveModal && (
                  <button
                    type="button"
                    onClick={onOpenGoogleDriveModal}
                    className="hidden xl:flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-amber-700/80 hover:bg-amber-600 text-white border border-amber-500/50 shadow-xs cursor-pointer active:scale-95"
                    title="Ekspor ke folder Google Drive"
                  >
                    <HardDriveUpload className="w-3.5 h-3.5 text-amber-300" />
                    <span>G-Drive</span>
                  </button>
                )}

                {onPrint && (
                  <button
                    type="button"
                    onClick={onPrint}
                    disabled={isPrinting || isExportingPdf}
                    className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 items-center justify-center"
                    title="Cetak dokumen RPS"
                  >
                    {isPrinting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                    ) : (
                      <Printer className="w-4 h-4" />
                    )}
                  </button>
                )}

                {onCopyProdiLink && (hasProdi || userSession?.kodeProdi) && (
                  <button
                    type="button"
                    onClick={onCopyProdiLink}
                    className="hidden xl:flex p-1.5 rounded-lg text-xs font-bold transition items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 shadow-xs cursor-pointer active:scale-95"
                    title="Salin tautan langsung portal prodi ini (?prodi=...)"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                )}
              </>
            )}

            {/* 2. KAPRODI ACTIONS (KHUSUS KAPRODI - TIDAK ADA MENU DOSEN/GJM) */}
            {isKaprodi && (
              <>
                {onPrint && (
                  <button
                    type="button"
                    onClick={onPrint}
                    className="hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer active:scale-95"
                    title="Cetak Berita Acara & Dokumen Kurikulum Program Studi"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Berita Acara</span>
                  </button>
                )}

                {onDownloadPdf && (
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-xs cursor-pointer active:scale-95"
                    title="Unduh Dokumen Berkas Kurikulum"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden md:inline">Unduh PDF Berkas</span>
                  </button>
                )}

                {onCopyProdiLink && (hasProdi || userSession?.kodeProdi) && (
                  <button
                    type="button"
                    onClick={onCopyProdiLink}
                    className="hidden xl:flex p-1.5 rounded-lg text-xs font-bold transition items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 shadow-xs cursor-pointer active:scale-95"
                    title="Salin tautan portal prodi"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}
              </>
            )}

            {/* 3. GJM ACTIONS (KHUSUS GJM - TIDAK ADA MENU DOSEN/KAPRODI) */}
            {isGjm && (
              <>
                {onPrint && (
                  <button
                    type="button"
                    onClick={onPrint}
                    className="hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer active:scale-95"
                    title="Cetak Berita Acara Hasil Audit Mutu AMI"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Berita Acara AMI</span>
                  </button>
                )}

                {onDownloadPdf && (
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-bold transition items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-xs cursor-pointer active:scale-95"
                    title="Unduh Laporan Audit Mutu Internal"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                    <span className="hidden md:inline">Unduh Laporan PDF</span>
                  </button>
                )}

                {onCopyProdiLink && (hasProdi || userSession?.kodeProdi) && (
                  <button
                    type="button"
                    onClick={onCopyProdiLink}
                    className="hidden xl:flex p-1.5 rounded-lg text-xs font-bold transition items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 shadow-xs cursor-pointer active:scale-95"
                    title="Salin tautan portal prodi"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* USER SESSION & LOGOUT BUTTON */}
          {userSession?.isLoggedIn ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700/80">
              <div className="hidden sm:flex flex-col text-right leading-none pr-1">
                <span className="text-[9.5px] font-black uppercase text-amber-300">
                  {roleBadgeLabel}
                </span>
                <span className="text-[11px] font-bold text-white truncate max-w-[120px]">
                  {userSession.nama}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-500/60 shadow-xs cursor-pointer active:scale-95"
                title="Keluar dari sesi aplikasi"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            onOpenLoginModal && (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )
          )}

          {/* MOBILE MENU TOGGLE BUTTON (IPHONE / ANDROID / TABLET) */}
          <button
            type="button"
            onClick={() => setIsMobileActionDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer active:scale-95 flex items-center gap-1.5"
            title="Buka menu lengkap dan aksi untuk ponsel/tablet"
          >
            <Menu className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold hidden xs:inline">Menu</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (IPHONE & ANDROID)          */}
      {/* ======================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl no-print">
        {/* 1. DOSEN: Muncul Hanya Tugas Dosen */}
        {isDosen && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                activeTab === "form" ? "text-emerald-400 font-bold bg-emerald-950/40" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-[10px]">Editor RPS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                activeTab === "preview" ? "text-blue-400 font-bold bg-blue-950/40" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[10px]">Pratinjau</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("apihub")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                activeTab === "apihub" ? "text-cyan-400 font-bold bg-cyan-950/40" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe2 className="w-4 h-4" />
              <span className="text-[10px]">Integrasi &amp; AI</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileActionDrawerOpen(true)}
              className="flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl text-amber-300 hover:text-white transition"
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[10px] font-bold">Aksi Dosen</span>
            </button>
          </>
        )}

        {/* 2. KAPRODI: Muncul Hanya Tugas Kaprodi */}
        {isKaprodi && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("kaprodi_gjm")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                activeTab === "kaprodi_gjm" ? "text-amber-400 font-bold bg-amber-950/40" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                activeTab === "preview" ? "text-blue-400 font-bold bg-blue-950/40" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[10px]">Pratinjau RPS</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileActionDrawerOpen(true)}
              className="flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl text-amber-300 hover:text-white transition"
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[10px] font-bold">Aksi Kaprodi</span>
            </button>
          </>
        )}

        {/* 3. GJM: Muncul Hanya Tugas GJM */}
        {isGjm && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("kaprodi_gjm")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                activeTab === "kaprodi_gjm" ? "text-blue-400 font-bold bg-blue-950/40" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4" />
              <span className="text-[10px]">Audit AMI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
                activeTab === "preview" ? "text-blue-400 font-bold bg-blue-950/40" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[10px]">Pratinjau RPS</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMobileActionDrawerOpen(true)}
              className="flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 rounded-xl text-blue-300 hover:text-white transition"
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[10px] font-bold">Aksi GJM</span>
            </button>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* MOBILE & TABLET ACTION DRAWER MODAL                      */}
      {/* ======================================================== */}
      {isMobileActionDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fadeIn p-0 sm:p-4 no-print">
          <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header Drawer */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  isKaprodi ? "bg-amber-500/20 text-amber-300" : isGjm ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"
                }`}>
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Menu &amp; Fitur Khusus</h3>
                  <p className="text-[11px] text-slate-400">
                    Peran Aktif: <strong className={isKaprodi ? "text-amber-300" : isGjm ? "text-blue-300" : "text-emerald-300"}>{roleBadgeLabel}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileActionDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Isi Drawer */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Profile Card */}
              {userSession && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadgeColor}`}>
                      {roleBadgeLabel}
                    </span>
                    <div className="text-xs font-bold text-white mt-1">{userSession.nama}</div>
                    <div className="text-[10.5px] text-slate-400">
                      {userSession.jenjang} {userSession.namaProdi}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileActionDrawerOpen(false);
                      onLogout?.();
                    }}
                    className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}

              {/* 1. FITUR KHUSUS DOSEN PADA MOBILE/TABLET */}
              {isDosen && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    Alat &amp; Dokumen RPS Dosen:
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {onUploadRps && (
                      <label className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition">
                        <Upload className="w-5 h-5 mb-1 text-emerald-400" />
                        <span className="text-xs font-bold">Unggah RPS</span>
                        <span className="text-[9.5px] text-slate-400">Word/JSON/PDF</span>
                        <input
                          type="file"
                          accept=".json,.docx,.xlsx,.xls,.pdf,.txt,.doc"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onUploadRps(file);
                              setIsMobileActionDrawerOpen(false);
                            }
                          }}
                        />
                      </label>
                    )}

                    {onExportDocx && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onExportDocx();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-blue-500/40 text-blue-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <FileText className="w-5 h-5 mb-1 text-blue-400" />
                        <span className="text-xs font-bold">Ekspor Word</span>
                        <span className="text-[9.5px] text-slate-400">Format .docx</span>
                      </button>
                    )}

                    {onDownloadPdf && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onDownloadPdf();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-red-500/40 text-red-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <Download className="w-5 h-5 mb-1 text-red-400" />
                        <span className="text-xs font-bold">Unduh PDF</span>
                        <span className="text-[9.5px] text-slate-400">Legal Portrait</span>
                      </button>
                    )}

                    {onOpenGoogleDriveModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onOpenGoogleDriveModal();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-amber-500/40 text-amber-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <HardDriveUpload className="w-5 h-5 mb-1 text-amber-400" />
                        <span className="text-xs font-bold">Google Drive</span>
                        <span className="text-[9.5px] text-slate-400">Simpan Online</span>
                      </button>
                    )}

                    {onPrint && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onPrint();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <Printer className="w-5 h-5 mb-1 text-slate-300" />
                        <span className="text-xs font-bold">Cetak RPS</span>
                        <span className="text-[9.5px] text-slate-400">Kertas Legal</span>
                      </button>
                    )}

                    {onResetKemiskinan && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onResetKemiskinan();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-rose-500/40 text-rose-300 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <RotateCcw className="w-5 h-5 mb-1 text-rose-400" />
                        <span className="text-xs font-bold">Reset Form</span>
                        <span className="text-[9.5px] text-slate-400">Kosongkan data</span>
                      </button>
                    )}
                  </div>

                  {onCopyProdiLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileActionDrawerOpen(false);
                        onCopyProdiLink();
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition cursor-pointer mt-2"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-emerald-400" />
                        <span>Salin Tautan Portal Prodi Ini</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>
              )}

              {/* 2. FITUR KHUSUS KAPRODI PADA MOBILE/TABLET (TIDAK ADA FITUR DOSEN/GJM) */}
              {isKaprodi && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase text-amber-300 tracking-wider">
                    Wewenang &amp; Pengesahan Kaprodi:
                  </div>

                  {/* Dokumen & Cetak */}
                  <div className="grid grid-cols-2 gap-2">
                    {onPrint && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onPrint();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <Printer className="w-5 h-5 mb-1 text-emerald-400" />
                        <span className="text-xs font-bold">Cetak Berita Acara</span>
                        <span className="text-[9.5px] text-slate-400">Format Akreditasi</span>
                      </button>
                    )}

                    {onDownloadPdf && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onDownloadPdf();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-amber-500/40 text-amber-300 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <Download className="w-5 h-5 mb-1 text-amber-400" />
                        <span className="text-xs font-bold">Unduh PDF</span>
                        <span className="text-[9.5px] text-slate-400">Dokumen Berkas</span>
                      </button>
                    )}
                  </div>

                  {/* Navigasi Cepat 5 Modul Kaprodi */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400">Navigasi Modul Kaprodi:</div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("matrix");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>1. Matriks Kurikulum (CPL vs MK)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("approval");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>2. Validasi &amp; Pengesahan RPS Semester</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("dosen_workload");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>3. Beban Kerja Dosen (BKD per Semester)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("cpl_alignment_audit");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:bg-slate-700 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>4. Audit Keselarasan CPL (AI)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("bloom_analysis");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span>5. Keseimbangan Taksonomi Bloom</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("pasal59");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                        <span>4. Kepatuhan Pasal 47 (Case/PjBL &ge; 50%)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("export_berita_acara");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>5. Pengesahan Berita Acara</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  {onCopyProdiLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileActionDrawerOpen(false);
                        onCopyProdiLink();
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition cursor-pointer mt-2"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-amber-400" />
                        <span>Salin Tautan Portal Prodi Ini</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>
              )}

              {/* 3. FITUR KHUSUS GJM PADA MOBILE/TABLET (TIDAK ADA FITUR DOSEN/KAPRODI) */}
              {isGjm && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase text-blue-300 tracking-wider">
                    Instrumen Audit &amp; Penjaminan Mutu GJM:
                  </div>

                  {/* Dokumen & Cetak */}
                  <div className="grid grid-cols-2 gap-2">
                    {onPrint && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onPrint();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-blue-500/40 text-blue-300 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <Printer className="w-5 h-5 mb-1 text-blue-400" />
                        <span className="text-xs font-bold">Cetak Berita Acara</span>
                        <span className="text-[9.5px] text-slate-400">Audit Mutu AMI</span>
                      </button>
                    )}

                    {onDownloadPdf && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileActionDrawerOpen(false);
                          onDownloadPdf();
                        }}
                        className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition"
                      >
                        <Download className="w-5 h-5 mb-1 text-slate-300" />
                        <span className="text-xs font-bold">Unduh PDF</span>
                        <span className="text-[9.5px] text-slate-400">Laporan Mutu</span>
                      </button>
                    )}
                  </div>

                  {/* Navigasi Cepat 5 Modul GJM */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400">Navigasi Modul Audit GJM:</div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("ami_audit");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-400" />
                        <span>1. Audit Mutu Internal (AMI) 8 Standar SN-Dikti</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("pasal59");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                        <span>2. Kepatuhan Pasal 47 (Case/PjBL &gt;= 50%)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("bloom_analysis");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span>3. Evaluasi Kematangan HOTS Bloom (C4-C6)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("export_berita_acara");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>4. Berita Acara Review Mutu GJM</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("kaprodi_gjm");
                        onSelectKaprodiSubTab?.("matrix");
                        setIsMobileActionDrawerOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <span>5. Matriks Kurikulum (Monitoring Mutu)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  {onCopyProdiLink && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileActionDrawerOpen(false);
                        onCopyProdiLink();
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-between transition cursor-pointer mt-2"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-400" />
                        <span>Salin Tautan Portal Prodi Ini</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
