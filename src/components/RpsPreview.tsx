import React, { useRef, useState, useEffect } from "react";
import {
  FileText,
  Download,
  Copy,
  Printer,
  CheckCircle2,
  FileCode,
  Save,
  Loader2,
  Sparkles,
  AlertCircle,
  HardDriveUpload,
  Sliders,
} from "lucide-react";
import { RpsData } from "../types/rps";
import {
  UNPATTI_SDGS_LIST,
  PIP_UNPATTI_LIST,
  KKNI_DESCRIPTORS_LIST,
  KKNI_LEVELS_LIST,
} from "../data/unpattiDefaults";
import { exportRpsToDocx } from "../utils/docxExport";
import { exportRpsToPdf } from "../utils/pdfExport";
import { printRpsDocument } from "../utils/printExport";
import { UNPATTI_LOGO_DATA_URL } from "../data/unpattiLogo";
import {
  UnpattiPdfHeaderFooterModal,
  UnpattiKopConfig,
  getDefaultKopConfig,
} from "./UnpattiPdfHeaderFooterModal";

interface RpsPreviewProps {
  rpsData: RpsData;
  isGenerated?: boolean;
  onGenerate?: () => void;
  onOpenGoogleDriveModal?: () => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const RpsPreview: React.FC<RpsPreviewProps> = ({
  rpsData,
  isGenerated = true,
  onGenerate,
  onOpenGoogleDriveModal,
  showNotification,
}) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isKopModalOpen, setIsKopModalOpen] = useState(false);
  const [kopConfig, setKopConfig] = useState<UnpattiKopConfig>(() => {
    try {
      const saved = localStorage.getItem("unpatti_pdf_kop_config");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getDefaultKopConfig(rpsData);
  });

  useEffect(() => {
    if (rpsData.namaFakultas || rpsData.namaProdi) {
      setKopConfig((prev) => ({
        ...prev,
        prodi: (rpsData.namaProdi || prev.prodi).toUpperCase(),
        fakultas: rpsData.namaFakultas ? rpsData.namaFakultas.toUpperCase() : prev.fakultas,
      }));
    }
  }, [rpsData.namaFakultas, rpsData.namaProdi]);

  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
  };

  const handleExportDocx = async () => {
    if (!isGenerated) {
      showNotification("Pratinjau belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    const elem = printableRef.current || document.getElementById("printableDocument");
    const htmlContent = elem ? elem.innerHTML : "";
    setIsExportingDocx(true);
    showNotification("Menyiapkan dokumen Word .docx dengan paket format UNPATTI...", "info");
    try {
      await exportRpsToDocx(rpsData, htmlContent);
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
      showNotification("Pratinjau belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    const elem = printableRef.current || document.getElementById("printableDocument");
    if (!elem) {
      showNotification("Elemen dokumen pratinjau belum siap. Silakan buka tab Pratinjau Dokumen.", "error");
      return;
    }
    setIsExportingPdf(true);
    showNotification("Memulai pembuatan dokumen PDF Legal Portrait...", "info");

    try {
      await exportRpsToPdf(
        elem,
        rpsData,
        (statusMsg) => {
          showNotification(statusMsg, "info");
        },
        kopConfig
      );
      showNotification("File PDF Legal Portrait berhasil diunduh ke perangkat Anda (Ukuran berkas teroptimasi & ringkas)!", "success");
    } catch (err: any) {
      console.error("PDF export error:", err);
      showNotification(`Gagal mengunduh PDF: ${err?.message || "Terjadi kendala saat rendering"}. Anda dapat menggunakan tombol Cetak Browser.`, "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintPdf = async () => {
    if (!isGenerated) {
      showNotification("Pratinjau belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    setIsPrinting(true);
    showNotification("Menyiapkan dokumen cetak RPS (Legal Portrait)...", "info");
    try {
      const elem = printableRef.current || document.getElementById("printableDocument");
      if (!elem) {
        showNotification("Dokumen cetak belum siap. Silakan coba lagi.", "error");
        return;
      }
      await printRpsDocument(elem, rpsData, (statusMsg) => {
        showNotification(statusMsg, "info");
      });
    } catch (err: any) {
      console.error("Print error:", err);
      showNotification(
        `Gagal mencetak: ${err?.message || "Terjadi kendala saat membuka dialog printer"}.`,
        "error"
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!isGenerated) {
      showNotification("Pratinjau belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    const md = `# RENCANA PEMBELAJARAN SEMESTER (RPS) BERBASIS OBE
**${rpsData.namaKampus} - ${rpsData.namaFakultas}**
**${rpsData.namaProdi}**

## I. IDENTITAS MATA KULIAH
- Mata Kuliah: ${rpsData.namaMK} (${rpsData.kodeMK})
- Bobot SKS: ${rpsData.bobotSKS} SKS (Teori: ${rpsData.sksTeori}, Praktik: ${rpsData.sksPraktik})
- Semester: ${rpsData.semester} | Revisi: ${rpsData.revisiKe}
- Dosen Pengampu: ${rpsData.dosenPengampu}
- Integrasi SDGs: ${rpsData.selectedSdgs.length > 0 ? rpsData.selectedSdgs.map((id) => `SDG ${id}`).join(", ") : "-"}
- Integrasi PIP Unpatti (Bina Mulia Ke Lautan): ${(rpsData.selectedPipItems || []).length > 0 ? (rpsData.selectedPipItems || []).join(", ") : "-"}
- Penyesuaian Jenjang KKNI: Level ${(rpsData.selectedKkniLevels || []).join(", ") || "6"} (${(rpsData.selectedKkniItems || []).join(", ") || "-"})

## II. DESKRIPSI SINGKAT
${rpsData.deskripsiMK}

## III. CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK)
${rpsData.cpmkList.map((c) => `- **${c.id}**: ${c.desc}`).join("\n")}

## IV. BAHAN KAJIAN
${rpsData.bahanKajian}

## V. DAFTAR PUSTAKA
${rpsData.daftarPustaka}

## VI. RUBRIK PENILAIAN OBE
${(rpsData.rubrics || [])
  .map(
    (r) =>
      `### ${r.objectiveRef} (${r.assessmentMethod})\n` +
      r.criteria
        .map(
          (c) =>
            `- **${c.name}** (Bobot: ${c.weightPercent}%)\n  *Indikator*: ${c.indicator}\n  *Sangat Baik (A)*: ${c.levels.sangatBaik}\n  *Baik (B)*: ${c.levels.baik}\n  *Cukup (C)*: ${c.levels.cukup}\n  *Kurang (D/E)*: ${c.levels.kurang}`
        )
        .join("\n")
  )
  .join("\n\n")}
`;
    navigator.clipboard.writeText(md);
    showNotification("Struktur RPS dalam format Markdown berhasil disalin!", "success");
  };

  const handleSaveJson = () => {
    if (!isGenerated) {
      showNotification("Pratinjau belum digenerate. Silakan klik tombol 'Generate & Tampilkan RPS' terlebih dahulu.", "info");
      return;
    }
    const dataStr = JSON.stringify(rpsData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RPS_OBE_${rpsData.kodeMK || "DATA"}_UNPATTI.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("File konfigurasi RPS (.json) berhasil diunduh!", "success");
  };

  const allAvailableCpls = rpsData.cplList || [];

  const matchedChosenCpls = allAvailableCpls.filter((c) =>
    (rpsData.selectedCpls || []).includes(c.id)
  );

  const chosenCpls =
    matchedChosenCpls.length > 0
      ? matchedChosenCpls
      : allAvailableCpls.length > 0
      ? allAvailableCpls.slice(0, 8)
      : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white border-b-2 border-slate-300 px-4 sm:px-6 py-2.5 flex items-center justify-between z-20 flex-shrink-0 shadow-sm no-print">
        <div className="flex items-center space-x-2">
          {isGenerated ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-700" />
              Dokumen RPS Aktif ({rpsData.kodeMK || "KODE"})
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <AlertCircle className="w-4 h-4 mr-1 text-amber-700" />
              Pratinjau Kosong (Menunggu Generate)
            </span>
          )}
          <span className="text-xs text-slate-700 hidden sm:inline font-semibold">
            Standar: <strong>Legal Portrait (21.6 &times; 35.6 cm)</strong>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            title="Salin/Ekspor ke LMS/SIAKAD"
            className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Salin/Ekspor ke LMS/SIAKAD</span>
          </button>

          <button
            type="button"
            onClick={handleSaveJson}
            title="Simpan file JSON"
            className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Simpan JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-3 py-1.5 text-xs font-bold text-blue-950 bg-blue-100 hover:bg-blue-200 disabled:opacity-60 border border-blue-400 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Unduh dokumen RPS format Microsoft Word (.docx)"
          >
            {isExportingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-800" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-blue-800" />
            )}
            <span>{isExportingDocx ? "Membuat Word..." : "Ekspor Word .docx"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 text-xs font-black text-white bg-red-700 hover:bg-red-800 disabled:opacity-60 rounded-lg transition flex items-center gap-1.5 shadow-sm shadow-red-950/20 active:scale-95 cursor-pointer"
            title="Unduh dokumen RPS format PDF Legal Portrait (21.6 x 35.6 cm)"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExportingPdf ? "Membuat PDF..." : "Unduh PDF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsKopModalOpen(true)}
            className="px-2.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Kustomisasi Kop Surat Resmi Fakultas & Running Footer PDF Standar UNPATTI"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-800" />
            <span className="hidden sm:inline">Kop &amp; Footer PDF</span>
          </button>

          {onOpenGoogleDriveModal && (
            <button
              type="button"
              onClick={onOpenGoogleDriveModal}
              className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-400 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Ekspor dokumen RPS ke folder Google Drive (tempelkan URL folder tujuan)"
            >
              <HardDriveUpload className="w-3.5 h-3.5 text-amber-800" />
              <span>G-Drive</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={isPrinting || isExportingPdf}
            title="Cetak Dokumen RPS (Buka dialog printer / cetak kertas Legal)"
            className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-xs"
          >
            {isPrinting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {!isGenerated ? (
        /* Empty State */
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto bg-slate-100">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border-2 border-slate-300 p-6 sm:p-8 text-center space-y-5 animate-in fade-in duration-300">
            {/* UNPATTI Identity */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-slate-200 p-1.5 shadow-sm flex items-center justify-center">
                <img
                  src={UNPATTI_LOGO_DATA_URL}
                  alt="Logo UNPATTI"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                UNIVERSITAS PATTIMURA &bull; KURIKULUM OBE
              </span>
            </div>

            {/* Empty State Banner */}
            <div className="space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700">
                <AlertCircle className="w-8 h-8 text-amber-600 animate-pulse" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Pratinjau Dokumen RPS Masih Kosong
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Dokumen RPS belum digenerate. Silakan tinjau dan sesuaikan parameter kurikulum pada formulir editor di sisi kiri, kemudian klik tombol <strong>&ldquo;Generate &amp; Tampilkan RPS&rdquo;</strong> untuk menghasilkan dan menampilkan dokumen pratinjau secara lengkap.
              </p>
            </div>

            {/* Primary Action Button */}
            {onGenerate && (
              <div>
                <button
                  type="button"
                  onClick={onGenerate}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 hover:from-emerald-800 hover:to-slate-950 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-950/20 active:scale-95 transition flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: "3s" }} />
                  <span>Generate &amp; Tampilkan RPS Sekarang</span>
                </button>
              </div>
            )}

            {/* Ringkasan Data Siap Generate */}
            <div className="pt-4 border-t border-slate-200 text-left">
              <div className="text-[11px] font-black uppercase text-slate-500 mb-2">
                Ringkasan Data Parameter Siap Generate:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Mata Kuliah:</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {rpsData.namaMK || "Belum ditentukan"}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {rpsData.kodeMK || "-"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Program Studi:</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {rpsData.namaProdi || "-"}
                  </span>
                  <span className="text-slate-500 text-[10px] truncate block">
                    {rpsData.namaFakultas || "-"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Bobot &amp; Semester:</span>
                  <span className="font-bold text-slate-900 block">
                    {rpsData.bobotSKS} SKS ({rpsData.sksTeori}T / {rpsData.sksPraktik}P)
                  </span>
                  <span className="text-emerald-700 font-semibold text-[10px]">
                    {rpsData.semester}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Komponen Kurikulum:</span>
                  <span className="font-bold text-slate-900 block">
                    {rpsData.selectedCpls.length} CPL &bull; {rpsData.cpmkList.length} CPMK
                  </span>
                  <span className="text-blue-700 font-semibold text-[10px]">
                    {rpsData.subCpmkList.length} Sub-CPMK &bull; 16 Mg
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-medium">
              Sesuai Permendikbudristek No. 39/2025 &amp; No. 10/2026 &bull; Format Legal Portrait Resmi UNPATTI
            </div>
          </div>
        </div>
      ) : (
        /* Printable Sheet Viewport (Responsif Mobile & Tablet) */
        <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-4 md:p-6 pb-24 md:pb-6 bg-slate-200">
          <div className="w-[820px] min-w-[820px] max-w-[820px] mx-auto bg-white shadow-2xl rounded-sm p-5 sm:p-6 border border-slate-400 document-page text-slate-900 box-border">
            <div ref={printableRef} id="printableDocument" style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
              {/* KOP DOKUMEN RPS */}
              <table
                className="table-rps mb-2"
                style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}
              >
              <tbody>
                <tr>
                  <td
                    rowSpan={2}
                    align="center"
                    valign="middle"
                    style={{
                      width: "3.0cm",
                      maxWidth: "3.2cm",
                      textAlign: "center",
                      verticalAlign: "middle",
                      backgroundColor: "#ffffff",
                      padding: "6pt 4pt",
                      border: "0.75px solid #94a3b8",
                    }}
                  >
                    <img
                      src={UNPATTI_LOGO_DATA_URL}
                      alt="Logo Resmi UNPATTI"
                      width="95"
                      height="95"
                      style={{
                        width: "2.5cm",
                        height: "2.5cm",
                        maxWidth: "2.5cm",
                        maxHeight: "2.5cm",
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                  </td>
                  <td
                    align="center"
                    valign="middle"
                    style={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      padding: "7pt 10pt",
                      backgroundColor: "#f8fafc",
                      border: "0.75px solid #94a3b8",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: "8.5pt",
                        fontWeight: "bold",
                        letterSpacing: "1.5pt",
                        color: "#334155",
                        textTransform: "uppercase",
                        marginBottom: "2pt",
                        textAlign: "center",
                      }}
                    >
                      {(rpsData.namaKampus || "UNIVERSITAS PATTIMURA").toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: "11pt",
                        fontWeight: 900,
                        letterSpacing: "0.8pt",
                        color: "#0f172a",
                        textTransform: "uppercase",
                        marginBottom: "2pt",
                        textAlign: "center",
                      }}
                    >
                      {(rpsData.namaFakultas || "").toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontFamily: "Arial, Helvetica, sans-serif",
                        fontSize: "9.5pt",
                        fontWeight: "bold",
                        letterSpacing: "0.5pt",
                        color: "#15803d",
                        textTransform: "uppercase",
                        textAlign: "center",
                      }}
                    >
                      {(rpsData.namaProdi || "").toUpperCase()}
                    </div>
                  </td>
                  <td
                    rowSpan={2}
                    align="left"
                    valign="top"
                    style={{
                      width: "6.2cm",
                      textAlign: "left",
                      verticalAlign: "top",
                      padding: "6pt 8pt",
                      backgroundColor: "#f8fafc",
                      fontFamily: "Arial, Helvetica, sans-serif",
                      border: "0.75px solid #94a3b8",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8pt",
                        fontWeight: "bold",
                        color: "#1e293b",
                        borderBottom: "1pt solid #cbd5e1",
                        paddingBottom: "2.5pt",
                        marginBottom: "3pt",
                      }}
                    >
                      NO. DOKUMEN:
                    </div>
                    <div
                      style={{
                        fontFamily: "'Courier New', monospace, Arial",
                        fontSize: "9.5pt",
                        fontWeight: 900,
                        color: "#15803d",
                        marginBottom: "2.5pt",
                        letterSpacing: "0.5pt",
                      }}
                    >
                      {rpsData.kodeDokumen || "-"}
                    </div>
                    <div style={{ fontSize: "7.5pt", color: "#475569", marginBottom: "1.5pt" }}>
                      Penjaminan Mutu &amp; Kurikulum {rpsData.namaProdi || ""}
                    </div>
                    <div style={{ fontSize: "7.5pt", color: "#475569", marginBottom: "3pt" }}>
                      Tgl Penyusunan:{" "}
                      <strong style={{ color: "#0f172a" }}>
                        {rpsData.tglPengesahan ? formatIndonesianDate(rpsData.tglPengesahan) : "-"}
                      </strong>
                    </div>
                    <div
                      style={{
                        borderTop: "1pt solid #cbd5e1",
                        paddingTop: "3pt",
                        marginTop: "2pt",
                        fontSize: "7.5pt",
                        fontWeight: "bold",
                        color: "#15803d",
                      }}
                    >
                      Revisi Ke: {rpsData.revisiKe || "-"}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    align="center"
                    valign="middle"
                    style={{
                      backgroundColor: "#14532d",
                      color: "#ffffff",
                      textAlign: "center",
                      verticalAlign: "middle",
                      padding: "6pt 10pt",
                      border: "0.75px solid #94a3b8",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cinzel', 'Times New Roman', Georgia, serif",
                        fontSize: "10.5pt",
                        fontWeight: "bold",
                        letterSpacing: "1.5pt",
                        color: "#ffffff",
                        textAlign: "center",
                        lineHeight: 1.35,
                      }}
                    >
                      <span style={{ color: "#ffffff", display: "block" }}>
                        RENCANA PEMBELAJARAN SEMESTER
                      </span>
                      <span style={{ color: "#ffffff", display: "block" }}>
                        (RPS) BERBASIS OBE
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* IDENTITAS MATA KULIAH */}
            <table className="table-rps mb-2">
              <tbody>
                <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a" }}>
                  <th style={{ width: "25%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Mata Kuliah (MK)</th>
                  <th style={{ width: "16.6%", textAlign: "center", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Kode MK</th>
                  <th style={{ width: "16.6%", textAlign: "center", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Rumpun / Jenis MK</th>
                  <th style={{ width: "16.6%", textAlign: "center", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Bobot (SKS)</th>
                  <th style={{ width: "8.3%", textAlign: "center", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Semester</th>
                  <th style={{ width: "16.6%", textAlign: "center", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Tgl Penyusunan</th>
                </tr>
                <tr>
                  <td style={{ fontWeight: 900, color: "#0f172a", fontSize: "11px", border: "0.75px solid #94a3b8", padding: "5px" }}>{rpsData.namaMK}</td>
                  <td style={{ textAlign: "center", fontFamily: "monospace", fontWeight: "bold", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>
                    {rpsData.kodeMK}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 500, border: "0.75px solid #94a3b8", padding: "5px" }}>
                    {rpsData.rumpunMK} / {rpsData.jenisMK}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>
                    T={rpsData.sksTeori} &nbsp; P={rpsData.sksPraktik} &nbsp; (
                    <strong>{rpsData.bobotSKS} SKS</strong>)
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "bold", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>{rpsData.semester}</td>
                  <td style={{ textAlign: "center", fontWeight: 500, border: "0.75px solid #94a3b8", padding: "5px" }}>
                    {rpsData.tglPengesahan ? formatIndonesianDate(rpsData.tglPengesahan) : "-"}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Otorisasi / Pengesahan</th>
                  <td colSpan={2} style={{ width: "33.3%", padding: "6px", textAlign: "center", verticalAlign: "top", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8" }}>
                    <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                      Koordinator Pengembang RPS / RMK
                    </div>
                    <div style={{ height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", color: "#94a3b8", fontStyle: "italic", fontSize: "10px" }}>
                      [Tanda Tangan]
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "10.5px", color: "#0f172a" }}>{rpsData.koorMK || "-"}</div>
                  </td>
                  <td colSpan={2} style={{ width: "33.3%", padding: "6px", textAlign: "center", verticalAlign: "top", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8" }}>
                    <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>
                      Ketua Program Studi {rpsData.namaProdi ? rpsData.namaProdi.replace(/^PROGRAM\s+STUDI\s+/i, "") : ""}
                    </div>
                    <div style={{ height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", color: "#94a3b8", fontStyle: "italic", fontSize: "10px" }}>
                      [Tanda Tangan]
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "10.5px", color: "#0f172a" }}>{rpsData.kaprodi || "-"}</div>
                  </td>
                  <td colSpan={1} style={{ width: "33.3%", padding: "6px", textAlign: "center", verticalAlign: "top", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8" }}>
                    <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155", marginBottom: "4px" }}>Otorisasi GJM</div>
                    <div style={{ height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "serif", color: "#94a3b8", fontStyle: "italic", fontSize: "10px" }}>
                      [Tanda Tangan]
                    </div>
                    <div style={{ fontWeight: "bold", fontSize: "10.5px", color: "#0f172a" }}>
                      {rpsData.wadirAkademik || "-"}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>Tim Dosen Pengampu</th>
                  <td colSpan={5} style={{ fontWeight: 600, color: "#1e293b", border: "0.75px solid #94a3b8", padding: "5px" }}>
                    {rpsData.dosenPengampu || "-"}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", backgroundColor: "#f8fafc", color: "#14532d", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "4px 6px" }}>
                    Integrasi 17 SDGs
                  </th>
                  <td colSpan={5} style={{ fontWeight: 500, color: "#14532d", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8", padding: "4px 6px" }}>
                    {rpsData.selectedSdgs.length === 0 ? (
                      <span className="text-slate-400 italic text-xs">
                        Tidak ada SDGs yang ditandai.
                      </span>
                    ) : (
                      rpsData.selectedSdgs.map((id) => {
                        const item = UNPATTI_SDGS_LIST.find((s) => s.id === id);
                        return (
                          <span
                            key={id}
                            className="sdg-pill"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                              backgroundColor: "#ffffff",
                              color: "#15803d",
                              border: "1px solid #16a34a",
                              padding: "2px 8px",
                              borderRadius: "14px",
                              fontSize: "9px",
                              fontWeight: 700,
                              margin: "2px 3px",
                              lineHeight: "15px",
                            }}
                          >
                            <strong
                              className="sdg-num"
                              style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                backgroundColor: "#16a34a",
                                color: "#ffffff",
                                borderRadius: "50%",
                                minWidth: "14px",
                                height: "14px",
                                textAlign: "center",
                                lineHeight: "14px",
                                fontSize: "8px",
                                marginRight: "4px",
                                padding: "0 2px",
                              }}
                            >
                              {id}
                            </strong>
                            <span>{item ? item.name : `SDG ${id}`}</span>
                          </span>
                        );
                      })
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", backgroundColor: "#f8fafc", color: "#0e7490", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "4px 6px" }}>
                    Integrasi PIP Unpatti
                    <span style={{ display: "block", fontSize: "8px", fontWeight: "normal", color: "#0891b2" }}>
                      (Bina Mulia Ke Lautan)
                    </span>
                  </th>
                  <td colSpan={5} style={{ fontWeight: 500, color: "#0e7490", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8", padding: "4px 6px" }}>
                    {(!rpsData.selectedPipItems || rpsData.selectedPipItems.length === 0) ? (
                      <span className="text-slate-400 italic text-xs">
                        Tidak ada butir PIP Bina Mulia Ke Lautan yang ditandai.
                      </span>
                    ) : (
                      rpsData.selectedPipItems.map((code) => {
                        const item = PIP_UNPATTI_LIST.find((p) => p.id === code || p.code === code);
                        return (
                          <span
                            key={code}
                            className="pip-pill"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                              backgroundColor: "#ffffff",
                              color: "#0891b2",
                              border: "1px solid #0891b2",
                              padding: "2px 8px",
                              borderRadius: "14px",
                              fontSize: "9px",
                              fontWeight: 700,
                              margin: "2px 3px",
                              lineHeight: "15px",
                            }}
                          >
                            <strong
                              className="pip-code"
                              style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                backgroundColor: "#0891b2",
                                color: "#ffffff",
                                borderRadius: "3px",
                                fontSize: "8px",
                                marginRight: "4px",
                                padding: "0 3px",
                                lineHeight: "12px",
                              }}
                            >
                              {code}
                            </strong>
                            <span>{item ? item.title : code}</span>
                          </span>
                        );
                      })
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", backgroundColor: "#f8fafc", color: "#3730a3", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "4px 6px" }}>
                    Jenjang KKNI
                    <span style={{ display: "block", fontSize: "8px", fontWeight: "normal", color: "#475569" }}>
                      (Level 6 – 9 / Perpres 8/2012, Permendikbudristek 39/2025 &amp; 10/2026)
                    </span>
                  </th>
                  <td colSpan={5} style={{ fontWeight: 500, color: "#3730a3", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8", padding: "4px 6px" }}>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {((rpsData.selectedKkniLevels && rpsData.selectedKkniLevels.length > 0)
                        ? rpsData.selectedKkniLevels
                        : [6]
                      ).map((lvl) => {
                        const lvlInfo = KKNI_LEVELS_LIST.find((l) => l.level === lvl);
                        return (
                          <span
                            key={lvl}
                            className="kkni-level-badge"
                            style={{
                              display: "inline-block",
                              backgroundColor:
                                lvl === 6
                                  ? "#dcfce7"
                                  : lvl === 7
                                  ? "#fef3c7"
                                  : lvl === 8
                                  ? "#dbeafe"
                                  : "#f3e8ff",
                              color:
                                lvl === 6
                                  ? "#14532d"
                                  : lvl === 7
                                  ? "#78350f"
                                  : lvl === 8
                                  ? "#1e3a8a"
                                  : "#581c87",
                              border:
                                lvl === 6
                                  ? "1px solid #86efac"
                                  : lvl === 7
                                  ? "1px solid #fde68a"
                                  : lvl === 8
                                  ? "1px solid #bfdbfe"
                                  : "1px solid #e9d5ff",
                              borderRadius: "4px",
                              padding: "1px 6px",
                              fontSize: "9px",
                              fontWeight: 800,
                              marginRight: "4px",
                            }}
                          >
                            Level {lvl}: {lvlInfo ? lvlInfo.degree : `Jenjang ${lvl}`}
                          </span>
                        );
                      })}
                    </div>

                    {(!rpsData.selectedKkniItems || rpsData.selectedKkniItems.length === 0) ? (
                      <span className="text-slate-400 italic text-xs">
                        Tidak ada butir deskriptor KKNI yang ditandai.
                      </span>
                    ) : (
                      rpsData.selectedKkniItems.map((code) => {
                        const item = KKNI_DESCRIPTORS_LIST.find((k) => k.id === code || k.code === code);
                        const lvl = item ? item.level : 6;
                        return (
                          <span
                            key={code}
                            className="kkni-pill"
                            style={{
                              display: "inline-block",
                              verticalAlign: "middle",
                              backgroundColor: "#ffffff",
                              color:
                                lvl === 6
                                  ? "#15803d"
                                  : lvl === 7
                                  ? "#b45309"
                                  : lvl === 8
                                  ? "#1d4ed8"
                                  : "#7e22ce",
                              border:
                                lvl === 6
                                  ? "1px solid #16a34a"
                                  : lvl === 7
                                  ? "1px solid #f59e0b"
                                  : lvl === 8
                                  ? "1px solid #3b82f6"
                                  : "1px solid #a855f7",
                              padding: "2px 8px",
                              borderRadius: "14px",
                              fontSize: "9px",
                              fontWeight: 700,
                              margin: "2px 3px",
                              lineHeight: "15px",
                            }}
                          >
                            <strong
                              className="kkni-code"
                              style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                                backgroundColor:
                                  lvl === 6
                                    ? "#16a34a"
                                    : lvl === 7
                                    ? "#d97706"
                                    : lvl === 8
                                    ? "#2563eb"
                                    : "#9333ea",
                                color: "#ffffff",
                                borderRadius: "3px",
                                fontSize: "8px",
                                marginRight: "4px",
                                padding: "0 3px",
                                lineHeight: "12px",
                              }}
                            >
                              {code}
                            </strong>
                            <span>{item ? item.title : code}</span>
                          </span>
                        );
                      })
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* CAPAIAN PEMBELAJARAN (CPL, CPMK, Sub-CPMK) */}
            <table className="table-rps mb-1.5">
              <thead>
                <tr style={{ backgroundColor: "#14532d", color: "#ffffff" }}>
                  <th
                    colSpan={2}
                    className="text-left px-3 py-1 font-bold text-xs uppercase tracking-wider text-white"
                    style={{ backgroundColor: "#14532d", color: "#ffffff", padding: "5px 8px", fontSize: "10.5px", fontWeight: "bold", border: "0.75px solid #94a3b8" }}
                  >
                    II. Capaian Pembelajaran Lulusan (CPL) dan Capaian Pembelajaran Mata Kuliah (CPMK)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a" }}>
                  <td colSpan={2} style={{ backgroundColor: "#e2e8f0", color: "#0f172a", padding: "6px 8px", fontWeight: "bold", fontSize: "11px", border: "0.75px solid #94a3b8" }}>
                    A. Capaian Pembelajaran Lulusan (CPL{rpsData.namaProdi ? ` ${rpsData.namaProdi.replace(/^PROGRAM\s+STUDI\s+/i, "")}` : ""}) yang Dibebankan pada MK
                  </td>
                </tr>
                {chosenCpls.map((c) => (
                  <tr key={c.id}>
                    <td style={{ width: "110px", minWidth: "110px", textAlign: "center", verticalAlign: "top", backgroundColor: "#f8fafc", padding: "6px 4px", border: "0.75px solid #94a3b8" }}>
                      <span className="cpl-badge" style={{ display: "inline-block", backgroundColor: "#dcfce7", border: "1px solid #22c55e", color: "#15803d", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold", fontSize: "10px" }}>
                        {c.id}
                      </span>
                    </td>
                    <td style={{ textAlign: "justify", color: "#1e293b", padding: "6px 8px", fontSize: "10px", lineHeight: "1.45", border: "0.75px solid #94a3b8" }}>
                      {c.desc}
                    </td>
                  </tr>
                ))}

                <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a" }}>
                  <td colSpan={2} style={{ backgroundColor: "#e2e8f0", color: "#0f172a", padding: "6px 8px", fontWeight: "bold", fontSize: "11px", border: "0.75px solid #94a3b8" }}>
                    B. Capaian Pembelajaran Mata Kuliah (CPMK)
                  </td>
                </tr>
                {rpsData.cpmkList.map((c) => (
                  <tr key={c.id}>
                    <td style={{ width: "110px", minWidth: "110px", textAlign: "center", verticalAlign: "top", backgroundColor: "#f8fafc", padding: "6px 4px", border: "0.75px solid #94a3b8" }}>
                      <span className="cpmk-pill" style={{ display: "inline-block", backgroundColor: "#eff6ff", border: "1px solid #60a5fa", color: "#1d4ed8", padding: "2px 10px", borderRadius: "12px", fontWeight: "bold", fontSize: "10px" }}>
                        {c.id}
                      </span>
                    </td>
                    <td style={{ textAlign: "justify", color: "#1e293b", padding: "6px 8px", fontSize: "10px", lineHeight: "1.45", border: "0.75px solid #94a3b8" }}>
                      {c.desc}
                    </td>
                  </tr>
                ))}

                <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a" }}>
                  <td colSpan={2} style={{ backgroundColor: "#e2e8f0", color: "#0f172a", padding: "6px 8px", fontWeight: "bold", fontSize: "11px", border: "0.75px solid #94a3b8" }}>
                    C. Kemampuan Akhir Tiap Tahapan Belajar (Sub-CPMK)
                  </td>
                </tr>
                {rpsData.subCpmkList.map((s) => (
                  <tr key={s.id}>
                    <td style={{ width: "120px", minWidth: "120px", textAlign: "center", verticalAlign: "top", backgroundColor: "#f8fafc", padding: "6px 4px", border: "0.75px solid #94a3b8" }}>
                      <span className="subcpmk-pill" style={{ display: "inline-block", backgroundColor: "#fffbeb", border: "1.5px solid #f59e0b", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold", fontSize: "10px" }}>
                        {s.id}
                      </span>
                      <div className="subcpmk-ref" style={{ fontSize: "9px", fontWeight: "bold", color: "#b45309", marginTop: "3px" }}>
                        [{s.cpmkRef}]
                      </div>
                    </td>
                    <td style={{ textAlign: "justify", color: "#1e293b", padding: "6px 8px", fontSize: "10px", lineHeight: "1.45", border: "0.75px solid #94a3b8" }}>
                      <span className="bloom-pill" style={{ display: "inline-block", backgroundColor: "#fef3c7", border: "1.5px solid #f59e0b", color: "#b45309", padding: "2px 8px", borderRadius: "6px", fontWeight: "bold", fontSize: "9.5px", marginRight: "8px" }}>
                        {s.bloom}
                      </span>
                      {" "}{s.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* MATRIKS KORELASI CPL - CPMK */}
            <table className="table-rps mb-2">
              <thead>
                <tr style={{ backgroundColor: "#14532d", color: "#ffffff" }}>
                  <th
                    colSpan={chosenCpls.length + 2}
                    className="text-center px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-white"
                    style={{ backgroundColor: "#14532d", color: "#ffffff", padding: "6px 8px", textAlign: "center", border: "0.75px solid #94a3b8" }}
                  >
                    III. Matriks Korelasi CPL terhadap CPMK &amp; Bobot Penilaian (Total 100%)
                  </th>
                </tr>
                <tr style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>
                  <th rowSpan={2} style={{ width: "80px", textAlign: "center", verticalAlign: "middle", backgroundColor: "#f1f5f9", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8" }}>
                    Kode CPMK
                  </th>
                  <th colSpan={chosenCpls.length} style={{ textAlign: "center", backgroundColor: "#f1f5f9", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "4px" }}>
                    CPL {rpsData.namaProdi || "Program Studi"}
                  </th>
                  <th rowSpan={2} style={{ width: "80px", textAlign: "center", verticalAlign: "middle", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8" }}>
                    Bobot (%)
                  </th>
                </tr>
                <tr style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}>
                  {chosenCpls.map((c) => (
                    <th key={c.id} style={{ padding: "4px", textAlign: "center", fontFamily: "monospace", fontSize: "9.5px", backgroundColor: "#f8fafc", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8" }}>
                      {c.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rpsData.cpmkList.map((cpmk, idx) => {
                  const weight = Math.round(100 / Math.max(1, rpsData.cpmkList.length));
                  return (
                    <tr key={cpmk.id}>
                      <td style={{ textAlign: "center", fontWeight: "bold", fontFamily: "monospace", backgroundColor: "#f8fafc", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>
                        {cpmk.id}
                      </td>
                      {chosenCpls.map((cpl, cplIdx) => {
                        let matched = false;
                        const normCplId = cpl.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

                        // 1. Cek apakah ada kecocokan eksplisit pada cplRefs
                        if (cpmk.cplRefs && Array.isArray(cpmk.cplRefs) && cpmk.cplRefs.length > 0) {
                          matched = cpmk.cplRefs.some((ref) => {
                            const normRef = ref.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                            return normRef === normCplId || ref.trim().toLowerCase() === cpl.id.trim().toLowerCase();
                          });
                        } else {
                          // 2. Pemetaan otomatis cerdas (Auto-fill) jika cplRefs belum ditentukan secara manual
                          // Memastikan tabel matriks CPL ke CPMK terisi otomatis dan tidak kosong
                          const totalCpmk = Math.max(1, rpsData.cpmkList.length);
                          const totalCpl = Math.max(1, chosenCpls.length);

                          const primaryTarget = Math.floor((idx * totalCpl) / totalCpmk);
                          const secondaryTarget = Math.min(totalCpl - 1, primaryTarget + 1);

                          // Pemetaan heuristik berdasarkan nomor indeks
                          const cpmkNumMatch = cpmk.id.match(/\d+/);
                          const cplNumMatch = cpl.id.match(/\d+/);
                          const cpmkNum = cpmkNumMatch ? parseInt(cpmkNumMatch[0], 10) : idx + 1;
                          const cplNum = cplNumMatch ? parseInt(cplNumMatch[0], 10) : cplIdx + 1;

                          const isIdMatch =
                            (cpmkNum === 1 && (cplNum === 1 || cplNum === 2)) ||
                            (cpmkNum === 2 && (cplNum === 2 || cplNum === 3 || cplNum === 5)) ||
                            (cpmkNum === 3 && (cplNum === 3 || cplNum === 6)) ||
                            (cpmkNum === 4 && (cplNum === 6 || cplNum === 8 || cplNum === 11)) ||
                            (cpmkNum === 5 && (cplNum === 8 || cplNum === 10 || cplNum === 13));

                          matched = cplIdx === primaryTarget || (totalCpl > totalCpmk && cplIdx === secondaryTarget) || isIdMatch;
                        }

                        return (
                          <td
                            key={cpl.id}
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: "12px",
                              backgroundColor: matched ? "#dcfce7" : "#ffffff",
                              color: matched ? "#15803d" : "#94a3b8",
                              border: "0.75px solid #94a3b8",
                              padding: "4px",
                            }}
                          >
                            {matched ? "✓" : "-"}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: "center", fontWeight: "bold", backgroundColor: "#f8fafc", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>
                        {idx === rpsData.cpmkList.length - 1
                          ? 100 - weight * (rpsData.cpmkList.length - 1)
                          : weight}
                        %
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: "#f1f5f9", fontWeight: "bold" }}>
                  <td colSpan={chosenCpls.length + 1} style={{ textAlign: "right", paddingRight: "16px", backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>
                    Total Persentase:
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "900", color: "#14532d", backgroundColor: "#dcfce7", border: "0.75px solid #94a3b8", padding: "5px" }}>100%</td>
                </tr>
              </tbody>
            </table>

            {/* MATRIKS KORELASI CPMK - SUB-CPMK */}
            <table className="table-rps mb-2">
              <thead>
                <tr style={{ backgroundColor: "#14532d", color: "#ffffff" }}>
                  <th
                    colSpan={rpsData.cpmkList.length + 2}
                    className="text-center px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-white"
                    style={{ backgroundColor: "#14532d", color: "#ffffff", padding: "6px 8px", textAlign: "center", border: "0.75px solid #94a3b8" }}
                  >
                    IV. Matriks Korelasi CPMK terhadap Sub-CPMK (Check-List)
                  </th>
                </tr>
                <tr style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>
                  <th style={{ width: "110px", textAlign: "center", backgroundColor: "#f1f5f9", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>Kode Sub-CPMK</th>
                  {rpsData.cpmkList.map((c) => (
                    <th key={c.id} style={{ width: "80px", textAlign: "center", fontFamily: "monospace", fontSize: "9.5px", backgroundColor: "#f1f5f9", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "4px" }}>
                      {c.id}
                    </th>
                  ))}
                  <th style={{ width: "110px", textAlign: "center", backgroundColor: "#f1f5f9", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>Level / Kriteria</th>
                </tr>
              </thead>
              <tbody>
                {rpsData.subCpmkList.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ textAlign: "center", fontWeight: "bold", fontFamily: "monospace", backgroundColor: "#f8fafc", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>
                      {sub.id}
                    </td>
                    {rpsData.cpmkList.map((cpmk) => {
                      const match = sub.cpmkRef === cpmk.id;
                      return (
                        <td
                          key={cpmk.id}
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "12px",
                            backgroundColor: match ? "#dcfce7" : "#ffffff",
                            color: match ? "#15803d" : "#94a3b8",
                            border: "0.75px solid #94a3b8",
                            padding: "4px",
                          }}
                        >
                          {match ? "✓" : "-"}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: "center", color: "#b45309", fontWeight: "bold", fontSize: "9.5px", backgroundColor: "#fef3c7", border: "0.75px solid #94a3b8", padding: "4px" }}>
                      {sub.bloom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* DESKRIPSI, BAHAN KAJIAN, PUSTAKA */}
            <table className="table-rps mb-2">
              <tbody>
                <tr>
                  <th style={{ width: "25%", textAlign: "left", verticalAlign: "top", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "6px" }}>
                    Deskripsi Singkat Mata Kuliah
                  </th>
                  <td style={{ textAlign: "justify", lineHeight: "1.45", color: "#1e293b", whiteSpace: "pre-line", border: "0.75px solid #94a3b8", padding: "6px" }}>
                    {rpsData.deskripsiMK}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", verticalAlign: "top", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "6px" }}>
                    Bahan Kajian / Pokok Bahasan
                  </th>
                  <td style={{ whiteSpace: "pre-line", lineHeight: "1.45", color: "#1e293b", border: "0.75px solid #94a3b8", padding: "6px" }}>
                    {rpsData.bahanKajian}
                  </td>
                </tr>
                <tr>
                  <th style={{ textAlign: "left", verticalAlign: "top", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "6px" }}>
                    Daftar Pustaka / Referensi
                  </th>
                  <td style={{ whiteSpace: "pre-line", lineHeight: "1.45", fontSize: "9.5px", color: "#1e293b", border: "0.75px solid #94a3b8", padding: "6px" }}>
                    {rpsData.daftarPustaka}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* SILABUS 16 MINGGU */}
            <div className="mb-2">
              <table className="table-rps mb-0">
                <thead>
                  <tr style={{ backgroundColor: "#14532d", color: "#ffffff" }}>
                    <th
                      colSpan={7}
                      className="text-left px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-white"
                      style={{ backgroundColor: "#14532d", color: "#ffffff", padding: "6px 8px", border: "0.75px solid #94a3b8" }}
                    >
                      V. Rencana Kegiatan Pembelajaran Mingguan (16 Minggu Termasuk UTS &amp; UAS)
                    </th>
                  </tr>
                  <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a", textAlign: "center" }}>
                    <th style={{ width: "4%", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "4px" }}>Mg</th>
                    <th style={{ width: "15%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>Kemampuan Akhir Belajar (Sub-CPMK)</th>
                    <th style={{ width: "25%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>Materi Pembelajaran / Bahan Kajian</th>
                    <th style={{ width: "18%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>Bentuk &amp; Metode Pembelajaran [Waktu]</th>
                    <th style={{ width: "16%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>Bentuk Asesmen &amp; Penugasan</th>
                    <th style={{ width: "16%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>Indikator &amp; Kriteria Penilaian</th>
                    <th style={{ width: "6%", textAlign: "center", backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "4px" }}>Bobot (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {rpsData.syllabusList.map((w) =>
                    w.isExam ? (
                      <tr
                        key={w.week}
                        className="bg-emerald-100 font-bold border-t-2 border-b-2 border-emerald-400"
                        style={{ backgroundColor: "#dcfce7" }}
                      >
                        <td
                          className="text-center font-black"
                          style={{ width: "4%", textAlign: "center", fontWeight: "900", color: "#064e3b", backgroundColor: "#dcfce7", border: "0.75px solid #94a3b8", padding: "5px" }}
                        >
                          {w.week}
                        </td>
                        <td
                          colSpan={5}
                          className="font-bold"
                          style={{ textAlign: "left", color: "#064e3b", backgroundColor: "#dcfce7", border: "0.75px solid #94a3b8", padding: "6px" }}
                        >
                          <span
                            style={{ backgroundColor: "#14532d", color: "#ffffff", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", marginRight: "6px", fontWeight: "bold", display: "inline-block" }}
                          >
                            {w.sub}
                          </span>
                          <strong>{w.materi}</strong> ({w.metode}) &mdash;{" "}
                          <span style={{ fontSize: "9.5px" }}>{w.indikator}</span>
                        </td>
                        <td
                          className="text-center font-black"
                          style={{ width: "6%", textAlign: "center", fontWeight: "900", color: "#064e3b", backgroundColor: "#dcfce7", border: "0.75px solid #94a3b8", padding: "5px" }}
                        >
                          {w.bobot}%
                        </td>
                      </tr>
                    ) : (
                      <tr key={w.week}>
                        <td
                          style={{ width: "4%", textAlign: "center", fontWeight: "bold", fontFamily: "monospace", backgroundColor: "#f8fafc", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}
                        >
                          {w.week}
                        </td>
                        <td
                          style={{ width: "15%", textAlign: "left", fontWeight: "bold", fontFamily: "monospace", fontSize: "9.5px", color: "#064e3b", backgroundColor: "#f0fdf4", border: "0.75px solid #94a3b8", padding: "4.5px" }}
                        >
                          {w.sub}
                        </td>
                        <td
                          style={{ width: "25%", textAlign: "left", fontWeight: "600", color: "#0f172a", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8", padding: "4.5px" }}
                        >
                          {w.materi}
                        </td>
                        <td
                          style={{ width: "18%", textAlign: "left", fontSize: "9px", color: "#334155", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8", padding: "4.5px" }}
                        >
                          {w.metode}
                        </td>
                        <td
                          style={{ width: "16%", textAlign: "left", fontSize: "9px", color: "#1e293b", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8", padding: "4.5px" }}
                        >
                          {w.asesmen}
                        </td>
                        <td
                          style={{ width: "16%", textAlign: "left", fontSize: "9px", color: "#334155", backgroundColor: "#ffffff", border: "0.75px solid #94a3b8", padding: "4.5px" }}
                        >
                          {w.indikator}
                        </td>
                        <td
                          style={{ width: "6%", textAlign: "center", fontWeight: "bold", color: "#0f172a", backgroundColor: "#f8fafc", border: "0.75px solid #94a3b8", padding: "4px" }}
                        >
                          {w.bobot}%
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold" }}>
                    <td colSpan={6} style={{ textAlign: "right", paddingRight: "16px", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>
                      Total Bobot Evaluasi Kumulatif:
                    </td>
                    <td style={{ textAlign: "center", color: "#14532d", fontWeight: "900", backgroundColor: "#dcfce7", border: "0.75px solid #94a3b8", padding: "5px" }}>100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* SISTEM PENILAIAN */}
            <div className="mb-2">
              <table className="table-rps mb-0">
                <thead>
                  <tr style={{ backgroundColor: "#14532d", color: "#ffffff" }}>
                    <th
                      colSpan={6}
                      className="text-left px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-white"
                      style={{ backgroundColor: "#14532d", color: "#ffffff", padding: "6px 8px", border: "0.75px solid #94a3b8" }}
                    >
                      VI. Sistem Penilaian dan Pembobotan (Pasal 47 Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik)
                    </th>
                  </tr>
                </thead>
              </table>
              <table className="table-rps mb-2">
                <tbody>
                  <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold" }}>
                    <th
                      colSpan={2}
                      className="w-1/2 text-center"
                      style={{ backgroundColor: "#dcfce7", color: "#14532d", width: "50%", padding: "6px", border: "0.75px solid #94a3b8" }}
                    >
                      Proyek Berbasis Tim &amp; Metode Pemecahan Kasus (Pasal 47 Ayat 3: Paling Sedikit 50%)
                    </th>
                    <th
                      colSpan={4}
                      className="w-1/2 text-center"
                      style={{ backgroundColor: "#dbeafe", color: "#1e3a8a", width: "50%", padding: "6px", border: "0.75px solid #94a3b8" }}
                    >
                      Tugas Terstruktur, Kuis, UTS, dan UAS (Pasal 47 Ayat 3: Paling Banyak 50%)
                    </th>
                  </tr>
                  <tr style={{ textAlign: "center" }}>
                    <td style={{ padding: "6px", backgroundColor: "#f0fdf4", border: "0.75px solid #94a3b8" }}>
                      <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155" }}>
                        Aktivitas Partisipatif
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#14532d", margin: "2px 0" }}>
                        {rpsData.assessmentWeights.partisipatif}%
                      </div>
                      <div style={{ fontSize: "8.5px", color: "#475569" }}>Metode Pemecahan Kasus (0-50%)</div>
                    </td>
                    <td style={{ padding: "6px", backgroundColor: "#f0fdf4", border: "0.75px solid #94a3b8" }}>
                      <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155" }}>Hasil Proyek</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#14532d", margin: "2px 0" }}>
                        {rpsData.assessmentWeights.proyek}%
                      </div>
                      <div style={{ fontSize: "8.5px", color: "#475569" }}>Proyek Berbasis Tim (0-50%)</div>
                    </td>
                    <td style={{ padding: "6px", backgroundColor: "#eff6ff", border: "0.75px solid #94a3b8" }}>
                      <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155" }}>Tugas Terstruktur</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#1d4ed8", margin: "2px 0" }}>
                        {rpsData.assessmentWeights.tugas}%
                      </div>
                      <div style={{ fontSize: "8.5px", color: "#475569" }}>Tugas Mandiri &amp; Praktik (0-50%)</div>
                    </td>
                    <td style={{ padding: "6px", backgroundColor: "#eff6ff", border: "0.75px solid #94a3b8" }}>
                      <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155" }}>Kuis (Formatif)</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#1d4ed8", margin: "2px 0" }}>
                        {rpsData.assessmentWeights.kuis}%
                      </div>
                      <div style={{ fontSize: "8.5px", color: "#475569" }}>Kuis Formatif (0-50%)</div>
                    </td>
                    <td style={{ padding: "6px", backgroundColor: "#eff6ff", border: "0.75px solid #94a3b8" }}>
                      <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155" }}>UTS</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#1d4ed8", margin: "2px 0" }}>
                        {rpsData.assessmentWeights.uts}%
                      </div>
                      <div style={{ fontSize: "8.5px", color: "#475569" }}>Ujian Tengah Semester (0-50%)</div>
                    </td>
                    <td style={{ padding: "6px", backgroundColor: "#eff6ff", border: "0.75px solid #94a3b8" }}>
                      <div style={{ fontSize: "9.5px", fontWeight: "bold", color: "#334155" }}>UAS</div>
                      <div style={{ fontSize: "14px", fontWeight: "900", color: "#1d4ed8", margin: "2px 0" }}>
                        {rpsData.assessmentWeights.uas}%
                      </div>
                      <div style={{ fontSize: "8.5px", color: "#475569" }}>Ujian Akhir Semester (0-50%)</div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Skala Penilaian Nilai Mutu Sesuai Pasal 47 Ayat (4) & (5) */}
              {rpsData.jenjang === "S2" || rpsData.jenjang === "S3" || rpsData.jenjang === "Spesialis" ? (
                /* Tabel Mutu Pascasarjana - Pasal 47 Ayat (5) */
                <table className="table-rps text-center">
                  <thead>
                    <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold" }}>
                      <th colSpan={4} style={{ textAlign: "left", fontWeight: "900", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>
                        Bentuk Penilaian Nilai Mutu Jenjang Magister (S2) &amp; Doktor (S3) (Pasal 47 Ayat 5 Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik)
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#f1f5f9", fontWeight: "bold", fontSize: "9.5px", color: "#0f172a" }}>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Rentang Nilai</th>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Nilai Huruf</th>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Nilai Angka</th>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Kategori Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>&ge; 90</td>
                      <td style={{ fontWeight: 900, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>A</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>4,00</td>
                      <td style={{ fontWeight: 600, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>Sangat Baik</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>85 - 89</td>
                      <td style={{ fontWeight: 900, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>A-</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>3,70</td>
                      <td style={{ fontWeight: 600, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>Sangat Baik</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>80 - 84,99</td>
                      <td style={{ fontWeight: 900, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>B+</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>3,30</td>
                      <td style={{ fontWeight: 600, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>Baik</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>70 - 79,99</td>
                      <td style={{ fontWeight: 900, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>B</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>3,00</td>
                      <td style={{ fontWeight: 600, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>Baik</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>65 - 69,99</td>
                      <td style={{ fontWeight: 900, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>B-</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>2,70</td>
                      <td style={{ fontWeight: 600, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>Baik</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>55 - 64,99</td>
                      <td style={{ fontWeight: 900, color: "#b45309", border: "0.75px solid #94a3b8", padding: "4px" }}>C</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>2,00</td>
                      <td style={{ color: "#b45309", border: "0.75px solid #94a3b8", padding: "4px" }}>Cukup</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: "#dc2626", border: "0.75px solid #94a3b8", padding: "4px" }}>&lt; 55</td>
                      <td style={{ fontWeight: 900, color: "#dc2626", border: "0.75px solid #94a3b8", padding: "4px" }}>E</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>0</td>
                      <td style={{ fontWeight: 900, color: "#dc2626", border: "0.75px solid #94a3b8", padding: "4px" }}>Gagal</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                /* Tabel Mutu Sarjana & Diploma - Pasal 47 Ayat (4) */
                <table className="table-rps text-center">
                  <thead>
                    <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold" }}>
                      <th colSpan={4} style={{ textAlign: "left", fontWeight: "900", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px" }}>
                        Bentuk Penilaian Nilai Mutu Jenjang Diploma, Sarjana (S1), Sarjana Terapan, dan Profesi (Pasal 47 Ayat 4 Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik)
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#f1f5f9", fontWeight: "bold", fontSize: "9.5px", color: "#0f172a" }}>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Rentang Nilai</th>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Nilai Huruf</th>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Nilai Angka</th>
                      <th style={{ backgroundColor: "#f1f5f9", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "4px" }}>Kategori Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>85 - 100</td>
                      <td style={{ fontWeight: 900, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>A</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>4,00</td>
                      <td style={{ fontWeight: 600, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>Sangat Baik</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>70 - 84,99</td>
                      <td style={{ fontWeight: 900, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>B</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>3,00</td>
                      <td style={{ fontWeight: 600, color: "#15803d", border: "0.75px solid #94a3b8", padding: "4px" }}>Baik</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, border: "0.75px solid #94a3b8", padding: "4px" }}>55 - 69,99</td>
                      <td style={{ fontWeight: 900, color: "#b45309", border: "0.75px solid #94a3b8", padding: "4px" }}>C</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>2,00</td>
                      <td style={{ color: "#b45309", border: "0.75px solid #94a3b8", padding: "4px" }}>Cukup</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: "#be123c", border: "0.75px solid #94a3b8", padding: "4px" }}>40 - 54,99</td>
                      <td style={{ fontWeight: 900, color: "#be123c", border: "0.75px solid #94a3b8", padding: "4px" }}>D</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>1,00</td>
                      <td style={{ color: "#be123c", border: "0.75px solid #94a3b8", padding: "4px" }}>Kurang</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: "#dc2626", border: "0.75px solid #94a3b8", padding: "4px" }}>0 - 39,99</td>
                      <td style={{ fontWeight: 900, color: "#dc2626", border: "0.75px solid #94a3b8", padding: "4px" }}>E</td>
                      <td style={{ border: "0.75px solid #94a3b8", padding: "4px" }}>0</td>
                      <td style={{ fontWeight: 900, color: "#dc2626", border: "0.75px solid #94a3b8", padding: "4px" }}>Gagal</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* VII. RUBRIK PENILAIAN OBE (ASSESSMENT RUBRICS) */}
            {rpsData.rubrics && rpsData.rubrics.length > 0 && (
              <div className="mb-2">
                <table className="table-rps mb-0">
                  <thead>
                    <tr style={{ backgroundColor: "#14532d", color: "#ffffff" }}>
                      <th
                        colSpan={6}
                        className="text-left px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-white"
                        style={{ backgroundColor: "#14532d", color: "#ffffff" }}
                      >
                        VII. Rubrik Penilaian OBE per Sasaran Pembelajaran (Criteria &amp; Performance Indicators)
                      </th>
                    </tr>
                  </thead>
                </table>

                {rpsData.rubrics.map((rubric) => (
                  <div key={rubric.id} className="mb-2 border border-slate-400 bg-white" style={{ border: "0.75px solid #94a3b8", marginBottom: "8px" }}>
                    <div
                      className="px-2.5 py-1 text-[10px] font-bold border-b border-slate-300 flex items-center justify-between"
                      style={{ backgroundColor: "#f0fdf4", color: "#14532d", borderBottom: "0.75px solid #94a3b8", padding: "5px 8px" }}
                    >
                      <div>
                        <span
                          className="font-mono"
                          style={{ backgroundColor: "#14532d", color: "#ffffff", padding: "2px 6px", borderRadius: "3px", marginRight: "6px", fontSize: "9px", fontWeight: "bold" }}
                        >
                          {rubric.objectiveRef}
                        </span>
                        <strong>{rubric.objectiveTitle || rubric.objectiveRef}</strong>
                        {rubric.targetBloomLevel && (
                          <span
                            className="ml-1.5"
                            style={{ backgroundColor: "#fef3c7", color: "#78350f", border: "1px solid #f59e0b", padding: "1px 5px", borderRadius: "3px", fontSize: "8.5px", marginLeft: "6px" }}
                          >
                            [{rubric.targetBloomLevel}]
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "9px", color: "#475569", fontWeight: 600 }}>
                        Metode: <strong style={{ color: "#0f172a" }}>{rubric.assessmentMethod}</strong>
                      </span>
                    </div>

                    <table className="table-rps mb-0 text-[9px]" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#e2e8f0", color: "#0f172a", fontWeight: "bold", textAlign: "center" }}>
                          <th style={{ width: "18%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px", fontWeight: "bold" }}>Kriteria &amp; Bobot</th>
                          <th style={{ width: "22%", textAlign: "left", backgroundColor: "#e2e8f0", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px", fontWeight: "bold" }}>Indikator Kinerja</th>
                          <th style={{ width: "16%", textAlign: "center", backgroundColor: "#dcfce7", color: "#14532d", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>
                            Sangat Baik (85-100) [A]
                          </th>
                          <th style={{ width: "16%", textAlign: "center", backgroundColor: "#dbeafe", color: "#1e3a8a", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>
                            Baik (70-84) [B]
                          </th>
                          <th style={{ width: "14%", textAlign: "center", backgroundColor: "#fef3c7", color: "#b45309", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>
                            Cukup (55-69) [C]
                          </th>
                          <th style={{ width: "14%", textAlign: "center", backgroundColor: "#ffe4e6", color: "#be123c", fontWeight: "bold", border: "0.75px solid #94a3b8", padding: "5px" }}>
                            Kurang (&lt;55) [D/E]
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rubric.criteria.map((crit) => (
                          <tr key={crit.id} className="align-top">
                            <td style={{ width: "18%", backgroundColor: "#f8fafc", color: "#0f172a", border: "0.75px solid #94a3b8", padding: "5px", verticalAlign: "top" }}>
                              <div style={{ fontWeight: "bold" }}>{crit.name}</div>
                              <div style={{ fontFamily: "monospace", color: "#15803d", fontSize: "8.5px", fontWeight: "bold", marginTop: "2px" }}>
                                Bobot: {crit.weightPercent}%
                              </div>
                            </td>
                            <td style={{ width: "22%", backgroundColor: "#ffffff", color: "#1e293b", border: "0.75px solid #94a3b8", padding: "5px", verticalAlign: "top", fontSize: "9px", lineHeight: "1.35" }}>
                              {crit.indicator}
                            </td>
                            <td style={{ width: "16%", backgroundColor: "#f0fdf4", color: "#064e3b", border: "0.75px solid #94a3b8", padding: "5px", verticalAlign: "top", fontSize: "8.5px", lineHeight: "1.35" }}>
                              {crit.levels.sangatBaik}
                            </td>
                            <td style={{ width: "16%", backgroundColor: "#eff6ff", color: "#1e3a8a", border: "0.75px solid #94a3b8", padding: "5px", verticalAlign: "top", fontSize: "8.5px", lineHeight: "1.35" }}>
                              {crit.levels.baik}
                            </td>
                            <td style={{ width: "14%", backgroundColor: "#fffbeb", color: "#78350f", border: "0.75px solid #94a3b8", padding: "5px", verticalAlign: "top", fontSize: "8.5px", lineHeight: "1.35" }}>
                              {crit.levels.cukup}
                            </td>
                            <td style={{ width: "14%", backgroundColor: "#fff1f2", color: "#881337", border: "0.75px solid #94a3b8", padding: "5px", verticalAlign: "top", fontSize: "8.5px", lineHeight: "1.35" }}>
                              {crit.levels.kurang}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-slate-300 text-right text-[8.5px] text-slate-600 font-semibold italic">
              Dokumen RPS Berbasis OBE {rpsData.namaProdi ? rpsData.namaProdi : "Program Studi"} &copy; {rpsData.namaFakultas ? `${rpsData.namaFakultas} ` : ""}{rpsData.namaKampus || "Universitas Pattimura Ambon"}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* MODAL KUSTOMISASI KOP SURAT RESMI & FOOTER PDF UNPATTI */}
      <UnpattiPdfHeaderFooterModal
        isOpen={isKopModalOpen}
        onClose={() => setIsKopModalOpen(false)}
        rpsData={rpsData}
        config={kopConfig}
        onSaveConfig={(cfg) => {
          setKopConfig(cfg);
          try {
            localStorage.setItem("unpatti_pdf_kop_config", JSON.stringify(cfg));
          } catch (e) {}
          showNotification("Pengaturan Kop Surat & Footer PDF berhasil disimpan!", "success");
        }}
        onTriggerExportPdf={handleDownloadPdf}
      />
    </div>
  );
};
