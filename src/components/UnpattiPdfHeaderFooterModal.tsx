import React, { useState } from "react";
import {
  FileText,
  Settings,
  Check,
  Building,
  Printer,
  Download,
  X,
  Eye,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";
import { UNPATTI_LOGO_DATA_URL } from "../data/unpattiLogo";
import { RpsData } from "../types/rps";

export interface UnpattiKopConfig {
  kementerian: string;
  universitas: string;
  fakultas: string;
  prodi: string;
  alamatKampus: string;
  kontak: string;
  kodePos: string;
  layoutStyle: "resmi_ganda" | "modern_hijau" | "klasik_minimalis";
  garisPemisah: boolean;
  tampilkanLogo: boolean;
  tampilkanRunningHeader: boolean;
  runningHeaderText?: string;
  tampilkanFooter: boolean;
  footerLeftText: string;
  footerCenterText: string;
  pageNumberFormat: "halaman_x_dari_y" | "hal_x_y" | "angka_saja";
  tampilkanTimestamp: boolean;
  tampilkanKodeDokumen: boolean;
  warnaAksen: string; // #14532d (Hijau Unpatti), #1e3a8a (Biru), #0f172a (Hitam)
}

export const UNPATTI_FAKULTAS_DIRECTORIES: {
  id: string;
  nama: string;
  singkatan: string;
  alamat: string;
  kontak: string;
  warnaKhas?: string;
}[] = [
  {
    id: "faperta",
    nama: "FAKULTAS PERTANIAN",
    singkatan: "FAPERTA",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://faperta.unpatti.ac.id | Email: faperta@unpatti.ac.id",
    warnaKhas: "#14532d",
  },
  {
    id: "fkip",
    nama: "FAKULTAS KEGURUAN DAN ILMU PENDIDIKAN",
    singkatan: "FKIP",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://fkip.unpatti.ac.id | Email: fkip@unpatti.ac.id",
    warnaKhas: "#0284c7",
  },
  {
    id: "fatek",
    nama: "FAKULTAS TEKNIK",
    singkatan: "FATEK",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://fatek.unpatti.ac.id | Email: fatek@unpatti.ac.id",
    warnaKhas: "#0f766e",
  },
  {
    id: "fmipa",
    nama: "FAKULTAS MATEMATIKA DAN ILMU PENGETAHUAN ALAM",
    singkatan: "FMIPA",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://fmipa.unpatti.ac.id | Email: fmipa@unpatti.ac.id",
    warnaKhas: "#7c3aed",
  },
  {
    id: "fhukum",
    nama: "FAKULTAS HUKUM",
    singkatan: "FHUKUM",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://fhukum.unpatti.ac.id | Email: fhukum@unpatti.ac.id",
    warnaKhas: "#b91c1c",
  },
  {
    id: "feb",
    nama: "FAKULTAS EKONOMI DAN BISNIS",
    singkatan: "FEB",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://feb.unpatti.ac.id | Email: feb@unpatti.ac.id",
    warnaKhas: "#c2410c",
  },
  {
    id: "fisip",
    nama: "FAKULTAS ILMU SOSIAL DAN ILMU POLITIK",
    singkatan: "FISIP",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://fisip.unpatti.ac.id | Email: fisip@unpatti.ac.id",
    warnaKhas: "#0369a1",
  },
  {
    id: "fpik",
    nama: "FAKULTAS PERIKANAN DAN ILMU KELAUTAN",
    singkatan: "FPIK",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://fpik.unpatti.ac.id | Email: fpik@unpatti.ac.id",
    warnaKhas: "#0891b2",
  },
  {
    id: "fk",
    nama: "FAKULTAS KEDOKTERAN",
    singkatan: "FK",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://fk.unpatti.ac.id | Email: fk@unpatti.ac.id",
    warnaKhas: "#059669",
  },
  {
    id: "pascasarjana",
    nama: "PROGRAM PASCASARJANA",
    singkatan: "PASCASARJANA",
    alamat: "Jalan Ir. M. Putuhena, Kampus Poka, Ambon - Maluku 97233",
    kontak: "Laman: https://pasca.unpatti.ac.id | Email: pasca@unpatti.ac.id",
    warnaKhas: "#4338ca",
  },
  {
    id: "psdku_aru",
    nama: "PSDKU KABUPATEN KEPULAUAN ARU",
    singkatan: "PSDKU ARU",
    alamat: "Jalan Pemda II, Dobo, Kabupaten Kepulauan Aru - Maluku",
    kontak: "Laman: https://psdku-aru.unpatti.ac.id | Email: psdku.aru@unpatti.ac.id",
    warnaKhas: "#0d9488",
  },
  {
    id: "psdku_mbd",
    nama: "PSDKU KABUPATEN MALUKU BARAT DAYA",
    singkatan: "PSDKU MBD",
    alamat: "Jalan Tiakur Indah, Tiakur, Kabupaten Maluku Barat Daya - Maluku",
    kontak: "Laman: https://psdku-mbd.unpatti.ac.id | Email: psdku.mbd@unpatti.ac.id",
    warnaKhas: "#0284c7",
  },
];

export function getDefaultKopConfig(rpsData?: RpsData): UnpattiKopConfig {
  const currentFakultasName = (rpsData?.namaFakultas || "Fakultas Pertanian").trim().toUpperCase();
  const matched = UNPATTI_FAKULTAS_DIRECTORIES.find(
    (f) =>
      currentFakultasName.includes(f.singkatan) ||
      currentFakultasName.includes(f.nama) ||
      f.nama.includes(currentFakultasName)
  ) || UNPATTI_FAKULTAS_DIRECTORIES[0];

  return {
    kementerian: "KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI",
    universitas: "UNIVERSITAS PATTIMURA",
    fakultas: matched.nama,
    prodi: (rpsData?.namaProdi || "PROGRAM STUDI PENYULUHAN PERTANIAN").toUpperCase(),
    alamatKampus: matched.alamat,
    kontak: matched.kontak,
    kodePos: "97233",
    layoutStyle: "resmi_ganda",
    garisPemisah: true,
    tampilkanLogo: true,
    tampilkanRunningHeader: true,
    runningHeaderText: `UNIVERSITAS PATTIMURA • ${matched.nama}`,
    tampilkanFooter: true,
    footerLeftText: "Dokumen SPMI UNPATTI - RPS Berbasis OBE",
    footerCenterText: "Permendiktisaintek 39/2025 & No. 10/2026",
    pageNumberFormat: "halaman_x_dari_y",
    tampilkanTimestamp: true,
    tampilkanKodeDokumen: true,
    warnaAksen: "#14532d",
  };
}

interface UnpattiPdfHeaderFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  rpsData: RpsData;
  config: UnpattiKopConfig;
  onSaveConfig: (newConfig: UnpattiKopConfig) => void;
  onTriggerExportPdf?: () => void;
}

