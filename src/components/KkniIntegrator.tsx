import React, { useState } from "react";
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Check,
} from "lucide-react";
import { RpsData } from "../types/rps";
import {
  KKNI_LEVELS_LIST,
  KKNI_DESCRIPTORS_LIST,
  KKNI_CATEGORIES,
} from "../data/kkniDefaults";

interface KkniIntegratorProps {
  rpsData: RpsData;
  setRpsData: React.Dispatch<React.SetStateAction<RpsData>>;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const KkniIntegrator: React.FC<KkniIntegratorProps> = ({
  rpsData,
  setRpsData,
  showNotification,
}) => {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<number | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  const selectedItems = rpsData.selectedKkniItems || [];
  const selectedLevels = rpsData.selectedKkniLevels || [];

  // Toggle single descriptor item
  const toggleKkniItem = (id: string, itemLevel: number) => {
    setRpsData((prev) => {
      const currentItems = prev.selectedKkniItems || [];
      const currentLevels = prev.selectedKkniLevels || [];
      const exists = currentItems.includes(id);
      const updatedItems = exists
        ? currentItems.filter((x) => x !== id)
        : [...currentItems, id];

      // Auto update selectedLevels based on updatedItems
      const levelsWithSelectedItems = Array.from(
        new Set(
          KKNI_DESCRIPTORS_LIST.filter((d) => updatedItems.includes(d.id)).map(
            (d) => d.level
          )
        )
      );

      return {
        ...prev,
        selectedKkniItems: updatedItems,
        selectedKkniLevels:
          levelsWithSelectedItems.length > 0
            ? levelsWithSelectedItems
            : currentLevels.filter((lvl) => lvl !== itemLevel),
      };
    });
  };

  // Toggle or select entire Level
  const handleSelectEntireLevel = (levelNum: number) => {
    const levelItems = KKNI_DESCRIPTORS_LIST.filter((d) => d.level === levelNum).map(
      (d) => d.id
    );
    const allAlreadySelected = levelItems.every((id) => selectedItems.includes(id));

    setRpsData((prev) => {
      const currentItems = prev.selectedKkniItems || [];
      const currentLevels = prev.selectedKkniLevels || [];

      let updatedItems: string[];
      let updatedLevels: number[];

      if (allAlreadySelected) {
        // Uncheck all items for this level
        updatedItems = currentItems.filter((id) => !levelItems.includes(id));
        updatedLevels = currentLevels.filter((l) => l !== levelNum);
        showNotification(`Pilihan butir KKNI Level ${levelNum} dilepas.`, "info");
      } else {
        // Select all items for this level
        updatedItems = Array.from(new Set([...currentItems, ...levelItems]));
        updatedLevels = Array.from(new Set([...currentLevels, levelNum]));
        showNotification(
          `Semua butir KKNI Level ${levelNum} (${
            levelNum === 6
              ? "Sarjana S1/D4"
              : levelNum === 7
              ? "Profesi"
              : levelNum === 8
              ? "Magister S2"
              : "Doktor S3"
          }) telah dicentang!`,
          "success"
        );
      }

      return {
        ...prev,
        selectedKkniItems: updatedItems,
        selectedKkniLevels: updatedLevels,
      };
    });
  };

  // Presets
  const applyPresetLevel = (levelNum: number, label: string) => {
    const targetItems = KKNI_DESCRIPTORS_LIST.filter((d) => d.level === levelNum).map(
      (d) => d.id
    );
    setRpsData((prev) => ({
      ...prev,
      selectedKkniLevels: [levelNum],
      selectedKkniItems: targetItems,
    }));
    setSelectedLevelFilter(levelNum);
    showNotification(`Preset KKNI ${label} (Level ${levelNum}) diterapkan!`, "success");
  };

  const handleSelectAll = () => {
    setRpsData((prev) => ({
      ...prev,
      selectedKkniLevels: [6, 7, 8, 9],
      selectedKkniItems: KKNI_DESCRIPTORS_LIST.map((item) => item.id),
    }));
    showNotification("Seluruh butir KKNI Level 6 s.d. 9 dipilih!", "success");
  };

  const handleClearAll = () => {
    setRpsData((prev) => ({
      ...prev,
      selectedKkniLevels: [],
      selectedKkniItems: [],
    }));
    showNotification("Pilihan jenjang dan butir KKNI dikosongkan.", "info");
  };

  // Filter otomatis jenjang KKNI (Level 6 - 9) sesuai jenjang pendidikan RPS terpilih
  const jenjangActiveLevel =
    rpsData.jenjang === "S1"
      ? 6
      : rpsData.jenjang === "Profesi"
      ? 7
      : rpsData.jenjang === "S2" || rpsData.jenjang === "Spesialis"
      ? 8
      : rpsData.jenjang === "S3"
      ? 9
      : null;

  const [showAllLevelsOverride, setShowAllLevelsOverride] = useState(false);
  const effectiveLevel = showAllLevelsOverride ? null : jenjangActiveLevel;

  const visibleLevelsList = effectiveLevel
    ? KKNI_LEVELS_LIST.filter((lvl) => lvl.level === effectiveLevel)
    : KKNI_LEVELS_LIST;

  // Filter items
  const filteredItems = KKNI_DESCRIPTORS_LIST.filter((item) => {
    if (effectiveLevel && item.level !== effectiveLevel) {
      return false;
    }
    const matchesLevel =
      selectedLevelFilter === "all" || item.level === selectedLevelFilter;
    const matchesCategory =
      selectedCategory === "Semua Kategori" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.levelTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesCategory && matchesSearch;
  });

  return (
    <div className="border-2 border-indigo-400/80 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50/60 rounded-xl p-3.5 shadow-sm transition-all duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-700 text-white shadow-xs">
              <GraduationCap className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5 flex-wrap">
                Penyesuaian Jenjang KKNI (Level 6 – 9)
                <span className="text-[9.5px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-100/90 border border-indigo-300 px-1.5 py-0.2 rounded-md">
                  Perpres No. 8/2012
                </span>
                <span className="text-[9.5px] font-bold text-slate-700 bg-white border border-slate-300 px-1.5 py-0.2 rounded-md">
                  Permendikbudristek 39/2025
                </span>
                <span className="text-[9.5px] font-bold text-slate-700 bg-white border border-slate-300 px-1.5 py-0.2 rounded-md">
                  Permendikbudristek 10/2026
                </span>
              </label>
              <p className="text-[10.5px] text-indigo-900 font-medium">
                Pilih jenjang kualifikasi &amp; centang deskriptor pembelajaran yang diselaraskan dalam RPS
              </p>
            </div>
          </div>
        </div>

        {/* Counter and Toggle buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10.5px] font-black text-indigo-900 bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded-md shadow-2xs">
            {selectedItems.length} Poin Tercentang
          </span>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className={`text-[10px] px-2.5 py-1 rounded font-bold transition flex items-center gap-1 border ${
              showGuide
                ? "bg-slate-900 text-indigo-300 border-slate-700"
                : "bg-indigo-700 hover:bg-indigo-800 text-white border-indigo-600"
            }`}
            title="Lihat matriks perbandingan jenjang KKNI Level 6 - 9"
          >
            <BookOpen className="w-3 h-3 text-indigo-200" />
            <span>{showGuide ? "Tutup Panduan" : "Panduan KKNI"}</span>
          </button>
        </div>
      </div>

      {/* Banner Filter Aktif Jenjang (Level Tersembunyi Otomatis) */}
      {jenjangActiveLevel && (
        <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-indigo-100/90 border border-indigo-300 text-indigo-950 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-700 animate-pulse"></span>
            <span>
              Jenjang <strong>{rpsData.jenjang}</strong> aktif: Menampilkan khusus{" "}
              <strong>KKNI Level {jenjangActiveLevel}</strong>. Level lainnya disembunyikan.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllLevelsOverride(!showAllLevelsOverride)}
            className="text-[10.5px] font-black text-indigo-800 hover:text-indigo-950 underline cursor-pointer"
          >
            {showAllLevelsOverride ? "Kunci Hanya Level Ini" : "Buka Semua Level"}
          </button>
        </div>
      )}

      {/* Level Selector Cards */}
      <div
        className={`grid gap-1.5 mb-2.5 ${
          visibleLevelsList.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        {visibleLevelsList.map((lvl) => {
          const isLvlSelected =
            selectedLevels.includes(lvl.level) ||
            KKNI_DESCRIPTORS_LIST.filter((d) => d.level === lvl.level).some((d) =>
              selectedItems.includes(d.id)
            );
          const isFilterActive = selectedLevelFilter === lvl.level;
          const countSelectedInLevel = KKNI_DESCRIPTORS_LIST.filter(
            (d) => d.level === lvl.level && selectedItems.includes(d.id)
          ).length;

          return (
            <div
              key={lvl.level}
              className={`p-2 rounded-lg border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                isLvlSelected
                  ? lvl.level === 6
                    ? "bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs"
                    : lvl.level === 7
                    ? "bg-amber-50/90 border-amber-500 text-amber-950 shadow-xs"
                    : lvl.level === 8
                    ? "bg-blue-50/90 border-blue-500 text-blue-950 shadow-xs"
                    : "bg-purple-50/90 border-purple-500 text-purple-950 shadow-xs"
                  : "bg-white/80 border-slate-200 text-slate-700 hover:border-indigo-300"
              }`}
              onClick={() => handleSelectEntireLevel(lvl.level)}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`text-[9.5px] font-black px-1.5 py-0.2 rounded-md ${
                    lvl.level === 6
                      ? "bg-emerald-700 text-white"
                      : lvl.level === 7
                      ? "bg-amber-700 text-white"
                      : lvl.level === 8
                      ? "bg-blue-700 text-white"
                      : "bg-purple-700 text-white"
                  }`}
                >
                  Level {lvl.level}
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-500">
                  {countSelectedInLevel}/4 Poin
                </span>
              </div>
              <div className="text-[11px] font-black leading-tight mb-0.5 truncate">
                {lvl.degree}
              </div>
              <div className="text-[9px] text-slate-600 line-clamp-1 mb-1">
                {lvl.label.split(":")[1]?.trim() || lvl.label}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[9px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLevelFilter(
                      selectedLevelFilter === lvl.level ? "all" : lvl.level
                    );
                  }}
                  className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold border transition ${
                    isFilterActive
                      ? "bg-indigo-900 text-indigo-100 border-indigo-900"
                      : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                  title={`Saring daftar butir khusus Level ${lvl.level}`}
                >
                  {isFilterActive ? "Tampilkan Semua" : "Filter List"}
                </button>
                <div className="flex items-center gap-1 font-bold">
                  {isLvlSelected ? (
                    <span className="text-emerald-700 flex items-center gap-0.5">
                      <Check className="w-3 h-3 stroke-[3]" /> Aktif
                    </span>
                  ) : (
                    <span className="text-slate-400">Pilih</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Toolbar & Filters */}
      <div className="bg-white/95 border border-indigo-200 rounded-lg p-2 mb-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            <span className="text-slate-500 font-bold flex items-center gap-1 mr-0.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Preset:
            </span>
            <button
              type="button"
              onClick={() => applyPresetLevel(6, "Sarjana S1 / D4")}
              className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 font-bold transition flex items-center gap-1"
            >
              <span>Sarjana S1 (Level 6)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetLevel(7, "Pendidikan Profesi")}
              className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold transition flex items-center gap-1"
            >
              <span>Profesi (Level 7)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetLevel(8, "Magister S2")}
              className="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-950 border border-blue-300 font-bold transition flex items-center gap-1"
            >
              <span>Magister S2 (Level 8)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPresetLevel(9, "Doktoral S3")}
              className="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-950 border border-purple-300 font-bold transition flex items-center gap-1"
            >
              <span>Doktor S3 (Level 9)</span>
            </button>
          </div>

          {/* Select all / Clear buttons */}
          <div className="flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold transition"
            >
              Pilih Semua (6-9)
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

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-indigo-100">
          <div className="relative w-full sm:w-1/2">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-indigo-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari butir KKNI (misal: aplikasi ipteks, interdisipliner, novelty)..."
              className="w-full text-[11px] pl-6 pr-2 py-1 border border-indigo-200 rounded-md bg-indigo-50/30 text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-1/2">
            <select
              value={selectedLevelFilter === "all" ? "all" : String(selectedLevelFilter)}
              onChange={(e) =>
                setSelectedLevelFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="w-1/2 text-[10.5px] px-2 py-1 border border-indigo-200 rounded-md bg-white text-slate-800 font-bold focus:outline-none focus:border-indigo-600"
            >
              <option value="all">Semua Level (6 – 9)</option>
              <option value="6">Level 6 (Sarjana S1/D4)</option>
              <option value="7">Level 7 (Profesi)</option>
              <option value="8">Level 8 (Magister S2)</option>
              <option value="9">Level 9 (Doktor S3)</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-1/2 text-[10.5px] px-2 py-1 border border-indigo-200 rounded-md bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-600"
            >
              {KKNI_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of KKNI Checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 text-[11px]">
        {filteredItems.map((item) => {
          const checked = selectedItems.includes(item.id);
          const isLvl6 = item.level === 6;
          const isLvl7 = item.level === 7;
          const isLvl8 = item.level === 8;
          const isLvl9 = item.level === 9;

          return (
            <div
              key={item.id}
              onClick={() => toggleKkniItem(item.id, item.level)}
              className={`p-2.5 rounded-lg border-2 cursor-pointer select-none transition-all duration-150 flex items-start gap-2.5 ${
                checked
                  ? isLvl6
                    ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs"
                    : isLvl7
                    ? "bg-amber-50 border-amber-600 text-amber-950 shadow-xs"
                    : isLvl8
                    ? "bg-blue-50 border-blue-600 text-blue-950 shadow-xs"
                    : "bg-purple-50 border-purple-600 text-purple-950 shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50/70"
              }`}
            >
              <div className="pt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {}} // handled by parent onClick
                  className="rounded text-indigo-700 h-4 w-4 border-slate-300 cursor-pointer focus:ring-indigo-500"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-mono text-[10px] font-black px-1.5 py-0.2 rounded ${
                        isLvl6
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : isLvl7
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : isLvl8
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-purple-100 text-purple-900 border border-purple-300"
                      }`}
                    >
                      {item.code}
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1 rounded">
                      {item.levelTitle}
                    </span>
                  </div>

