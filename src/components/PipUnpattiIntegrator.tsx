import React, { useState } from "react";
import {
  Compass,
  Anchor,
  Waves,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  BookOpen,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  Sailboat,
  Fish,
  Trees,
} from "lucide-react";
import { RpsData } from "../types/rps";
import { PIP_UNPATTI_LIST, PIP_CATEGORIES } from "../data/pipDefaults";

interface PipUnpattiIntegratorProps {
  rpsData: RpsData;
  setRpsData: React.Dispatch<React.SetStateAction<RpsData>>;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const PipUnpattiIntegrator: React.FC<PipUnpattiIntegratorProps> = ({
  rpsData,
  setRpsData,
  showNotification,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const selectedIds = rpsData.selectedPipItems || [];

  const togglePip = (id: string) => {
    setRpsData((prev) => {
      const current = prev.selectedPipItems || [];
      const exists = current.includes(id);
      const updated = exists ? current.filter((x) => x !== id) : [...current, id];
      return {
        ...prev,
        selectedPipItems: updated,
      };
    });
  };

  const handleSelectAll = () => {
    setRpsData((prev) => ({
      ...prev,
      selectedPipItems: PIP_UNPATTI_LIST.map((item) => item.id),
    }));
    showNotification("Seluruh 12 butir PIP Bina Mulia Ke Lautan dipilih!", "success");
  };

  const handleClearAll = () => {
    setRpsData((prev) => ({
      ...prev,
      selectedPipItems: [],
    }));
    showNotification("Pilihan butir PIP Unpatti dikosongkan.", "info");
  };

  const handlePresetPenyuluhan = () => {
    const preset = ["BMK-01", "BMK-02", "BMK-04", "BMK-05", "BMK-12"];
    setRpsData((prev) => ({
      ...prev,
      selectedPipItems: preset,
    }));
    showNotification("Preset PIP Penyuluhan Pertanian & Kemiskinan Kepulauan diterapkan!", "success");
  };

  const handlePresetPerikanan = () => {
    const preset = ["BMK-03", "BMK-04", "BMK-06", "BMK-07", "BMK-12"];
    setRpsData((prev) => ({
      ...prev,
      selectedPipItems: preset,
    }));
    showNotification("Preset PIP Kelautan & Perikanan diterapkan!", "success");
  };

  const handlePresetSosioHumaniora = () => {
    const preset = ["BMK-02", "BMK-04", "BMK-05", "BMK-11"];
    setRpsData((prev) => ({
      ...prev,
      selectedPipItems: preset,
    }));
    showNotification("Preset PIP Sosial Budaya & Hukum Adat diterapkan!", "success");
  };

  // Filter items
  const filteredItems = PIP_UNPATTI_LIST.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua Kategori" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="border-2 border-cyan-400/80 bg-gradient-to-br from-cyan-50/70 via-sky-50/40 to-blue-50/60 rounded-xl p-3.5 shadow-sm transition-all duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-700 text-white shadow-xs">
              <Compass className="w-4 h-4 text-cyan-200 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <label className="text-xs font-black text-cyan-950 flex items-center gap-1.5">
                Integrasi PIP Unpatti (Bina Mulia Ke Lautan)
                <span className="text-[9.5px] font-black uppercase tracking-wider text-cyan-800 bg-cyan-100/90 border border-cyan-300 px-1.5 py-0.2 rounded-md">
                  Pola Ilmiah Pokok
                </span>
              </label>
              <p className="text-[10.5px] text-cyan-800 font-medium">
                Pola Ilmiah Pokok UNPATTI: Orientasi kurikulum &amp; Tri Dharma berbasis wilayah kepulauan-kelautan
              </p>
            </div>
          </div>
        </div>

        {/* Counter and Toggle buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10.5px] font-black text-cyan-900 bg-cyan-100 border border-cyan-300 px-2 py-0.5 rounded-md shadow-2xs">
            {selectedIds.length} Poin Terpilih
          </span>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`text-[10px] px-2 py-1 rounded font-bold transition flex items-center gap-1 border ${
              showGuide
                ? "bg-slate-900 text-cyan-300 border-slate-700"
                : "bg-cyan-700 hover:bg-cyan-800 text-white border-cyan-600"
            }`}
            title="Lihat pedoman dan landasan hukum PIP Bina Mulia Ke Lautan"
          >
            <BookOpen className="w-3 h-3 text-cyan-200" />
            <span>{showGuide ? "Tutup Panduan" : "Panduan PIP"}</span>
          </button>
        </div>
      </div>

      {/* Preset Toolbar & Filters */}
      <div className="bg-white/90 border border-cyan-200 rounded-lg p-2 mb-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            <span className="text-slate-500 font-bold flex items-center gap-1 mr-0.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Preset:
            </span>
            <button
              type="button"
              onClick={handlePresetPenyuluhan}
              className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold transition"
            >
              Pertanian &amp; Dusung Kepulauan
            </button>
            <button
              type="button"
              onClick={handlePresetPerikanan}
              className="px-2 py-0.5 rounded bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-300 font-bold transition"
            >
              Kelautan &amp; Marikultur
            </button>
            <button
              type="button"
              onClick={handlePresetSosioHumaniora}
              className="px-2 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 font-bold transition"
            >
              Sasi, Adat &amp; Sosial
            </button>
          </div>

          {/* Select all / Clear buttons */}
          <div className="flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold transition"
            >
              Pilih Semua
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold transition"
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-cyan-100">
          <div className="relative w-full sm:w-1/2">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-cyan-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari butir PIP (misal: sasi, dusung, oseanografi)..."
              className="w-full text-[11px] pl-6 pr-2 py-1 border border-cyan-200 rounded-md bg-cyan-50/30 text-slate-900 focus:outline-none focus:border-cyan-600"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-1/2">
            <Filter className="w-3.5 h-3.5 text-cyan-700 flex-shrink-0 hidden sm:inline-block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-[10.5px] px-2 py-1 border border-cyan-200 rounded-md bg-white text-slate-800 font-medium focus:outline-none focus:border-cyan-600"
            >
              {PIP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of PIP Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 text-[11px]">
        {filteredItems.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => togglePip(item.id)}
              className={`p-2.5 rounded-lg border-2 cursor-pointer select-none transition-all duration-150 flex items-start gap-2.5 ${
                checked
                  ? "bg-cyan-50 border-cyan-600 text-cyan-950 shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-cyan-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="pt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}} // handled by parent onClick
                  className="rounded text-cyan-700 h-4 w-4 border-slate-300 cursor-pointer focus:ring-cyan-500"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-mono text-[10px] font-black text-cyan-900 bg-cyan-100/90 border border-cyan-300/80 px-1 py-0.2 rounded">
                    {item.code}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 truncate max-w-[130px]">
                    {item.category}
                  </span>
                </div>

                <h4 className="text-[11px] font-black text-slate-900 leading-tight mb-1">
                  {item.title}
                </h4>

                <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-cyan-800">
                  <span className="truncate font-medium italic">
                    Fokus: {item.focusArea}
                  </span>
                  {checked && (
                    <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-0.5 flex-shrink-0 ml-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Terintegrasi
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Guide on PIP Bina Mulia Ke Lautan */}
      {showGuide && (
        <div className="mt-3 pt-3 border-t-2 border-cyan-300 bg-white/95 rounded-lg p-3 text-xs text-slate-800 space-y-2.5 border border-cyan-200 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-cyan-950 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              Pedoman Integrasi PIP &ldquo;Bina Mulia Ke Lautan&rdquo; ke Kurikulum OBE
            </h4>
            <span className="text-[9.5px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
              SK Rektor No. 16/SK/1988
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pola Ilmiah Pokok (PIP) Universitas Pattimura mengarahkan agar seluruh disiplin ilmu
            (Agrokompleks, Hukum, Sospol, Teknik, Kedokteran, Ekonomi, FKIP, MIPA, dan Perikanan)
            tidak terpisah dari realitas geografis Maluku sebagai provinsi kepulauan yang 92,4% wilayahnya adalah laut.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10.5px]">
            <div className="p-2 bg-cyan-50/60 rounded border border-cyan-200">
              <div className="font-black text-cyan-900 mb-0.5 flex items-center gap-1">
                <Trees className="w-3.5 h-3.5 text-emerald-700" />
                1. Rumusan Bahan Kajian
              </div>
              <p className="text-slate-600 text-[10px]">
                Sisipkan studi kasus kepulauan Maluku, kearifan lokal dusung &amp; sasi, atau dinamika rantai pasok laut.
              </p>
            </div>

            <div className="p-2 bg-blue-50/60 rounded border border-blue-200">
              <div className="font-black text-blue-900 mb-0.5 flex items-center gap-1">
                <Fish className="w-3.5 h-3.5 text-blue-700" />
                2. Formulasi CPMK &amp; Sub-CPMK
              </div>
              <p className="text-slate-600 text-[10px]">
                Gunakan KKO Bloom yang mengarahkan mahasiswa menganalisis tantangan riil masyarakat pesisir dan pulau kecil.
              </p>
            </div>

            <div className="p-2 bg-indigo-50/60 rounded border border-indigo-200">
              <div className="font-black text-indigo-900 mb-0.5 flex items-center gap-1">
                <Sailboat className="w-3.5 h-3.5 text-indigo-700" />
                3. Pembobotan Tugas &amp; Proyek
              </div>
              <p className="text-slate-600 text-[10px]">
                Arahkan tugas mandiri/kelompok ke pemecahan masalah riil daerah perbatasan/terpencil di Kepulauan Maluku.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
