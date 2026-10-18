import React, { useState, useEffect } from "react";
import {
  UNPATTI_PRODI_DATABASE,
  ProdiItem,
  JenjangPendidikan,
  getFacultyStatutaColor,
} from "../data/unpattiProdiDatabase";
import {
  Search,
  X,
  ExternalLink,
  Copy,
  Check,
  Building2,
  GraduationCap,
  Sparkles,
  BookOpen,
  Lock,
  LockOpen,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface ProdiDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProdi: (prodi: ProdiItem) => void;
  currentKodeProdi?: string;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const ProdiDirectoryModal: React.FC<ProdiDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectProdi,
  currentKodeProdi,
  showNotification,
}) => {
  // Password security gate state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Directory filter & search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJenjangFilter, setSelectedJenjangFilter] = useState<string>("ALL");
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>("ALL");
  const [copiedKode, setCopiedKode] = useState<string | null>(null);

  // Reset lock state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setIsUnlocked(false);
      setPasswordInput("");
      setPasswordError("");
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle password submission
  const handleVerifyPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput.trim() === "1234") {
      setIsUnlocked(true);
      setPasswordError("");
      showNotification(
        "Password benar! Daftar 117 Program Studi UNPATTI berhasil dibuka.",
        "success"
      );
    } else {
      setPasswordError("Password salah! Masukkan password keamanan yang valid.");
    }
  };

  // 1. Password Security Gate Modal (Shown when not unlocked yet)
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border-2 border-slate-300 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Keamanan Akses Direktori</h3>
                <p className="text-[11px] text-blue-200">Daftar 117 Program Studi UNPATTI</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Keamanan */}
          <form onSubmit={handleVerifyPassword} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold text-amber-950">Akses Dilindungi Password</p>
                <p className="text-[11.5px] text-amber-800 mt-0.5">
                  Untuk keamanan dan mencegah penyalahgunaan data, silakan masukkan password verifikasi Anda.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Password Keamanan:</span>
                <span className="text-[10.5px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                  Akses Terproteksi
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Masukkan password..."
                  autoFocus
                  required
                  className="w-full text-sm font-mono tracking-wider px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <p className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-2 py-2.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <KeyRound className="w-4 h-4 text-amber-300" />
                <span>Buka Daftar 117 Prodi</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Full Directory Modal (Displayed only AFTER entering correct password = 1234)
  const faculties = Array.from(
    new Set(UNPATTI_PRODI_DATABASE.map((p) => p.fakultas))
  ).sort();

  // Filter prodis
  const filteredProdis = UNPATTI_PRODI_DATABASE.filter((prodi) => {
    // Jenjang filter
    if (selectedJenjangFilter !== "ALL") {
      if (prodi.jenjang !== selectedJenjangFilter) return false;
    }

    // Faculty filter
    if (selectedFacultyFilter !== "ALL") {
      if (prodi.fakultas !== selectedFacultyFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchKode = prodi.kodeProdi.toLowerCase().includes(q);
      const matchName = prodi.namaProdi.toLowerCase().includes(q);
      const matchFaculty = prodi.fakultas.toLowerCase().includes(q);
      const matchKaprodi = prodi.namaKaprodi.toLowerCase().includes(q);
      if (!matchKode && !matchName && !matchFaculty && !matchKaprodi) {
        return false;
      }
    }

    return true;
  });

  const getSemesterCountText = (jenjang: JenjangPendidikan): string => {
    if (jenjang === "S2" || jenjang === "Profesi") return "4 Semester";
    if (jenjang === "S3") return "6 Semester";
    return "8 Semester"; // S1 and Spesialis
  };

  const handleCopyLink = (prodi: ProdiItem) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const url = `${origin}${pathname}?prodi=${encodeURIComponent(prodi.kodeProdi)}`;
    navigator.clipboard.writeText(url);
    setCopiedKode(prodi.kodeProdi);
    showNotification(
      `Tautan langsung portal Prodi ${prodi.namaProdi} berhasil disalin ke clipboard!`,
      "success"
    );
    setTimeout(() => {
      setCopiedKode(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border-2 border-slate-300 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-blue-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 p-2 border border-white/20 flex items-center justify-center text-amber-300">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Portal Spesifik Program Studi UNPATTI
                </span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full font-bold">
                  {UNPATTI_PRODI_DATABASE.length} Program Studi
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <LockOpen className="w-3 h-3 text-emerald-300" />
                  Akses Terbuka (Terverifikasi)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Daftar 117 Program Studi &amp; Kode Prodi Resmi
              </h2>
              <p className="text-xs text-blue-200">
                Pilih atau salin tautan portal khusus untuk setiap Program Studi di lingkungan Universitas Pattimura
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsUnlocked(false);
                showNotification("Daftar 117 Prodi telah dikunci kembali.", "info");
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition cursor-pointer flex items-center gap-1 text-xs"
              title="Kunci kembali direktori prodi"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline text-[11px] font-bold">Kunci</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 flex-shrink-0">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama Program Studi, Fakultas, atau Kode Prodi..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Jenjang Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black text-slate-700 mr-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
              Jenjang:
            </span>
            {[
              { id: "ALL", label: "Semua Jenjang" },
              { id: "S1", label: "S1 (8 Sem)" },
              { id: "S2", label: "S2 (4 Sem)" },
              { id: "S3", label: "S3 (6 Sem)" },
              { id: "Profesi", label: "Profesi (4 Sem)" },
              { id: "Spesialis", label: "Spesialis (8 Sem)" },
            ].map((jenjang) => (
              <button
                key={jenjang.id}
                type="button"
                onClick={() => setSelectedJenjangFilter(jenjang.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer active:scale-95 ${
                  selectedJenjangFilter === jenjang.id
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-300"
                }`}
              >
                {jenjang.label}
              </button>
            ))}
          </div>

          {/* Faculty Dropdown Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              Fakultas / Unit:
            </span>
            <select
              value={selectedFacultyFilter}
              onChange={(e) => setSelectedFacultyFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer max-w-full"
            >
              <option value="ALL">Semua Fakultas &amp; Pascasarjana / PSDKU ({faculties.length})</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            <span className="text-[11px] text-slate-500 font-medium ml-auto">
              Menampilkan <strong>{filteredProdis.length}</strong> dari {UNPATTI_PRODI_DATABASE.length} Program Studi
            </span>
          </div>
        </div>

        {/* Prodi List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 divide-y divide-slate-100">
          {filteredProdis.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm">Tidak ada Program Studi yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">
                Silakan ubah kata kunci pencarian atau reset filter jenjang/fakultas.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedJenjangFilter("ALL");
                  setSelectedFacultyFilter("ALL");
                }}
                className="mt-3 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            filteredProdis.map((prodi) => {
              const statuta = getFacultyStatutaColor(prodi.fakultas);
              const isCurrent = currentKodeProdi === prodi.kodeProdi;
              const semesterText = getSemesterCountText(prodi.jenjang);

              return (
                <div
                  key={prodi.kodeProdi}
                  className={`pt-2.5 pb-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-3 transition ${
                    isCurrent
                      ? "bg-blue-50 border-2 border-blue-400 shadow-xs"
                      : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  }`}
                >
                  {/* Left: Info Prodi */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: statuta.hexFill,
                        color: statuta.hexText,
                        border: statuta.border || "none",
                      }}
                      title={statuta.name}
                    >
                      {prodi.jenjang}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-slate-900 truncate">
                          {prodi.namaProdi}
                        </span>
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 border border-slate-300">
                          Kode: {prodi.kodeProdi}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {semesterText}
                        </span>
                        {isCurrent && (
                          <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                            Aktif Saat Ini
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                        {prodi.fakultas}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(prodi)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                        copiedKode === prodi.kodeProdi
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                      }`}
                      title={`Salin tautan langsung portal ?prodi=${prodi.kodeProdi}`}
                    >
                      {copiedKode === prodi.kodeProdi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Tautan Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectProdi(prodi);
                        onClose();
                      }}
                      className="text-xs px-3.5 py-1.5 rounded-xl font-black bg-blue-700 hover:bg-blue-800 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 border border-blue-600"
                    >
                      <span>Buka Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 flex-shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700 flex-shrink-0" />
            <span>
              Format RPS OBE terkalibrasi otomatis sesuai jenjang: <strong>S1/Spesialis (8 Semester)</strong>, <strong>S2/Profesi (4 Semester)</strong>, dan <strong>S3 (6 Semester)</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