export const UnpattiPdfHeaderFooterModal: React.FC<UnpattiPdfHeaderFooterModalProps> = ({
  isOpen,
  onClose,
  rpsData,
  config,
  onSaveConfig,
  onTriggerExportPdf,
}) => {
  const [localConfig, setLocalConfig] = useState<UnpattiKopConfig>(config);
  const [activeTab, setActiveTab] = useState<"kop" | "footer" | "preview">("kop");

  if (!isOpen) return null;

  const handleSelectFakultas = (fakultasId: string) => {
    const f = UNPATTI_FAKULTAS_DIRECTORIES.find((item) => item.id === fakultasId);
    if (!f) return;
    setLocalConfig((prev) => ({
      ...prev,
      fakultas: f.nama,
      alamatKampus: f.alamat,
      kontak: f.kontak,
      warnaAksen: f.warnaKhas || prev.warnaAksen,
      runningHeaderText: `UNIVERSITAS PATTIMURA • ${f.nama}`,
    }));
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const handleSaveAndExport = () => {
    onSaveConfig(localConfig);
    onClose();
    if (onTriggerExportPdf) {
      setTimeout(() => {
        onTriggerExportPdf();
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Kustomisasi Kop Surat Resmi &amp; Footer PDF
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Standar UNPATTI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sesuaikan format kop surat resmi dinamis berdasarkan fakultas pengguna dan running footer untuk ekspor dokumen PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={() => setActiveTab("kop")}
            className={`px-4 py-2 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === "kop"
                ? "border-emerald-500 text-emerald-400 font-black"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>1. Kop Surat Resmi Fakultas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("footer")}
            className={`px-4 py-2 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === "footer"
                ? "border-emerald-500 text-emerald-400 font-black"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>2. Running Header &amp; Footer PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === "preview"
                ? "border-emerald-500 text-emerald-400 font-black"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>3. Pratinjau Kop Surat</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: KOP SURAT */}
          {activeTab === "kop" && (
            <div className="space-y-4">
              {/* Pemilihan Cepat Fakultas */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Pilih Fakultas Pengguna (Otomatis Isi Alamat &amp; Kontak):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {UNPATTI_FAKULTAS_DIRECTORIES.map((f) => {
                    const isSelected = localConfig.fakultas === f.nama;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleSelectFakultas(f.id)}
                        className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                          isSelected
                            ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                            : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <span className="font-black text-[11px] block text-white truncate">
                          {f.singkatan}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                          {f.nama.replace("FAKULTAS ", "")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Bidang Input Kop Surat */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Kementerian Pembina
                    </label>
                    <input
                      type="text"
                      value={localConfig.kementerian}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, kementerian: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Nama Perguruan Tinggi
                    </label>
                    <input
                      type="text"
                      value={localConfig.universitas}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, universitas: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Nama Fakultas / Unit Kerja
                    </label>
                    <input
                      type="text"
                      value={localConfig.fakultas}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, fakultas: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Nama Program Studi
                    </label>
                    <input
                      type="text"
                      value={localConfig.prodi}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, prodi: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Alamat Kampus Resmi
                  </label>
                  <input
                    type="text"
                    value={localConfig.alamatKampus}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, alamatKampus: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Kontak, Laman &amp; Surel Resmi
                  </label>
                  <input
                    type="text"
                    value={localConfig.kontak}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, kontak: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Gaya Garis Pemisah & Tampilan Logo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Gaya Garis Pemisah:</span>
                  <div className="space-y-1.5">
                    {[
                      { id: "resmi_ganda", label: "Garis Ganda Resmi (Tebal-Tipis)" },
                      { id: "modern_hijau", label: "Aksen Hijau Solid UNPATTI" },
                      { id: "klasik_minimalis", label: "Garis Tipis Formal" },
                    ].map((st) => (
                      <label key={st.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="layoutStyle"
                          checked={localConfig.layoutStyle === st.id}
                          onChange={() =>
                            setLocalConfig({ ...localConfig, layoutStyle: st.id as any })
                          }
                          className="accent-emerald-500"
                        />
                        <span>{st.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Warna Aksen Kop:</span>
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { color: "#14532d", name: "Hijau Unpatti" },
                      { color: "#1e3a8a", name: "Biru Dongker" },
                      { color: "#0f172a", name: "Hitam Dinas" },
                      { color: "#0f766e", name: "Teal Modern" },
                    ].map((col) => (
                      <button
                        key={col.color}
                        type="button"
                        onClick={() => setLocalConfig({ ...localConfig, warnaAksen: col.color })}
                        style={{ backgroundColor: col.color }}
                        className={`w-7 h-7 rounded-full border-2 transition ${
                          localConfig.warnaAksen === col.color
                            ? "border-amber-400 scale-110 shadow-md"
                            : "border-slate-700 opacity-70 hover:opacity-100"
                        }`}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Opsi Logo UNPATTI:</span>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={localConfig.tampilkanLogo}
                      onChange={(e) =>
                        setLocalConfig({ ...localConfig, tampilkanLogo: e.target.checked })
                      }
                      className="rounded accent-emerald-500"
                    />
                    <span>Sertakan Logo Resmi Berwarna</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RUNNING HEADER & FOOTER */}
          {activeTab === "footer" && (
            <div className="space-y-4">
              {/* Running Header Halaman 2+ */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-400">
                      Running Header Halaman Lanjutan (Halaman 2 ke atas)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Menampilkan baris kop ringkas di bagian atas setiap halaman dokumen PDF selanjutnya.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.tampilkanRunningHeader}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          tampilkanRunningHeader: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {localConfig.tampilkanRunningHeader && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Teks Running Header Halaman Lanjutan:
                    </label>
                    <input
                      type="text"
                      value={localConfig.runningHeaderText || ""}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          runningHeaderText: e.target.value,
                        })
                      }
                      placeholder="UNIVERSITAS PATTIMURA • FAKULTAS PERTANIAN"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Running Footer PDF */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-amber-400">
                      Running Footer Halaman PDF (Kaki Lembar)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Format penomoran halaman resmi dan atribut dokumen penjaminan mutu SPMI UNPATTI.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localConfig.tampilkanFooter}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          tampilkanFooter: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {localConfig.tampilkanFooter && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Teks Kiri Footer (Penjaminan Mutu)
                        </label>
                        <input
                          type="text"
                          value={localConfig.footerLeftText}
                          onChange={(e) =>
                            setLocalConfig({ ...localConfig, footerLeftText: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Format Nomor Halaman
                        </label>
                        <select
                          value={localConfig.pageNumberFormat}
                          onChange={(e: any) =>
                            setLocalConfig({
                              ...localConfig,
                              pageNumberFormat: e.target.value,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="halaman_x_dari_y">Halaman X dari Y (Standar)</option>
                          <option value="hal_x_y">Hal. X / Y (Ringkas)</option>
                          <option value="angka_saja">- X - (Klasik)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConfig.tampilkanTimestamp}
                          onChange={(e) =>
                            setLocalConfig({
                              ...localConfig,
                              tampilkanTimestamp: e.target.checked,
                            })
                          }
                          className="rounded accent-emerald-500"
                        />
                        <span>Sertakan Tanggal &amp; Waktu Cetak</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localConfig.tampilkanKodeDokumen}
                          onChange={(e) =>
                            setLocalConfig({
                              ...localConfig,
                              tampilkanKodeDokumen: e.target.checked,
                            })
                          }
                          className="rounded accent-emerald-500"
                        />
                        <span>Sertakan Kode Dokumen ({rpsData.kodeDokumen || "RPS"})</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRATINJAU LANGSUNG KOP SURAT */}
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Berikut adalah simulasi tampilan Kop Surat Resmi Universitas Pattimura yang akan disematkan ke dokumen PDF Anda:
              </div>

              {/* Box Pratinjau Kop Kertas Putih */}
              <div className="bg-white text-slate-900 p-6 rounded-xl border-2 border-slate-300 shadow-inner font-sans">
                {/* Header Layout */}
                <div className="flex items-center gap-4">
                  {localConfig.tampilkanLogo && (
                    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={UNPATTI_LOGO_DATA_URL}
                        alt="Logo UNPATTI"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex-1 text-center">
                    <div className="text-[11px] font-black tracking-wider text-slate-800 uppercase">
                      {localConfig.kementerian}
                    </div>
                    <div
                      className="text-base font-black tracking-wide uppercase mt-0.5"
                      style={{ color: localConfig.warnaAksen }}
                    >
                      {localConfig.universitas}
                    </div>
                    <div className="text-sm font-black text-slate-900 tracking-wide uppercase mt-0.5">
                      {localConfig.fakultas}
                    </div>
                    <div className="text-xs font-bold text-slate-700 uppercase mt-0.5">
                      {localConfig.prodi}
                    </div>
                    <div className="text-[9.5px] text-slate-600 mt-1 leading-tight">
                      {localConfig.alamatKampus}
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      {localConfig.kontak}
                    </div>
                  </div>
                </div>

                {/* Garis Pemisah Sesuai Pilihan */}
                {localConfig.garisPemisah && (
                  <div className="mt-3">
                    {localConfig.layoutStyle === "resmi_ganda" ? (
                      <div className="space-y-[1.5px]">
                        <div
                          className="h-[2.5px]"
                          style={{ backgroundColor: localConfig.warnaAksen }}
                        ></div>
                        <div
                          className="h-[0.75px]"
                          style={{ backgroundColor: localConfig.warnaAksen }}
                        ></div>
                      </div>
                    ) : localConfig.layoutStyle === "modern_hijau" ? (
                      <div
                        className="h-[3px] rounded-full"
                        style={{ backgroundColor: localConfig.warnaAksen }}
                      ></div>
                    ) : (
                      <div className="h-[1px] bg-slate-900"></div>
                    )}
                  </div>
                )}

                {/* Dummy Konten Dokumen Bawah Kop */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-center text-xs font-bold text-slate-600">
                  [ KONTEN DOKUMEN RENCANA PEMBELAJARAN SEMESTER (RPS) BERBASIS OBE ]
                </div>

                {/* Dummy Running Footer */}
                {localConfig.tampilkanFooter && (
                  <div className="mt-6 pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
                    <div>{localConfig.footerLeftText}</div>
                    <div>
                      {localConfig.tampilkanKodeDokumen && (
                        <span>Dokumen: {rpsData.kodeDokumen || "PPP-RPS-01"} &bull; </span>
                      )}
                      <span>Rev: {rpsData.revisiKe || "00"}</span>
                    </div>
                    <div className="font-bold text-slate-800">Halaman 1 dari 4</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kop surat dinamis aktif: <strong>{localConfig.fakultas}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-black text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
            {onTriggerExportPdf && (
              <button
                type="button"
                onClick={handleSaveAndExport}
                className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Simpan &amp; Unduh PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
