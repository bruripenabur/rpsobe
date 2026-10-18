import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Database,
  Globe,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Download,
  Upload,
  Check,
  CheckSquare,
  Square,
  Bookmark,
  Sparkles,
  X,
  RefreshCw,
  FileText,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { ReferenceItem, SourceType, KategoriPustaka } from "../types/reference";
import {
  getStoredReferences,
  saveReference,
  deleteReference,
  resetReferenceDatabase,
  generateApaCitation,
  exportReferencesJson,
  importReferencesJson,
} from "../utils/referenceDatabase";
import { searchOnlineLibrary, OnlineSearchResult } from "../utils/externalLibraryApi";

interface ReferenceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourseName: string;
  onInsertToRps: (selectedCitations: string[], category: "utama" | "pendukung" | "gabungan") => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ReferenceLibraryModal: React.FC<ReferenceLibraryModalProps> = ({
  isOpen,
  onClose,
  currentCourseName,
  onInsertToRps,
  showNotification,
}) => {
  const [activeTab, setActiveTab] = useState<"local" | "online" | "add">("local");

  // State Pustaka Lokal
  const [localReferences, setLocalReferences] = useState<ReferenceItem[]>([]);
  const [localSearch, setLocalSearch] = useState("");
  const [selectedBidang, setSelectedBidang] = useState<string>("Semua");
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>("Semua");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State Pustaka Online (Eksternal)
  const [onlineQuery, setOnlineQuery] = useState(currentCourseName || "");
  const [onlineSource, setOnlineSource] = useState<"crossref" | "openalex" | "openlibrary">("crossref");
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState<ReferenceItem[]>([]);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [onlineSourceLabel, setOnlineSourceLabel] = useState<string>("");

  // State Form Tambah Pustaka Baru
  const [newTitle, setNewTitle] = useState("");
  const [newAuthors, setNewAuthors] = useState("");
  const [newYear, setNewYear] = useState<string>(new Date().getFullYear().toString());
  const [newSourceType, setNewSourceType] = useState<SourceType>("buku");
  const [newPublisher, setNewPublisher] = useState("");
  const [newCityOrUrl, setNewCityOrUrl] = useState("");
  const [newDoi, setNewDoi] = useState("");
  const [newKategori, setNewKategori] = useState<KategoriPustaka>("utama");
  const [newBidang, setNewBidang] = useState("Penyuluhan Pertanian");

  // Load database lokal saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      const data = getStoredReferences();
      setLocalReferences(data);
      if (currentCourseName && !onlineQuery) {
        setOnlineQuery(currentCourseName);
      }
    }
  }, [isOpen, currentCourseName]);

  if (!isOpen) return null;

  // Kategori bidang yang tersedia
  const bidangList = [
    "Semua",
    "Bina Mulia Ke Lautan",
    "Penyuluhan Pertanian",
    "Kemiskinan & Sosiologi",
    "Agribisnis & Ekonomi Pertanian",
    "Agroekosistem & Budidaya",
    "Metodologi Penelitian",
    "Umum & Regulasi",
  ];

  // Filter daftar lokal
  const filteredLocal = localReferences.filter((item) => {
    const matchesSearch =
      localSearch.trim() === "" ||
      item.title.toLowerCase().includes(localSearch.toLowerCase()) ||
      item.authors.toLowerCase().includes(localSearch.toLowerCase()) ||
      item.formattedCitation.toLowerCase().includes(localSearch.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(localSearch.toLowerCase())));

    const matchesBidang = selectedBidang === "Semua" || item.bidangMataKuliah === selectedBidang;
    const matchesKategori =
      selectedKategoriFilter === "Semua" || item.kategoriPustaka === selectedKategoriFilter;

    return matchesSearch && matchesBidang && matchesKategori;
  });

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAllFiltered = () => {
    if (selectedIds.size === filteredLocal.length && filteredLocal.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLocal.map((item) => item.id)));
    }
  };

  // Insert Terpilih ke RPS
  const handleInsertSelected = (category: "utama" | "pendukung" | "gabungan") => {
    if (selectedIds.size === 0) {
      showNotification("Pilih minimal satu referensi terlebih dahulu!", "info");
      return;
    }

    const selectedItems = localReferences.filter((r) => selectedIds.has(r.id));
    const citations = selectedItems.map((r) => r.formattedCitation);

    onInsertToRps(citations, category);
    showNotification(
      `Berhasil menyisipkan ${selectedItems.length} pustaka ke RPS!`,
      "success"
    );
    setSelectedIds(new Set());
    onClose();
  };

  // Insert single item langsung
  const handleInsertSingle = (
    item: ReferenceItem,
    category: "utama" | "pendukung"
  ) => {
    onInsertToRps([item.formattedCitation], category);
    showNotification(
      `Pustaka "${item.title.slice(0, 35)}..." berhasil disisipkan ke Pustaka ${
        category === "utama" ? "Utama" : "Pendukung"
      }!`,
      "success"
    );
  };

  // Simpan item online ke database lokal
  const handleSaveOnlineToLocal = (item: ReferenceItem) => {
    const updated = saveReference({
      ...item,
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      isCustom: true,
    });
    setLocalReferences(updated);
    showNotification(`Pustaka berhasil disimpan ke Database Lokal Anda!`, "success");
  };

  // Hapus item dari database lokal
  const handleDeleteLocal = (id: string, title: string) => {
    if (window.confirm(`Hapus referensi "${title.slice(0, 40)}..." dari database lokal?`)) {
      const updated = deleteReference(id);
      setLocalReferences(updated);
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
      showNotification("Pustaka berhasil dihapus dari database lokal.", "info");
    }
  };

  // Reset database lokal ke default
  const handleResetToDefault = () => {
    if (
      window.confirm(
        "Kembalikan database pustaka ke koleksi standar resmi Universitas Pattimura? Data kustom tambahan Anda akan direset."
      )
    ) {
      const reset = resetReferenceDatabase();
      setLocalReferences(reset);
      setSelectedIds(new Set());
      showNotification("Database pustaka berhasil direset ke standar UNPATTI.", "success");
    }
  };

  // Ekspor / Impor JSON
  const handleExportJson = () => {
    const jsonStr = exportReferencesJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Database_Pustaka_RPS_UNPATTI_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Database pustaka berhasil diekspor ke format JSON.", "success");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importReferencesJson(text);
        setLocalReferences(imported);
        showNotification(
          `Berhasil mengimpor data pustaka! Total pustaka: ${imported.length}`,
          "success"
        );
      } catch (err: any) {
        showNotification(err.message || "Gagal mengimpor berkas JSON", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Cari Online
  const handleSearchOnline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = onlineQuery.trim();
    if (!query) {
      showNotification("Ketik judul mata kuliah atau topik pencarian!", "info");
      return;
    }

    setIsSearchingOnline(true);
    setOnlineError(null);

    try {
      const result: OnlineSearchResult = await searchOnlineLibrary(query, onlineSource, "Umum");
      setOnlineResults(result.items);
      setOnlineSourceLabel(result.sourceName);
      if (result.items.length === 0) {
        setOnlineError("Tidak ditemukan referensi yang cocok dengan kata kunci tersebut. Coba kata kunci lain.");
      }
    } catch (err: any) {
      setOnlineError(
        "Koneksi ke pustaka eksternal terhambat atau batas waktu habis. Periksa koneksi internet Anda atau coba sumber lainnya."
      );
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Submit Form Tambah Referensi Baru
  const handleCreateNewReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthors.trim()) {
      showNotification("Judul dan Penulis wajib diisi!", "error");
      return;
    }

    const newRef: ReferenceItem = {
      id: `user-${Date.now()}`,
      title: newTitle.trim(),
      authors: newAuthors.trim(),
      year: newYear.trim() || new Date().getFullYear().toString(),
      sourceType: newSourceType,
      publisherOrJournal: newPublisher.trim(),
      cityOrUrl: newCityOrUrl.trim(),
      doi: newDoi.trim(),
      kategoriPustaka: newKategori,
      bidangMataKuliah: newBidang,
      formattedCitation: generateApaCitation({
        title: newTitle,
        authors: newAuthors,
        year: newYear,
        publisherOrJournal: newPublisher,
        cityOrUrl: newCityOrUrl,
        doi: newDoi,
      }),
      isCustom: true,
      tags: ["Kustom Dosen", newBidang],
    };

    const updated = saveReference(newRef);
    setLocalReferences(updated);
    showNotification("Pustaka baru berhasil disimpan ke Database Lokal!", "success");

    // Reset Form
    setNewTitle("");
    setNewAuthors("");
    setNewPublisher("");
    setNewCityOrUrl("");
    setNewDoi("");
    setActiveTab("local");
  };

  // Live preview format APA untuk form tambah baru
  const livePreviewCitation = generateApaCitation({
    title: newTitle || "[Judul Buku/Jurnal]",
    authors: newAuthors || "[Nama Penulis]",
    year: newYear || "2024",
    publisherOrJournal: newPublisher || "[Nama Penerbit/Jurnal]",
    cityOrUrl: newCityOrUrl,
    doi: newDoi,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* HEADER MODAL */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-white">
                Database Pustaka &amp; Referensi RPS UNPATTI
                <span className="text-[10px] uppercase font-bold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full">
                  APA 7th Edition
                </span>
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Pilih dari database lokal tersimpan atau hubungkan langsung dengan pustaka eksternal online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-2 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("local")}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "local"
                  ? "bg-white text-emerald-800 border-t-2 border-x border-emerald-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Database Pustaka Lokal</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black">
                {localReferences.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("online")}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "online"
                  ? "bg-white text-cyan-800 border-t-2 border-x border-cyan-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-600" />
              <span>Cari Pustaka Eksternal (Online)</span>
              <span className="ml-1 text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 font-bold">
                CrossRef • OpenAlex
              </span>
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "add"
                  ? "bg-white text-indigo-800 border-t-2 border-x border-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Tambah Referensi Baru</span>
            </button>
          </div>

          {/* Quick Stats or Action */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 pb-1">
            <span>Mata Kuliah:</span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">
              {currentCourseName || "Umum"}
            </span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50">
          {/* ================= TAB 1: DATABASE LOKAL ================= */}
          {activeTab === "local" && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan judul, penulis, tahun, atau kata kunci..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 font-medium"
                    />
                    {localSearch && (
                      <button
                        onClick={() => setLocalSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedKategoriFilter}
                      onChange={(e) => setSelectedKategoriFilter(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="utama">Pustaka Utama</option>
                      <option value="pendukung">Pustaka Pendukung</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleExportJson}
                        title="Ekspor Database Pustaka ke JSON"
                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <label
                        title="Impor Database Pustaka dari JSON"
                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer transition"
                      >
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportJson}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={handleResetToDefault}
                        title="Reset ke Koleksi Standar UNPATTI"
                        className="p-2 border border-slate-300 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Bidang / Subjek Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Bidang Kajian:</span>
                  {bidangList.map((bidang) => (
                    <button
                      key={bidang}
                      onClick={() => setSelectedBidang(bidang)}
                      className={`text-[10.5px] px-2.5 py-1 rounded-full font-bold transition-all ${
                        selectedBidang === bidang
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {bidang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection Summary Bar */}
              <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAllFiltered}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-950"
                  >
                    {selectedIds.size > 0 && selectedIds.size === filteredLocal.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedIds.size > 0 && selectedIds.size === filteredLocal.length
                        ? "Batal Pilih Semua"
                        : "Pilih Semua Hasil"}
                    </span>
                  </button>
                  <span className="text-xs text-emerald-800 font-semibold">
                    (<strong>{selectedIds.size}</strong> dari {filteredLocal.length} referensi dipilih)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInsertSelected("utama")}
                    disabled={selectedIds.size === 0}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sisipkan ke Pustaka Utama</span>
                  </button>

                  <button
                    onClick={() => handleInsertSelected("pendukung")}
                    disabled={selectedIds.size === 0}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold bg-cyan-700 text-white hover:bg-cyan-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Sisipkan ke Pustaka Pendukung</span>
                  </button>

                  <button
                    onClick={() => handleInsertSelected("gabungan")}
                    disabled={selectedIds.size === 0}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    Sisipkan Gabungan
                  </button>
                </div>
              </div>

              {/* Reference Cards List */}
              <div className="space-y-2.5">
                {filteredLocal.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">Tidak ada referensi yang sesuai</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Coba ganti kata kunci pencarian, atau gunakan tab{" "}
                      <strong>Cari Pustaka Eksternal (Online)</strong> untuk mencari referensi jurnal/buku dari CrossRef &amp; OpenAlex.
                    </p>
                  </div>
                ) : (
                  filteredLocal.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all bg-white flex items-start gap-3 ${
                          isSelected
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(item.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-700 shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-emerald-700" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${
                                item.kategoriPustaka === "utama"
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : "bg-cyan-100 text-cyan-900 border border-cyan-300"
                              }`}
                            >
                              Pustaka {item.kategoriPustaka === "utama" ? "Utama" : "Pendukung"}
                            </span>

                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {item.sourceType.toUpperCase()}
                            </span>

                            <span className="text-[10px] font-semibold text-slate-600 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                              {item.bidangMataKuliah}
                            </span>

                            {item.doi && (
                              <a
                                href={item.doi.startsWith("http") ? item.doi : `https://doi.org/${item.doi}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-blue-700 hover:underline flex items-center gap-1 font-mono"
                              >
                                <span>DOI</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>

                          {/* APA Citation Box */}
                          <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-serif text-slate-800 leading-relaxed">
                            {item.formattedCitation}
                          </div>

                          {/* Action Buttons for this item */}
                          <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <span>Penulis: <strong>{item.authors}</strong></span>
                              <span>•</span>
                              <span>Tahun: <strong>{item.year}</strong></span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleInsertSingle(item, "utama")}
                                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-200 transition"
                              >
                                + Pustaka Utama
                              </button>
                              <button
                                onClick={() => handleInsertSingle(item, "pendukung")}
                                className="text-[11px] font-bold text-cyan-800 hover:text-cyan-950 bg-cyan-100/70 hover:bg-cyan-100 px-2.5 py-1 rounded border border-cyan-200 transition"
                              >
                                + Pustaka Pendukung
                              </button>
                              <button
                                onClick={() => handleDeleteLocal(item.id, item.title)}
                                title="Hapus dari database"
                                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: PUSTAKA EKSTERNAL (ONLINE) ================= */}
          {activeTab === "online" && (
            <div className="space-y-4">
              {/* Online Search Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <form onSubmit={handleSearchOnline} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600" />
                      <input
                        type="text"
                        placeholder="Ketik topik, judul buku, jurnal, atau nama mata kuliah (misal: Sosiologi Pertanian, Sasi Laut, Kewirausahaan)..."
                        value={onlineQuery}
                        onChange={(e) => setOnlineQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-slate-800 font-semibold"
                      />
                    </div>

                    <select
                      value={onlineSource}
                      onChange={(e) => setOnlineSource(e.target.value as any)}
                      className="text-xs border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-700 bg-white focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="crossref">CrossRef (Jurnal &amp; Buku Ber-DOI)</option>
                      <option value="openalex">OpenAlex (Scholarly Works Global)</option>
                      <option value="openlibrary">Open Library (Buku Teks Dunia)</option>
                    </select>

                    <button
                      type="submit"
                      disabled={isSearchingOnline}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-700 to-teal-700 hover:from-cyan-800 hover:to-teal-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSearchingOnline ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mencari Online...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Cari Pustaka Online</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 text-slate-600 text-[10.5px]">
                    <span className="font-bold text-slate-500">Saran Kata Kunci:</span>
                    {currentCourseName && (
                      <button
                        type="button"
                        onClick={() => {
                          setOnlineQuery(currentCourseName);
                        }}
                        className="bg-cyan-50 text-cyan-800 hover:bg-cyan-100 px-2 py-0.5 rounded font-bold border border-cyan-200"
                      >
                        {currentCourseName}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setOnlineQuery("Penyuluhan Pertanian")}
                      className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700"
                    >
                      Penyuluhan Pertanian
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlineQuery("Bina Mulia Ke Lautan")}
                      className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700"
                    >
                      Bina Mulia Ke Lautan
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlineQuery("Agroekosistem Kepulauan")}
                      className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700"
                    >
                      Agroekosistem Kepulauan
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlineQuery("Kemiskinan Multidimensi")}
                      className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700"
                    >
                      Kemiskinan Multidimensi
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlineQuery("Kewirausahaan Agribisnis")}
                      className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700"
                    >
                      Kewirausahaan Agribisnis
                    </button>
                  </div>
                </form>
              </div>

              {/* Online Results Container */}
              {isSearchingOnline && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Menghubungi repositori pustaka eksternal online...
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Mengambil data bibliografi, penulis, tahun, dan DOI untuk diformat ke standar APA 7th Edition.
                  </p>
                </div>
              )}

              {onlineError && !isSearchingOnline && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">{onlineError}</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Anda tetap dapat memilih dari <strong>Database Pustaka Lokal</strong> atau memasukkan data buku secara manual di tab <strong>Tambah Referensi Baru</strong>.
                    </p>
                  </div>
                </div>
              )}

              {!isSearchingOnline && onlineResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="font-bold text-slate-800">
                      Hasil Pencarian Online ({onlineResults.length} referensi ditemukan via {onlineSourceLabel})
                    </span>
                    <span className="text-[11px] text-cyan-800 font-semibold">
                      Klik tombol untuk menyisipkan ke RPS atau simpan ke Database Lokal
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {onlineResults.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300">
                            {item.sourceType.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {item.publisherOrJournal}
                          </span>
                          {item.doi && (
                            <a
                              href={item.doi.startsWith("http") ? item.doi : `https://doi.org/${item.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-700 hover:underline flex items-center gap-1 font-mono"
                            >
                              <span>DOI Terindeks</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>

                        {/* APA Citation Preview */}
                        <div className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-serif text-slate-800 leading-relaxed">
                          {item.formattedCitation}
                        </div>

                        {/* Action buttons */}
                        <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10.5px] text-slate-500 font-medium">
                            Penulis: <strong>{item.authors}</strong> ({item.year})
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveOnlineToLocal(item)}
                              className="text-[10.5px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-300 transition flex items-center gap-1"
                              title="Simpan referensi ini ke database lokal agar bisa dipakai lagi"
                            >
                              <Bookmark className="w-3 h-3 text-amber-600" />
                              <span>Simpan ke Database</span>
                            </button>

                            <button
                              onClick={() => handleInsertSingle(item, "utama")}
                              className="text-[10.5px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300 transition"
                            >
                              + Pustaka Utama
                            </button>

                            <button
                              onClick={() => handleInsertSingle(item, "pendukung")}
                              className="text-[10.5px] font-bold text-cyan-800 hover:text-cyan-950 bg-cyan-100/80 hover:bg-cyan-100 px-2.5 py-1 rounded border border-cyan-300 transition"
                            >
                              + Pustaka Pendukung
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: TAMBAH REFERENSI BARU ================= */}
          {activeTab === "add" && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    Tambah Referensi ke Database Pustaka
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukkan data pustaka buku, artikel jurnal, atau regulasi. Sistem akan otomatis menyusun sitasi standar APA 7th Edition.
                  </p>
                </div>

                <form onSubmit={handleCreateNewReference} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Judul Buku / Judul Artikel Jurnal <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Sosiologi Pembangunan dan Kemiskinan di Wilayah Pesisir"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jenis Sumber
                      </label>
                      <select
                        value={newSourceType}
                        onChange={(e) => setNewSourceType(e.target.value as SourceType)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 bg-white"
                      >
                        <option value="buku">Buku Teks</option>
                        <option value="jurnal">Artikel Jurnal</option>
                        <option value="prosiding">Prosiding Seminar</option>
                        <option value="regulasi">Peraturan / Regulasi</option>
                        <option value="website">Laporan / Website Resmi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Penulis (Format: Nama Belakang, Inisial) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Wattimena, A. Y., & Tuhumury, M. T."
                        value={newAuthors}
                        onChange={(e) => setNewAuthors(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tahun Terbit <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 2023"
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Penerbit / Nama Jurnal
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Unpatti Press / Jurnal Agribisnis"
                        value={newPublisher}
                        onChange={(e) => setNewPublisher(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kota Terbit atau URL
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Ambon atau https://..."
                        value={newCityOrUrl}
                        onChange={(e) => setNewCityOrUrl(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nomor DOI (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 10.30598/jak.2023.1"
                        value={newDoi}
                        onChange={(e) => setNewDoi(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kategori Default di RPS
                      </label>
                      <select
                        value={newKategori}
                        onChange={(e) => setNewKategori(e.target.value as KategoriPustaka)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 bg-white"
                      >
                        <option value="utama">Pustaka Utama</option>
                        <option value="pendukung">Pustaka Pendukung</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bidang Mata Kuliah
                      </label>
                      <select
                        value={newBidang}
                        onChange={(e) => setNewBidang(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 bg-white"
                      >
                        {bidangList
                          .filter((b) => b !== "Semua")
                          .map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Live Citation Preview */}
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Pratinjau Format Sitasi Standar APA 7th Edition:
                    </span>
                    <p className="text-xs font-serif text-slate-900 leading-relaxed font-medium">
                      {livePreviewCitation}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Simpan Referensi ke Database Lokal</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>
              Format sitasi mengikuti pedoman APA 7th Edition &amp; Standar Kurikulum OBE Universitas Pattimura.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg transition"
          >
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
