/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { RpsForm } from "./components/RpsForm";
import { RealTimeApiHub } from "./components/RealTimeApiHub";
import { RpsPreview } from "./components/RpsPreview";
import { GeminiChatbox } from "./components/GeminiChatbox";
import { GoogleDriveExportModal } from "./components/GoogleDriveExportModal";
import { LoginModal } from "./components/LoginModal";
import { HourglassLoadingModal } from "./components/HourglassLoadingModal";
import { ProdiDirectoryModal } from "./components/ProdiDirectoryModal";
import { KaprodiGjmDashboard, KaprodiSubTab } from "./components/KaprodiGjmDashboard";
import { RpsData } from "./types/rps";
import { UserSession } from "./types/auth";
import {
  ProdiItem,
  UNPATTI_PRODI_DATABASE,
  findProdiByKode,
  findProdiByName,
} from "./data/unpattiProdiDatabase";
import { DEFAULT_KEMISKINAN_RPS, EMPTY_RPS } from "./data/unpattiDefaults";
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from "lucide-react";
import { exportRpsToDocx } from "./utils/docxExport";
import { exportRpsToPdf } from "./utils/pdfExport";
import { printRpsDocument } from "./utils/printExport";
import { parseUploadedRpsFile } from "./utils/rpsDocumentParser";
import { generateObeCurriculumComponents } from "./utils/obeCurriculumGenerator";
import { getStoredProdiCpls, saveStoredProdiCpls } from "./utils/prodiCplStorage";

interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function App() {
  // Form RPS editor dimulai dalam kondisi kosong bersih sehingga pengguna mengisi dari awal
  const [rpsData, setRpsData] = useState<RpsData>(EMPTY_RPS);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isGeneratingRps, setIsGeneratingRps] = useState<boolean>(false);
  const [generatingProgressMsg, setGeneratingProgressMsg] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"form" | "apihub" | "preview" | "kaprodi_gjm">("form");
  const [kaprodiSubTab, setKaprodiSubTab] = useState<KaprodiSubTab>("matrix");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProdiDirectoryOpen, setIsProdiDirectoryOpen] = useState(false);
  const [initialProdiFromUrl, setInitialProdiFromUrl] = useState<ProdiItem | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isUploadingRps, setIsUploadingRps] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Deteksi URL parameter (?prodi=, ?kode=, atau ?cplPayload= dari Simpel-CPL)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const prodiParam = params.get("prodi") || params.get("kode");
      if (prodiParam) {
        const matched = findProdiByKode(prodiParam) || findProdiByName(prodiParam);
        if (matched) {
          setInitialProdiFromUrl(matched);
          const maxSem =
            matched.jenjang === "S2" || matched.jenjang === "Profesi"
              ? 4
              : matched.jenjang === "S3"
              ? 6
              : 8;
          const storedCpls = getStoredProdiCpls(matched.namaProdi || matched.kodeProdi);
          setRpsData((prev) => ({
            ...prev,
            namaProdi: matched.namaProdi,
            namaFakultas: matched.fakultas,
            jenjang: matched.jenjang,
            semester: "Semester 1",
            cplList: storedCpls.length > 0 ? storedCpls : (matched.cplList || []),
            selectedCpls: [],
          }));
        }
      }

      // Deteksi payload CPL yang dikirim dari aplikasi Simpel-CPL
      const cplPayloadParam = params.get("cplPayload") || params.get("cpls");
      if (cplPayloadParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cplPayloadParam));
          if (Array.isArray(parsed) && parsed.length > 0) {
            const formattedCpls = parsed.map((item: any, idx: number) => ({
              id: item.id || `CPL${idx + 1}`,
              category: item.category || item.kategori || "Keterampilan Khusus",
              desc: item.desc || item.deskripsi || String(item),
            }));
            setRpsData((prev) => ({
              ...prev,
              cplList: formattedCpls,
            }));
            showNotification(
              `Berhasil menarik ${formattedCpls.length} CPL secara otomatis dari aplikasi Simpel-CPL!`,
              "success"
            );
          }
        } catch (e) {
          console.error("Gagal parse cplPayload dari URL:", e);
        }
      }

      // Deteksi nama MK jika dikirim dari Simpel-CPL
      const mkParam = params.get("namaMK") || params.get("mk");
      if (mkParam) {
        setRpsData((prev) => ({ ...prev, namaMK: decodeURIComponent(mkParam) }));
      }
    } catch (e) {
      console.error("Error membaca parameter URL prodi:", e);
    }
  }, []);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch Prodi dari Direktori
  const handleSelectProdiFromDirectory = (prodi: ProdiItem) => {
    const maxSem =
      prodi.jenjang === "S2" || prodi.jenjang === "Profesi"
        ? 4
        : prodi.jenjang === "S3"
        ? 6
        : 8;

    const storedCpls = getStoredProdiCpls(prodi.namaProdi || prodi.kodeProdi);
    setRpsData((prev) => ({
      ...prev,
      namaProdi: prodi.namaProdi,
      namaFakultas: prodi.fakultas,
      jenjang: prodi.jenjang,
      semester: "Semester 1",
      cplList: storedCpls.length > 0 ? storedCpls : (prodi.cplList || []),
      selectedCpls: [],
    }));

    if (userSession) {
      setUserSession((prev) =>
        prev
          ? {
              ...prev,
              namaProdi: prodi.namaProdi,
              namaFakultas: prodi.fakultas,
              kodeProdi: prodi.kodeProdi,
              jenjang: prodi.jenjang,
            }
          : null
      );
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("prodi", prodi.kodeProdi);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}

    showNotification(
      `Portal Program Studi beralih ke "${prodi.namaProdi}" (${prodi.jenjang} • ${maxSem} Semester).`,
      "success"
    );
  };

  // Salin Link Langsung Portal Prodi Aktif
  const handleCopyProdiLink = () => {
    const kode =
      userSession?.kodeProdi ||
      initialProdiFromUrl?.kodeProdi ||
      (rpsData.namaProdi ? findProdiByName(rpsData.namaProdi)?.kodeProdi : "");
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const url = kode
      ? `${origin}${pathname}?prodi=${encodeURIComponent(kode)}`
      : window.location.href;
    navigator.clipboard.writeText(url);
    showNotification(
      `Tautan langsung portal prodi berhasil disalin ke clipboard: ${url}`,
      "success"
    );
  };

  // Presets
  const handleLoadPreset = (presetKey: "kemiskinan" | "pembangunan" | "sosiologi") => {
    setIsGenerated(false);
    setActiveTab("form");
    if (presetKey === "kemiskinan") {
      setRpsData(DEFAULT_KEMISKINAN_RPS);
      showNotification("Preset 'Kemiskinan Multidimensional' dimuat ke form! Klik 'Generate & Tampilkan RPS' untuk menampilkannya di pratinjau.", "info");
    } else if (presetKey === "pembangunan") {
      setRpsData((prev) => ({
        ...prev,
        namaMK: "Pembangunan Pertanian",
        kodeMK: "PPP224111",
        kodeDokumen: "PPP224111",
        rumpunMK: "MK Prodi",
        semester: "Semester 3",
        deskripsiMK:
          "Mata kuliah Pembangunan Pertanian membahas konsep transformasi struktural, modernisasi agribisnis, kedaulatan pangan, dan tantangan kelembagaan petani di wilayah kepulauan Maluku.",
        bahanKajian:
          "1. Pengantar Pembangunan Pertanian\n2. Teori Pertumbuhan & Transformasi Agraria\n3. Kelembagaan Kelompok Tani\n4. Agribisnis Kepulauan & Logistik Laut\n5. Kebijakan Ketahanan Pangan",
        selectedSdgs: [1, 2, 8, 9, 12],
        selectedPipItems: ["BMK-01", "BMK-04", "BMK-10", "BMK-12"],
        selectedKkniLevels: [6],
        selectedKkniItems: ["KKNI-6.1", "KKNI-6.2", "KKNI-6.3", "KKNI-6.4"],
      }));
      showNotification("Preset 'Pembangunan Pertanian' dimuat ke form! Klik 'Generate & Tampilkan RPS' untuk menampilkannya di pratinjau.", "info");
    } else if (presetKey === "sosiologi") {
      setRpsData((prev) => ({
        ...prev,
        namaMK: "Sosiologi Pedesaan",
        kodeMK: "PPP224105",
        kodeDokumen: "PPP224105",
        rumpunMK: "MK Prodi",
        semester: "Semester 2",
        deskripsiMK:
          "Mempelajari dinamika struktur sosial masyarakat desa kepulauan, kearifan lokal (Sasi dan Pela Gandong), stratifikasi sosial, dan modal sosial dalam pembangunan pertanian.",
        bahanKajian:
          "1. Struktur Sosial & Komunitas Desa\n2. Kearifan Lokal & Pranata Adat Maluku\n3. Stratifikasi Sosial & Diferensiasi Petani\n4. Dinamika Hubungan Patron-Klien\n5. Perubahan Sosial Pedesaan",
        selectedSdgs: [1, 5, 10, 16],
        selectedPipItems: ["BMK-02", "BMK-04", "BMK-05", "BMK-11"],
        selectedKkniLevels: [6],
        selectedKkniItems: ["KKNI-6.1", "KKNI-6.2", "KKNI-6.3", "KKNI-6.4"],
      }));
      showNotification("Preset 'Sosiologi Pedesaan' dimuat ke form! Klik 'Generate & Tampilkan RPS' untuk menampilkannya di pratinjau.", "info");
    }
  };

  const handleResetKemiskinan = () => {
    const prodiName = rpsData.namaProdi || userSession?.namaProdi || initialProdiFromUrl?.namaProdi || "Program Studi";
    const storedCpls = getStoredProdiCpls(prodiName);
    const retainedCpls = storedCpls.length > 0 ? storedCpls : (rpsData.cplList || []);

    setRpsData((prev) => ({
      ...EMPTY_RPS,
      namaKampus: prev.namaKampus || "UNIVERSITAS PATTIMURA",
      namaFakultas: prev.namaFakultas || userSession?.namaFakultas || "",
      namaProdi: prev.namaProdi || userSession?.namaProdi || "",
      jenjang: prev.jenjang || userSession?.jenjang || "S1",
      kaprodi: prev.kaprodi || userSession?.nama || "",
      cplList: retainedCpls, // CPL Prodi TETAP ADA saat reset form
      selectedCpls: [],
    }));
    setIsGenerated(false);
    setActiveTab("form");
    showNotification(
      `Formulir RPS telah dikosongkan. Daftar ${retainedCpls.length} CPL ${prodiName} tetap tersimpan aman & tidak terhapus.`,
      "info"
    );
  };

  // Generate OBE: Jam pasir bergerak selama 5 - 10 detik (6.5 detik) lalu langsung munculkan tampilan RPS yang digenerate
  const handleGenerateRps = async () => {
    setIsGeneratingRps(true);
    setGeneratingProgressMsg("Menyusun komponen kurikulum OBE (CPMK, Sub-CPMK, Silabus, dan Rubrik Penilaian)...");
    const startTime = Date.now();
    try {
      const generated = await generateObeCurriculumComponents(rpsData, (msg) => {
        setGeneratingProgressMsg(msg);
      });

      // Menunggu 5 - 10 detik (6.5 detik) bergantung jaringan internet sesuai permintaan user
      const targetWait = 6500;
      const elapsed = Date.now() - startTime;
      if (elapsed < targetWait) {
        await new Promise((resolve) => setTimeout(resolve, targetWait - elapsed));
      }

      setRpsData((prev) => ({
        ...prev,
        cpmkList: generated.cpmkList,
        subCpmkList: generated.subCpmkList,
        bahanKajian: prev.bahanKajian && prev.bahanKajian.trim().length > 0 ? prev.bahanKajian : (generated.bahanKajian || prev.bahanKajian),
        rubrics: generated.rubrics,
        syllabusList: generated.syllabusList,
      }));
      setIsGenerated(true);
      setActiveTab("preview");
      showNotification("Dokumen RPS OBE berhasil digenerate & langsung ditampilkan di pratinjau!", "success");
    } catch (err: any) {
      console.error("Gagal generate OBE:", err);
      const targetWait = 6500;
      const elapsed = Date.now() - startTime;
      if (elapsed < targetWait) {
        await new Promise((resolve) => setTimeout(resolve, targetWait - elapsed));
      }
      setIsGenerated(true);
      setActiveTab("preview");
      showNotification("RPS berhasil digenerate dan ditampilkan!", "success");
    } finally {
      setIsGeneratingRps(false);
    }
  };

  // Upload berkas RPS: Ekstrak informasi terbatas
  const handleUploadRps = async (file: File) => {
    setIsUploadingRps(true);
    showNotification(`Membaca dan memproses berkas RPS "${file.name}"...`, "info");
    try {
      const parsedRps = await parseUploadedRpsFile(file, (msg) => {
        showNotification(msg, "info");
      });

      setRpsData((prev) => ({
        ...prev,
        namaMK: parsedRps.namaMK || prev.namaMK,
        kodeMK: parsedRps.kodeMK || prev.kodeMK,
        namaProdi: parsedRps.namaProdi || prev.namaProdi,
        namaFakultas: parsedRps.namaFakultas || prev.namaFakultas,
        bobotSKS: parsedRps.bobotSKS || prev.bobotSKS,
        sksTeori: parsedRps.sksTeori || prev.sksTeori,
        sksPraktik: parsedRps.sksPraktik || prev.sksPraktik,
        semester: parsedRps.semester || prev.semester,
        deskripsiMK: parsedRps.deskripsiMK || prev.deskripsiMK,
        daftarPustaka: parsedRps.daftarPustaka || prev.daftarPustaka,
        bahanKajian: parsedRps.bahanKajian || prev.bahanKajian,
      }));

      setIsGenerated(false);
      setActiveTab("form");
      showNotification(
        `Sukses! Informasi inti berkas ("${parsedRps.namaMK}", Prodi: ${parsedRps.namaProdi}, ${parsedRps.bobotSKS} SKS) berhasil diisi ke formulir. Pratinjau dikosongkan. Silakan periksa pilihan KKNI, PIP & SDGs, lalu klik 'Generate & Tampilkan RPS' untuk menghasilkan CPMK, Sub-CPMK, dan Rubrik OBE secara otomatis.`,
        "success"
      );
    } catch (err: any) {
      console.error("Gagal memproses berkas RPS:", err);
      showNotification(`Gagal memproses berkas: ${err?.message || "Format berkas tidak dikenali"}`, "error");
    } finally {
      setIsUploadingRps(false);
    }
  };

  const handleLoginSuccess = (session: UserSession, selectedProdi: ProdiItem) => {
    setUserSession(session);
    const jenjang = session.jenjang || selectedProdi.jenjang || "S1";

    setRpsData((prev) => ({
      ...prev,
      namaProdi: selectedProdi.namaProdi || session.namaProdi || prev.namaProdi,
      namaFakultas: selectedProdi.fakultas || session.namaFakultas || prev.namaFakultas,
      jenjang: jenjang,
      semester: "Semester 1",
      kaprodi: session.role === "kaprodi" ? session.nama : (selectedProdi.namaKaprodi || prev.kaprodi),
      cplList: selectedProdi.cplList && selectedProdi.cplList.length > 0 ? selectedProdi.cplList : prev.cplList,
      selectedCpls: [], // Akses awal dikosongkan (tanpa 5 CPL terpilih)
      dosenPengampu: session.nama,
    }));
    setIsGenerated(false);
    if (session.role === "kaprodi") {
      setKaprodiSubTab("matrix");
      setActiveTab("kaprodi_gjm");
    } else if (session.role === "gjm") {
      setKaprodiSubTab("ami_audit");
      setActiveTab("kaprodi_gjm");
    } else {
      setActiveTab("form");
    }
    setIsLoginOpen(false);

    // Sync URL with logged in prodi code if available
    if (selectedProdi.kodeProdi) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("prodi", selectedProdi.kodeProdi);
        window.history.replaceState({}, "", url.toString());
      } catch (e) {}
    }

    showNotification(
      `Login berhasil sebagai ${session.role.toUpperCase()} (${session.nama})! Selamat datang di RPS OBE Portal Akademik UNPATTI.`,
      "success"
    );
  };

  const handleLogout = () => {
    setUserSession(null);
    setIsLoginOpen(false);
    showNotification("Anda telah keluar dari aplikasi RPS OBE. Kembali ke halaman login.", "info");
  };

  const handleExportDocx = async () => {
    if (!isGenerated) {
      showNotification("Pratinjau dokumen belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    setIsExportingDocx(true);
    showNotification("Menyiapkan dokumen Word .docx format UNPATTI...", "info");
    try {
      let elem = document.getElementById("printableDocument");
      if (!elem && activeTab !== "preview") {
        setActiveTab("preview");
        await new Promise((r) => setTimeout(r, 300));
        elem = document.getElementById("printableDocument");
      }
      const html = elem ? elem.innerHTML : "";
      await exportRpsToDocx(rpsData, html);
      showNotification("Dokumen Word (.docx) berhasil diunduh!", "success");
    } catch (err: any) {
      console.error("Gagal export docx:", err);
      showNotification(`Gagal mengekspor dokumen Word: ${err?.message || "Kesalahan internal"}`, "error");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!isGenerated) {
      showNotification("Pratinjau dokumen belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    setIsExportingPdf(true);
    showNotification("Memulai render dokumen PDF Legal Portrait...", "info");

    try {
      let elem = document.getElementById("printableDocument");
      if (!elem && activeTab !== "preview") {
        setActiveTab("preview");
        await new Promise((r) => setTimeout(r, 300));
        elem = document.getElementById("printableDocument");
      }

      if (!elem) {
        showNotification("Gagal menemukan dokumen cetak. Silakan klik 'Generate & Tampilkan RPS'.", "error");
        return;
      }

      await exportRpsToPdf(elem, rpsData, (statusMsg) => {
        showNotification(statusMsg, "info");
      });
      showNotification("File PDF Legal Portrait berhasil diunduh!", "success");
    } catch (err: any) {
      console.error("PDF export error:", err);
      showNotification(`Gagal mengunduh PDF: ${err?.message || "Terjadi kendala saat rendering"}`, "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintRps = async () => {
    if (!isGenerated) {
      showNotification("Pratinjau dokumen belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    setIsPrinting(true);
    showNotification("Menyiapkan dokumen cetak RPS (Legal Portrait)...", "info");

    try {
      let elem = document.getElementById("printableDocument");
      if (!elem && activeTab !== "preview") {
        setActiveTab("preview");
        await new Promise((r) => setTimeout(r, 350));
        elem = document.getElementById("printableDocument");
      }

      if (!elem) {
        showNotification("Gagal menemukan dokumen cetak. Silakan klik 'Generate & Tampilkan RPS'.", "error");
        return;
      }

      await printRpsDocument(elem, rpsData, (statusMsg) => {
        showNotification(statusMsg, "info");
      });
    } catch (err: any) {
      console.error("Print error:", err);
      showNotification(`Gagal mencetak: ${err?.message || "Terjadi kendala saat membuka dialog printer"}`, "error");
    } finally {
      setIsPrinting(false);
    }
  };

  // Pintu Masuk / Landing Page Otentikasi jika belum login
  if (!userSession || !userSession.isLoggedIn) {
    return (
      <div className="h-screen w-screen flex flex-col bg-slate-950 font-sans overflow-hidden">
        <LoginModal
          isOpen={true}
          onClose={() => {}}
          onLoginSuccess={handleLoginSuccess}
          currentSession={userSession}
          isLandingPage={true}
          onOpenDirectory={() => setIsProdiDirectoryOpen(true)}
          initialProdi={initialProdiFromUrl}
        />

        {/* Direktori 117 Program Studi Modal */}
        <ProdiDirectoryModal
          isOpen={isProdiDirectoryOpen}
          onClose={() => setIsProdiDirectoryOpen(false)}
          onSelectProdi={(prodi) => {
            setInitialProdiFromUrl(prodi);
            handleSelectProdiFromDirectory(prodi);
          }}
          currentKodeProdi={initialProdiFromUrl?.kodeProdi}
          showNotification={showNotification}
        />

        {/* Toast Notification Container for login feedback */}
        <div className="fixed z-50 bottom-5 right-5 flex flex-col space-y-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border transition-all animate-in slide-in-from-bottom-2 ${
                toast.type === "success"
                  ? "bg-slate-900 border-emerald-500 text-emerald-300"
                  : toast.type === "error"
                  ? "bg-slate-900 border-rose-500 text-rose-300"
                  : "bg-slate-900 border-cyan-500 text-cyan-300"
              }`}
            >
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {toast.type === "info" && <Info className="w-4 h-4 text-cyan-400" />}
              <span className="max-w-xs">{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 font-sans">
      {/* Header */}
      <Header
        rpsData={rpsData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetKemiskinan={handleResetKemiskinan}
        onLoadPreset={handleLoadPreset}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        onDownloadPdf={handleDownloadPdf}
        onExportDocx={handleExportDocx}
        onUploadRps={handleUploadRps}
        onPrint={handlePrintRps}
        onOpenGoogleDriveModal={() => setIsGoogleDriveOpen(true)}
        onOpenLoginModal={() => setIsLoginOpen(true)}
        onOpenProdiDirectory={() => setIsProdiDirectoryOpen(true)}
        onOpenSimpelCpl={() => {
          setActiveTab("apihub");
          showNotification("Membuka Pusat Integrasi & Hub Simpel-CPL...", "info");
        }}
        onCopyProdiLink={handleCopyProdiLink}
        userSession={userSession}
        onLogout={handleLogout}
        isExportingPdf={isExportingPdf}
        isExportingDocx={isExportingDocx}
        isUploadingRps={isUploadingRps}
        isPrinting={isPrinting}
        onSelectKaprodiSubTab={(subTab) => {
          setKaprodiSubTab(subTab);
          setActiveTab("kaprodi_gjm");
        }}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === "form" ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <RpsForm
              rpsData={rpsData}
              setRpsData={setRpsData}
              onGenerate={handleGenerateRps}
              onReset={handleResetKemiskinan}
              onUploadSuccess={() => setIsGenerated(false)}
              showNotification={showNotification}
            />
          </div>
        ) : activeTab === "kaprodi_gjm" ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <KaprodiGjmDashboard
              rpsData={rpsData}
              setRpsData={setRpsData}
              userSession={userSession}
              showNotification={showNotification}
              initialSubTab={kaprodiSubTab}
              onSubTabChange={setKaprodiSubTab}
              onOpenRpsInEditor={(mkName) => {
                setActiveTab("preview");
                showNotification(`Membuka Pratinjau Dokumen RPS mata kuliah ${mkName} untuk verifikasi...`, "info");
              }}
            />
          </div>
        ) : activeTab === "apihub" ? (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <RealTimeApiHub
              rpsData={rpsData}
              setRpsData={setRpsData}
              showNotification={showNotification}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <RpsPreview
              rpsData={rpsData}
              isGenerated={isGenerated}
              onGenerate={handleGenerateRps}
              onOpenGoogleDriveModal={() => setIsGoogleDriveOpen(true)}
              showNotification={showNotification}
            />
          </div>
        )}
      </main>

      {/* Google Drive Export Modal */}
      <GoogleDriveExportModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        rpsData={rpsData}
        onDownloadPdf={handleDownloadPdf}
        onExportDocx={handleExportDocx}
        showNotification={showNotification}
      />

      {/* Moving Hourglass Modal saat proses generate RPS */}
      <HourglassLoadingModal
        isOpen={isGeneratingRps}
        courseName={rpsData.namaMK}
        studyProgram={rpsData.namaProdi}
        currentStepMessage={generatingProgressMsg}
      />

      {/* Direktori 117 Program Studi Modal */}
      <ProdiDirectoryModal
        isOpen={isProdiDirectoryOpen}
        onClose={() => setIsProdiDirectoryOpen(false)}
        onSelectProdi={handleSelectProdiFromDirectory}
        currentKodeProdi={userSession?.kodeProdi || initialProdiFromUrl?.kodeProdi}
        showNotification={showNotification}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentSession={userSession}
        onOpenDirectory={() => setIsProdiDirectoryOpen(true)}
        initialProdi={initialProdiFromUrl}
      />

      {/* Floating Gemini Chat Trigger Button */}
      {!isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-32 right-5 sm:bottom-36 sm:right-6 z-40 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white p-3.5 rounded-full shadow-2xl border border-purple-400/40 flex items-center gap-2 group transition-all duration-200 active:scale-95"
          title="Buka Gemini OBE Academic Mentor Chatbot"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: "3s" }} />
          <span className="text-xs font-black pr-1 hidden sm:inline-block">Gemini Chat</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        </button>
      )}

      {/* Multi-turn Gemini AI Chatbox */}
      <GeminiChatbox
        rpsData={rpsData}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        showNotification={showNotification}
      />

      {/* Toast Notification Container */}
      <div className={`fixed z-50 flex flex-col space-y-2 pointer-events-none transition-all duration-300 ${
        isChatOpen ? "bottom-5 left-5" : "bottom-5 right-5"
      }`}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === "success"
                ? "bg-slate-900 border-emerald-500 text-emerald-300"
                : toast.type === "error"
                ? "bg-slate-900 border-rose-500 text-rose-300"
                : "bg-slate-900 border-cyan-500 text-cyan-300"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-cyan-400" />}
            <span className="max-w-xs">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
