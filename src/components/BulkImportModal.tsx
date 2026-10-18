import React, { useState, useRef } from "react";
import {
  Upload,
  ClipboardPaste,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import JSZip from "jszip";

export type BulkImportType = "cpl" | "cpmk" | "subcpmk";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: BulkImportType;
  title: string;
  defaultCpmkRef?: string;
  existingCount: number;
  availableCpmkList?: { id: string; desc: string }[];
  onImport: (items: any[]) => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  defaultCpmkRef = "CPMK 1",
  existingCount,
  availableCpmkList = [],
  onImport,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Helper untuk parsing teks masukan menjadi item terstruktur
  const parseLinesToItems = (rawText: string) => {
    const rawLines = rawText.split(/\r?\n/);
    const cleanedLines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);

    if (type === "cpl") {
      const results: { id: string; category: "Sikap" | "Keterampilan Umum" | "Keterampilan Khusus" | "Penguasaan Pengetahuan" | "Integrasi (S, P, K)"; desc: string }[] = [];
      cleanedLines.forEach((line, idx) => {
        let desc = line;
        let category: "Sikap" | "Keterampilan Umum" | "Keterampilan Khusus" | "Penguasaan Pengetahuan" | "Integrasi (S, P, K)" = "Keterampilan Khusus";

        // Deteksi kategori di dalam bracket atau tanda kurung
        const catMatch = desc.match(/[\[\(](Sikap|Keterampilan\s*Umum|Keterampilan\s*Khusus|Penguasaan\s*Pengetahuan|Pengetahuan|Integrasi)[\]\)]/i);
        if (catMatch) {
          const rawCat = catMatch[1].toLowerCase();
          if (rawCat.includes("sikap")) category = "Sikap";
          else if (rawCat.includes("umum")) category = "Keterampilan Umum";
          else if (rawCat.includes("khusus")) category = "Keterampilan Khusus";
          else if (rawCat.includes("pengetahuan")) category = "Penguasaan Pengetahuan";
          else if (rawCat.includes("integrasi")) category = "Integrasi (S, P, K)";
          desc = desc.replace(catMatch[0], "").trim();
        }

        // Deteksi ID CPL (misal: "CPL 1:", "CPL1 -", "1. ", "CPL-02:")
        const idMatch = desc.match(/^(?:CPL\s*[-_]?\s*(\d+[a-zA-Z]?)|(\d+))[\s.:\-)–—]+(.*)$/i);
        let id = `CPL${existingCount + idx + 1}`;
        if (idMatch) {
          const num = idMatch[1] || idMatch[2];
          id = `CPL${num}`;
          desc = (idMatch[3] || "").trim();
        }

        if (desc) {
          results.push({ id, category, desc });
        }
      });
      return results;
    }

    if (type === "cpmk") {
      const results: { id: string; desc: string }[] = [];
      cleanedLines.forEach((line, idx) => {
        let desc = line;
        const match = desc.match(/^(?:CPMK\s*[-_]?\s*(\d+[a-zA-Z]?)|(\d+))[\s.:\-)–—]+(.*)$/i);
        let id = `CPMK ${existingCount + idx + 1}`;
        if (match) {
          const num = match[1] || match[2];
          id = `CPMK ${num}`;
          desc = (match[3] || "").trim();
        }

        if (desc) {
          results.push({ id, desc });
        }
      });
      return results;
    }

    if (type === "subcpmk") {
      const results: { id: string; cpmkRef: string; bloom: string; desc: string }[] = [];
      cleanedLines.forEach((line, idx) => {
        let desc = line;
        let bloom = "C3-Penerapan";
        let cpmkRef = defaultCpmkRef;

        // Deteksi level Bloom di bracket misal: [C2], (C4-Analisis), [C6]
        const bloomMatch = desc.match(/[\[\(](C[1-6][^\)\]]*)[\]\)]/i);
        if (bloomMatch) {
          const code = bloomMatch[1].toUpperCase();
          if (code.startsWith("C1")) bloom = "C1-Mengingat";
          else if (code.startsWith("C2")) bloom = "C2-Pemahaman";
          else if (code.startsWith("C3")) bloom = "C3-Penerapan";
          else if (code.startsWith("C4")) bloom = "C4-Analisis";
          else if (code.startsWith("C5")) bloom = "C5-Evaluasi";
          else if (code.startsWith("C6")) bloom = "C6-Kreasi";
          desc = desc.replace(bloomMatch[0], "").trim();
        }

        // Deteksi rujukan CPMK misal: [CPMK 2], (CPMK 1)
        const refMatch = desc.match(/[\[\(](CPMK\s*\d+)[\]\)]/i);
        if (refMatch) {
          const foundRef = refMatch[1].toUpperCase().replace(/\s+/, " ");
          if (availableCpmkList.some((c) => c.id === foundRef)) {
            cpmkRef = foundRef;
          }
          desc = desc.replace(refMatch[0], "").trim();
        }

        // Deteksi ID Sub-CPMK misal: Sub-CPMK 1:, Sub-CPMK-2, 1.
        const idMatch = desc.match(/^(?:Sub\s*[-_]?\s*CPMK\s*[-_]?\s*(\d+[a-zA-Z]?)|(\d+))[\s.:\-)–—]+(.*)$/i);
        let id = `Sub-CPMK ${existingCount + idx + 1}`;
        if (idMatch) {
          const num = idMatch[1] || idMatch[2];
          id = `Sub-CPMK ${num}`;
          desc = (idMatch[3] || "").trim();
        }

        if (desc) {
          results.push({ id, cpmkRef, bloom, desc });
        }
      });
      return results;
    }

    return [];
  };

  // Helper untuk membaca berkas .txt, .json, .docx, .xlsx, .csv
  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    setSelectedFileName(file.name);

    try {
      const fileName = file.name.toLowerCase();

      // Kasus 1: JSON
      if (fileName.endsWith(".json")) {
        const text = await file.text();
        const json = JSON.parse(text);
        let itemsToImport: any[] = [];

        if (Array.isArray(json)) {
          itemsToImport = json;
        } else if (type === "cpl" && Array.isArray(json.cplList)) {
          itemsToImport = json.cplList;
        } else if (type === "cpmk" && Array.isArray(json.cpmkList)) {
          itemsToImport = json.cpmkList;
        } else if (type === "subcpmk" && Array.isArray(json.subCpmkList)) {
          itemsToImport = json.subCpmkList;
        } else {
          // Flatten teks dari JSON
          const rawLines = Object.values(json)
            .flat()
            .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
            .join("\n");
          itemsToImport = parseLinesToItems(rawLines);
        }

        if (itemsToImport.length > 0) {
          setTextInput(
            itemsToImport
              .map((it) => {
                if (typeof it === "string") return it;
                if (type === "cpl") return `[${it.category || "Keterampilan Khusus"}] ${it.id || ""}: ${it.desc || it.name || ""}`.trim();
                if (type === "cpmk") return `${it.id || ""}: ${it.desc || it.name || ""}`.trim();
                if (type === "subcpmk") return `${it.id || ""} [${it.bloom || "C3-Penerapan"}] (${it.cpmkRef || defaultCpmkRef}): ${it.desc || it.name || ""}`.trim();
                return JSON.stringify(it);
              })
              .join("\n")
          );
          showNotification(`Berhasil membaca ${itemsToImport.length} baris dari "${file.name}"!`, "success");
        } else {
          showNotification(`Tidak ditemukan data ${title} yang sesuai di berkas JSON.`, "error");
        }
        setIsProcessing(false);
        return;
      }

      // Kasus 2: Word .docx
      if (fileName.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(arrayBuffer);
        const documentXml = loadedZip.file("word/document.xml");

        if (!documentXml) {
          throw new Error("Berkas Word tidak valid.");
        }

        const xmlString = await documentXml.async("text");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");

        const pNodes = xmlDoc.getElementsByTagName("w:p");
        const paragraphs: string[] = [];
        for (let i = 0; i < pNodes.length; i++) {
          const tNodes = pNodes[i].getElementsByTagName("w:t");
          let pText = "";
          for (let j = 0; j < tNodes.length; j++) {
            pText += tNodes[j].textContent || "";
          }
          const trimmed = pText.trim();
          if (trimmed) paragraphs.push(trimmed);
        }

        const extractedText = paragraphs.join("\n");
        setTextInput(extractedText);
        showNotification(`Berhasil mengekstrak ${paragraphs.length} baris teks dari "${file.name}"!`, "success");
        setIsProcessing(false);
        return;
      }

      // Kasus 3: Excel .xlsx / .zip XML
      if (fileName.endsWith(".xlsx")) {
        const arrayBuffer = await file.arrayBuffer();
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(arrayBuffer);
        const sharedStringsFile = loadedZip.file("xl/sharedStrings.xml");

        let extractedLines: string[] = [];
        if (sharedStringsFile) {
          const xmlString = await sharedStringsFile.async("text");
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, "application/xml");
          const tNodes = xmlDoc.getElementsByTagName("t");
          for (let i = 0; i < tNodes.length; i++) {
            const val = tNodes[i].textContent?.trim();
            if (val && val.length > 2) extractedLines.push(val);
          }
        } else {
          // Fallback baca sheet1.xml
          const sheetFile = loadedZip.file("xl/worksheets/sheet1.xml");
          if (sheetFile) {
            const sheetXml = await sheetFile.async("text");
            const vMatches = sheetXml.match(/<v>([^<]+)<\/v>/g) || [];
            extractedLines = vMatches.map((m) => m.replace(/<\/?v>/g, "").trim());
          }
        }

        if (extractedLines.length > 0) {
          setTextInput(extractedLines.join("\n"));
          showNotification(`Berhasil mengekstrak ${extractedLines.length} baris sel dari "${file.name}"!`, "success");
        } else {
          const raw = await file.text();
          setTextInput(raw);
        }
        setIsProcessing(false);
        return;
      }

      // Kasus 4: Teks biasa / CSV / RTF
      const text = await file.text();
      setTextInput(text);
      showNotification(`Berhasil membaca teks dari "${file.name}"!`, "success");
    } catch (err: any) {
      console.error("Gagal membaca berkas unggahan:", err);
      showNotification(`Gagal membaca berkas: ${err?.message || "Format berkas tidak didukung"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText.trim()) {
          setTextInput((prev) => (prev ? `${prev}\n${clipText}` : clipText));
          showNotification("Teks dari clipboard berhasil ditempel!", "success");
          return;
        }
      }
      showNotification("Clipboard kosong atau izin akses tidak tersedia.", "info");
    } catch (err) {
      showNotification("Silakan gunakan tombol keyboard (Ctrl+V / Cmd+V) pada kotak teks.", "info");
    }
  };

  // Preview hasil parsing
  const parsedItems = parseLinesToItems(textInput);

  const handleApply = () => {
    if (parsedItems.length === 0) {
      showNotification("Belum ada rumusan butir yang dapat diimpor. Silakan tempel atau unggah berkas terlebih dahulu.", "error");
      return;
    }
    onImport(parsedItems);
    showNotification(`Sukses menambahkan ${parsedItems.length} butir ${title} baru ke RPS!`, "success");
    onClose();
    setTextInput("");
    setSelectedFileName(null);
  };

  // Contoh placeholder sesuai tipe
  const getExampleText = () => {
    if (type === "cpl") {
      return `Contoh Format Masukan (Setiap baris = 1 CPL):
CPL1: Mampu mengimplementasikan perilaku hidup berketuhanan dan bermartabat
[Sikap] CPL 2: Menjunjung tinggi etika akademik dan tanggung jawab profesional
[Keterampilan Khusus] CPL 3: Mampu merancang sistem penyuluhan pertanian kepulauan
[Penguasaan Pengetahuan] CPL 4: Menguasai teori komunikasi pembangunan pedesaan
CPL 5 - Mampu menerapkan pemikiran logis, kritis, dan sistematis bidang pertanian`;
    }
    if (type === "cpmk") {
      return `Contoh Format Masukan (Setiap baris = 1 CPMK):
CPMK 1: Mampu menganalisis akar masalah kemiskinan dan ketimpangan di wilayah kepulauan
CPMK 2: Mampu merancang model intervensi penyuluhan partisipatif berbasis kearifan lokal
CPMK 3: Mampu mengevaluasi efektivitas program pemberdayaan masyarakat tani
CPMK 4: Mampu mengkomunikasikan hasil kajian ilmiah secara lisan dan tulisan`;
    }
    return `Contoh Format Masukan (Setiap baris = 1 Sub-CPMK):
Sub-CPMK 1 [C2-Pemahaman] (CPMK 1): Mampu menjelaskan konsep dan indikator kemiskinan
Sub-CPMK 2 [C4-Analisis] (CPMK 1): Mampu mendiagnosis struktur kerentanan pulau-pulau kecil
Sub-CPMK 3 [C3-Penerapan] (CPMK 2): Mampu menyusun instrumen survei partisipatif (PRA)
Sub-CPMK 4 [C6-Kreasi] (CPMK 2): Mampu merancang program aksi penyuluhan terintegrasi`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border-2 border-slate-300 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Sparkles className="w-5 h-5 text-emerald-700" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>Unggah &amp; Tempel/Ketik Massal {title}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Mudah dan cepat: masukkan beberapa butir sekaligus tanpa mengetik satu per satu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Aksi Cepat */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3 flex-shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "paste"
                  ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ketik / Tempel Teks</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-white text-emerald-900 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Unggah Berkas</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition flex items-center gap-1 shadow-2xs"
              title="Tempel teks langsung dari Clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste Clipboard</span>
            </button>
            {textInput && (
              <button
                type="button"
                onClick={() => {
                  setTextInput("");
                  setSelectedFileName(null);
                }}
                className="px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition flex items-center gap-1"
                title="Kosongkan teks masukan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        </div>

        {/* Area Konten Sesuai Tab */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {activeTab === "upload" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2.5 ${
                dragActive
                  ? "border-emerald-600 bg-emerald-50/70"
                  : "border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.xlsx,.xls,.json,.txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 text-emerald-700">
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
                ) : (
                  <Upload className="w-8 h-8 text-emerald-700" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedFileName ? (
                    <span className="text-emerald-700 font-mono">{selectedFileName}</span>
                  ) : (
                    "Klik untuk memilih berkas atau seret & lepas di sini"
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  Mendukung berkas Word (.docx), Excel (.xlsx), JSON (.json), CSV, atau Teks (.txt)
                </p>
              </div>
            </div>
          )}

          {/* Area Input Teks / Hasil Ekstraksi */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Ketik atau Tempel Teks di Sini (Satu baris per butir):</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium font-mono">
                {textInput.split("\n").filter((l) => l.trim()).length} baris teks terdeteksi
              </span>
            </div>
            <textarea
              rows={6}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={getExampleText()}
              className="w-full text-xs p-3 font-mono border-2 border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none text-slate-900 bg-slate-50/40 leading-relaxed resize-y"
            />
          </div>

          {/* Pratinjau Butir yang Terdeteksi */}
          <div className="bg-slate-50 p-3 rounded-xl border-2 border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pratinjau Hasil Ekstraksi ({parsedItems.length} Butir)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {parsedItems.length > 0 ? "Siap Ditambahkan" : "Belum Ada Data"}
              </span>
            </div>

            {parsedItems.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-2 text-center">
                Belum ada butir yang terdeteksi. Silakan ketik, tempel, atau unggah berkas di atas.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {parsedItems.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] flex items-start justify-between shadow-2xs gap-2"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {item.id}
                        </span>
                        {item.category && (
                          <span className="text-[9px] text-slate-500 font-semibold">
                            [{item.category}]
                          </span>
                        )}
                        {item.bloom && (
                          <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded font-semibold">
                            {item.bloom}
                          </span>
                        )}
                        {item.cpmkRef && (
                          <span className="text-[9px] bg-blue-100 text-blue-900 border border-blue-200 px-1 rounded font-semibold">
                            {item.cpmkRef}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-medium leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Otomatis menomori ID &amp; mendeteksi kategori</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={parsedItems.length === 0}
              className="px-4 py-1.5 text-xs font-black text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Terapkan &amp; Tambahkan {parsedItems.length} Butir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
