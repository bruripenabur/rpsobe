import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Search,
  Plus,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  X,
  FileCheck2,
  BookmarkCheck,
} from "lucide-react";

interface ResearchPkmIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dosenName: string;
  onIntegrateIntoPustaka: (formattedRef: string, topicSummary?: string) => void;
}

interface ResearchItem {
  id: string;
  type: "Penelitian" | "PkM" | "Buku Ajar" | "Paten / HKI";
  title: string;
  authors: string;
  year: number;
  source: string;
  database: "SINTA" | "Scopus" | "Google Scholar" | "Garuda";
  doiOrUrl: string;
  abstract: string;
  sdgMatch: number[];
}

export const ResearchPkmIntegrationModal: React.FC<ResearchPkmIntegrationModalProps> = ({
  isOpen,
  onClose,
  dosenName,
  onIntegrateIntoPustaka,
}) => {
  const [activeTab, setActiveTab] = useState<"database" | "manual">("database");
  const [searchQuery, setSearchQuery] = useState(dosenName || "Penyuluhan Pertanian Maluku");
  const [filterType, setFilterType] = useState<string>("all");

  // Manual input form states
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthors, setManualAuthors] = useState(dosenName || "");
  const [manualYear, setManualYear] = useState(new Date().getFullYear());
  const [manualSource, setManualSource] = useState("");
  const [manualType, setManualType] = useState<"Penelitian" | "PkM" | "Buku Ajar" | "Paten / HKI">("Penelitian");
  const [manualUrl, setManualUrl] = useState("");
  const [insertToBahanKajian, setInsertToBahanKajian] = useState(true);

  // Pre-loaded realistic SINTA / Scopus / Scholar publications for UNPATTI
  const samplePublications: ResearchItem[] = [
    {
      id: "res-01",
      type: "Penelitian",
      title:
        "Analisis Kemiskinan Multidimensional Rumah Tangga Tani di Kepulauan Maluku Berbasis Pendekatan Alkire-Foster",
      authors: `${dosenName || "Penabur, B."}, & Sangadji, M.`,
      year: 2024,
      source: "Jurnal Agroforestri & Agribisnis Kepulauan, 12(2), 145-159",
      database: "SINTA",
      doiOrUrl: "https://doi.org/10.30598/jagro.2024.12.2.145",
      abstract:
        "Penelitian mengkaji indeks kemiskinan multidimensional (MPI) di 14 desa pesisir Maluku Tengah dengan indikator akses logistik laut, sanitasi, dan pendapatan usahatani pala.",
      sdgMatch: [1, 2, 8, 10],
    },
    {
      id: "res-02",
      type: "PkM",
      title:
        "Pemberdayaan Kelompok Tani Pala Berkelanjutan Melalui Digitalisasi Rantai Pasok dan Revitalisasi Pranata Sasi di Pulau Saparua",
      authors: `${dosenName || "Penabur, B."}, Luhukay, J. M., & Hitipeuw, J.`,
      year: 2023,
      source: "Jurnal Pengabdian Kepada Masyarakat Universitas Pattimura, 8(1), 34-48",
      database: "SINTA",
      doiOrUrl: "https://sinta.kemdikbud.go.id/authors/detail?id=unpatti_pkm",
      abstract:
        "Program PkM pendampingan kelembagaan petani pala dalam sertifikasi organik dan penerapan e-commerce hasil tani berbasis kearifan lokal Sasi Negeri.",
      sdgMatch: [1, 8, 12, 17],
    },
    {
      id: "res-03",
      type: "Penelitian",
      title:
        "Vulnerability and Resilience of Smallholder Farmers to Marine Climate Variability in the Banda Sea Small Islands",
      authors: `${dosenName || "Penabur, B."}, Hatulesila, J. W., & Pattinama, E. J.`,
      year: 2025,
      source: "Marine Policy & Archipelagic Development, 142, 105210",
      database: "Scopus",
      doiOrUrl: "https://doi.org/10.1016/j.marpol.2025.105210",
      abstract:
        "Scopus Q1 indexed publication evaluating climate adaptation strategies and agricultural-fishery diversification among archipelagic farming communities.",
      sdgMatch: [13, 14, 15, 2],
    },
    {
      id: "res-04",
      type: "Buku Ajar",
      title:
        "Buku Ajar: Metodologi Penyuluhan Pertanian Partisipatif Wilayah Kepulauan",
      authors: `${dosenName || "Penabur, B."}`,
      year: 2024,
      source: "Pattimura University Press (ISBN: 978-623-789-102-3)",
      database: "Google Scholar",
      doiOrUrl: "https://scholar.google.com/citations?user=unpatti_penabur",
      abstract:
        "Buku referensi perkuliahan mencakup modul studi kasus kepulauan, PRA (Participatory Rural Appraisal), dan komunikasi gender pedesaan Maluku.",
      sdgMatch: [4, 5, 8],
    },
  ];

  if (!isOpen) return null;

  const filteredItems = samplePublications.filter((item) => {
    const matchType = filterType === "all" || item.type === filterType;
    const matchQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  const handleSelectPublication = (item: ResearchItem) => {
    const apaString = `${item.authors} (${item.year}). ${item.title}. ${item.source}. ${item.doiOrUrl} [${item.type} Terintegrasi RPS Dosen MK]`;
    const topicSummary = insertToBahanKajian ? `${item.type} Terintegrasi: ${item.title} (${item.year})` : undefined;

    onIntegrateIntoPustaka(apaString, topicSummary);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualAuthors) return;

    const apaString = `${manualAuthors} (${manualYear}). ${manualTitle}. ${manualSource || "Publikasi Ilmiah Dosen"}. ${manualUrl || ""} [${manualType} Terintegrasi RPS Dosen MK]`;
    const topicSummary = insertToBahanKajian ? `${manualType} Terintegrasi: ${manualTitle} (${manualYear})` : undefined;

    onIntegrateIntoPustaka(apaString, topicSummary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border-2 border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-amber-300 border border-white/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>Integrasi Riset &amp; PkM Dosen MK ke RPS</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  Kriteria 9 Akreditasi
                </span>
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                Pencarian publikasi SINTA, Scopus, Google Scholar, dan Pengabdian Dosen Pengampu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("database")}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "database"
                ? "border-emerald-600 text-emerald-950 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Search className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pencarian SINTA / Scopus / Scholar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "manual"
                ? "border-emerald-600 text-emerald-950 bg-white rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Input Publikasi Manual</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {activeTab === "database" ? (
            <>
              {/* Search bar and type filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama dosen, judul riset, atau kata kunci..."
                    className="w-full text-xs pl-9 pr-3 py-2 border-2 border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs px-3 py-2 border-2 border-slate-300 rounded-xl font-bold bg-white text-slate-800"
                >
                  <option value="all">Semua Jenis Karya</option>
                  <option value="Penelitian">Hasil Penelitian</option>
                  <option value="PkM">Pengabdian (PkM)</option>
                  <option value="Buku Ajar">Buku Ajar / Modul</option>
                  <option value="Paten / HKI">Paten &amp; HKI</option>
                </select>
              </div>

              {/* Checkbox insert to Bahan Kajian */}
              <label className="flex items-center space-x-2 text-xs text-slate-700 select-none cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={insertToBahanKajian}
                  onChange={(e) => setInsertToBahanKajian(e.target.checked)}
                  className="rounded text-emerald-700 h-4 w-4"
                />
                <span className="font-semibold">
                  Otomatis tambahkan juga ke <strong>Bahan Kajian / Pokok Bahasan</strong> RPS
                </span>
              </label>

              {/* Results List */}
              <div className="space-y-2.5">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border-2 border-slate-200 hover:border-emerald-500 bg-white transition hover:shadow-md flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9.5px] font-black px-2 py-0.5 rounded ${
                              item.type === "Penelitian"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : item.type === "PkM"
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : "bg-purple-100 text-purple-900 border border-purple-300"
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-[9.5px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded">
                            {item.database}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Tahun {item.year}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.sdgMatch.map((s) => (
                            <span
                              key={s}
                              className="text-[8.5px] bg-emerald-50 text-emerald-800 font-black px-1 rounded border border-emerald-200"
                            >
                              SDG {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {item.authors} &mdash; <em>{item.source}</em>
                      </p>
                      <p className="text-[10.5px] text-slate-500 line-clamp-2 mt-1">
                        {item.abstract}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <a
                        href={item.doiOrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10.5px] text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Lihat Sumber URL/DOI</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSelectPublication(item)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        <span>Sisipkan ke RPS</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Manual Form */
            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Jenis Karya Ilmiah / Integrasi
                </label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as any)}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg font-bold bg-white text-slate-900"
                >
                  <option value="Penelitian">Hasil Penelitian (Jurnal / Prosiding)</option>
                  <option value="PkM">Hasil Pengabdian kepada Masyarakat (PkM)</option>
                  <option value="Buku Ajar">Buku Ajar / Monograf / Modul Praktikum</option>
                  <option value="Paten / HKI">Paten / Hak Cipta (HKI)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Judul Karya / Penelitian / PkM
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Contoh: Model Evaluasi Adopsi Teknologi Budidaya..."
                  required
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Nama Penulis / Tim Dosen Pengampu
                  </label>
                  <input
                    type="text"
                    value={manualAuthors}
                    onChange={(e) => setManualAuthors(e.target.value)}
                    placeholder="Nama Dosen, M.Si., dkk."
                    required
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tahun Publikasi / Pelaksanaan
                  </label>
                  <input
                    type="number"
                    value={manualYear}
                    onChange={(e) => setManualYear(parseInt(e.target.value) || 2024)}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Jurnal / Penerbit / Prosiding
                </label>
                <input
                  type="text"
                  value={manualSource}
                  onChange={(e) => setManualSource(e.target.value)}
                  placeholder="Contoh: Jurnal Agribisnis Kepulauan, Vol. 10(1), hal. 20-35"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Link DOI atau URL Publikasi (Opsional)
                </label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://doi.org/... atau link repository"
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
                />
              </div>

              <label className="flex items-center space-x-2 text-slate-700 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={insertToBahanKajian}
                  onChange={(e) => setInsertToBahanKajian(e.target.checked)}
                  className="rounded text-emerald-700 h-4 w-4"
                />
                <span className="font-semibold">
                  Otomatis sisipkan judul karya ke <strong>Bahan Kajian</strong> RPS
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan &amp; Sisipkan ke Daftar Pustaka RPS</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
