import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Download,
  Copy,
  CheckCircle2,
  FileText,
  X,
  Sparkles,
  HelpCircle,
  HardDriveUpload,
} from "lucide-react";
import { RpsData } from "../types/rps";

interface GoogleDriveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rpsData: RpsData;
  onDownloadPdf: () => void;
  onExportDocx: () => void;
  showNotification: (
    message: string,
    type?: "success" | "error" | "info"
  ) => void;
}

const STORAGE_KEY_GDRIVE_URL = "unpatti_gdrive_folder_url";
const DEFAULT_GDRIVE_URL =
  "https://drive.google.com/drive/folders/1Jw5QnRd2iw4ZGIx7E7jcBUDHNrPiZUHq?usp=sharing";

export const GoogleDriveExportModal: React.FC<GoogleDriveExportModalProps> = ({
  isOpen,
  onClose,
  rpsData,
  onDownloadPdf,
  onExportDocx,
  showNotification,
}) => {
  const [folderUrl, setFolderUrl] = useState<string>(DEFAULT_GDRIVE_URL);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY_GDRIVE_URL) || DEFAULT_GDRIVE_URL;
      setFolderUrl(saved);
      setIsCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanFileName = `RPS_OBE_${(rpsData.kodeMK || "MK").replace(/[^a-zA-Z0-9]/g, "_")}_${(rpsData.namaMK || "MataKuliah").replace(/[^a-zA-Z0-9]/g, "_")}_UNPATTI`;

  const handleSaveUrl = (url: string) => {
    setFolderUrl(url);
    localStorage.setItem(STORAGE_KEY_GDRIVE_URL, url.trim());
  };

  const handleExportPdfToDrive = () => {
    const trimmed = folderUrl.trim();
    if (!trimmed) {
      showNotification("Silakan tempel URL Folder Google Drive terlebih dahulu!", "error");
      return;
    }
    handleSaveUrl(trimmed);
    // Download file PDF untuk disimpan ke link folder tujuan
    onDownloadPdf();
    showNotification(
      "File PDF RPS berhasil diekspor untuk disimpan ke folder Google Drive tujuan.",
      "success"
    );
  };

  const handleExportWordToDrive = () => {
    const trimmed = folderUrl.trim();
    if (!trimmed) {
      showNotification("Silakan tempel URL Folder Google Drive terlebih dahulu!", "error");
      return;
    }
    handleSaveUrl(trimmed);
    // Download file Word (.docx) untuk disimpan ke link folder tujuan
    onExportDocx();
    showNotification(
      "File Word (.docx) RPS berhasil diekspor untuk disimpan ke folder Google Drive tujuan.",
      "success"
    );
  };

  const handleCopyFileName = () => {
    navigator.clipboard.writeText(`${cleanFileName}.pdf`);
    setIsCopied(true);
    showNotification("Nama file standar RPS disalin ke clipboard!", "info");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <HardDriveUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Ekspor ke Folder Google Drive</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Cloud Archive
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Simpan &amp; arsipkan dokumen RPS OBE langsung ke folder Google Drive Dosen/Prodi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target Folder URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                URL Folder Google Drive Tujuan:
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Tersimpan otomatis
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={folderUrl}
                onChange={(e) => handleSaveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/1abcXYZ..."
                className="w-full bg-slate-950 border-2 border-blue-500/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono transition"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>
                Buka Google Drive &gt; Klik kanan folder tujuan &gt; Salin link (Copy link) &gt; Tempel di atas.
              </span>
            </p>
          </div>

          {/* Target File Info */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Mata Kuliah:</span>
              <span className="text-white font-bold">{rpsData.namaMK} ({rpsData.kodeMK})</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Program Studi:</span>
              <span className="text-emerald-400 font-semibold">{rpsData.namaProdi}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Nama Berkas:</span>
              <button
                type="button"
                onClick={handleCopyFileName}
                className="text-[10px] text-cyan-300 hover:text-cyan-200 font-mono flex items-center gap-1 bg-cyan-950/50 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/30 transition"
                title="Salin nama file standar"
              >
                {isCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{cleanFileName}.pdf</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleExportPdfToDrive}
              className="w-full py-2.5 px-4 rounded-xl font-bold bg-gradient-to-r from-red-700 via-rose-700 to-red-800 hover:from-red-600 hover:to-rose-700 text-white shadow-lg border border-red-500/40 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor PDF ke Google Drive</span>
            </button>

            <button
              type="button"
              onClick={handleExportWordToDrive}
              className="w-full py-2.5 px-4 rounded-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg border border-blue-500/40 flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>Ekspor Word (.docx) ke Google Drive</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Integrasi Cloud Repository UNPATTI
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