                  <span className="text-[9px] font-semibold text-slate-500 truncate max-w-[120px]">
                    {item.category}
                  </span>
                </div>

                <h4 className="text-[11px] font-black text-slate-900 leading-tight mb-1">
                  {item.title}
                </h4>

                <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                  {item.description}
                </p>

                <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-indigo-900">
                  <span className="truncate font-medium italic text-slate-500">
                    Fokus: {item.focus}
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

      {/* Expandable Guide on KKNI Level 6 - 9 */}
      {showGuide && (
        <div className="mt-3 pt-3 border-t-2 border-indigo-300 bg-white/95 rounded-lg p-3 text-xs text-slate-800 space-y-2.5 border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <h4 className="font-black text-indigo-950 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              Deskriptor Jenjang Kualifikasi KKNI Pendidikan Tinggi (Level 6 – 9)
            </h4>
            <span className="text-[9.5px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
              Lampiran Perpres RI No. 8/2012, Permendikbudristek 39/2025 &amp; 10/2026
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Dalam menyusun Rencana Pembelajaran Semester (RPS), rumusan Capaian Pembelajaran Lulusan (CPL) dan Sub-CPMK
            wajib berpatokan pada deskriptor generik KKNI jenjang perguruan tinggi berikut:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
            {/* Level 6 */}
            <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-300 flex flex-col justify-between">
              <div>
                <div className="font-black text-emerald-950 mb-1 flex items-center justify-between">
                  <span>Level 6: Sarjana (S1 / D4)</span>
                  <span className="bg-emerald-700 text-white px-1 rounded text-[8.5px]">S1</span>
                </div>
                <ul className="text-slate-700 space-y-1 list-disc list-inside">
                  <li><strong>Aplikasi IPTEKS</strong> &amp; adaptasi situasi lapangan</li>
                  <li><strong>Teori mendalam</strong> &amp; pemecahan masalah prosedural</li>
                  <li><strong>Pengambilan keputusan</strong> berbasis data &amp; informasi</li>
                  <li><strong>Tanggung jawab</strong> pekerjaan mandiri &amp; kelompok</li>
                </ul>
              </div>
              <div className="mt-2 pt-1 border-t border-emerald-200 text-[9px] text-emerald-900 font-bold">
                Level Kognitif Bloom: C2 s.d. C4 (Aplikasi &amp; Analisis)
              </div>
            </div>

            {/* Level 7 */}
            <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-300 flex flex-col justify-between">
              <div>
                <div className="font-black text-amber-950 mb-1 flex items-center justify-between">
                  <span>Level 7: Pendidikan Profesi</span>
                  <span className="bg-amber-700 text-white px-1 rounded text-[8.5px]">Profesi</span>
                </div>
                <ul className="text-slate-700 space-y-1 list-disc list-inside">
                  <li><strong>Manajemen sumber daya</strong> &amp; langkah strategis organisasi</li>
                  <li><strong>Pendekatan monodisipliner</strong> presisi tinggi</li>
                  <li><strong>Keputusan strategis</strong> dengan akuntabilitas penuh</li>
                  <li><strong>Standar kode etik</strong> asosiasi profesi &amp; regulasi</li>
                </ul>
              </div>
              <div className="mt-2 pt-1 border-t border-amber-200 text-[9px] text-amber-900 font-bold">
                Tuntutan: Uji Kompetensi &amp; Praktik Kerja Profesi Mandiri
              </div>
            </div>

            {/* Level 8 */}
            <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-300 flex flex-col justify-between">
              <div>
                <div className="font-black text-blue-950 mb-1 flex items-center justify-between">
                  <span>Level 8: Magister (S2 / Sp-1)</span>
                  <span className="bg-blue-700 text-white px-1 rounded text-[8.5px]">S2</span>
                </div>
                <ul className="text-slate-700 space-y-1 list-disc list-inside">
                  <li><strong>Pengembangan IPTEKS</strong> via riset inovatif &amp; teruji</li>
                  <li><strong>Pendekatan inter/multidisipliner</strong> integratif</li>
                  <li><strong>Pengelolaan riset</strong> berdampak &amp; rekognisi pakar</li>
                  <li><strong>Publikasi jurnal ilmiah</strong> terakreditasi / internasional</li>
                </ul>
              </div>
              <div className="mt-2 pt-1 border-t border-blue-200 text-[9px] text-blue-900 font-bold">
                Level Kognitif Bloom: C4 s.d. C6 (Evaluasi &amp; Kreasi Riset)
              </div>
            </div>

            {/* Level 9 */}
            <div className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-300 flex flex-col justify-between">
              <div>
                <div className="font-black text-purple-950 mb-1 flex items-center justify-between">
                  <span>Level 9: Doktoral (S3 / Sp-2)</span>
                  <span className="bg-purple-700 text-white px-1 rounded text-[8.5px]">S3</span>
                </div>
                <ul className="text-slate-700 space-y-1 list-disc list-inside">
                  <li><strong>Penemuan IPTEKS baru</strong> (Novelty &amp; Originalitas)</li>
                  <li><strong>Pendekatan transdisipliner</strong> melampaui sekat ilmu</li>
                  <li><strong>Kepemimpinan riset global</strong> bagi kemanusiaan</li>
                  <li><strong>Pengembangan filsafat ilmu</strong> &amp; publikasi bereputasi</li>
                </ul>
              </div>
              <div className="mt-2 pt-1 border-t border-purple-200 text-[9px] text-purple-900 font-bold">
                Level Kognitif Bloom: C6+ (Filsafat Ilmu &amp; Frontier of Science)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
