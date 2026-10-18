import React, { useState, useEffect } from "react";
import { UserRole, UserSession } from "../types/auth";
import {
  UNPATTI_PRODI_DATABASE,
  ProdiItem,
  JenjangPendidikan,
  findProdiByKode,
  findProdiByName,
} from "../data/unpattiProdiDatabase";
import {
  Lock,
  User,
  GraduationCap,
  ShieldCheck,
  Building2,
  AlertCircle,
  X,
  KeyRound,
  ArrowRight,
  LogIn,
  Sparkles,
  Hash,
  BookOpen,
} from "lucide-react";
import { UNPATTI_LOGO_DATA_URL } from "../data/unpattiLogo";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession, selectedProdi: ProdiItem) => void;
  currentSession: UserSession | null;
  isLandingPage?: boolean;
  onOpenDirectory?: () => void;
  initialProdi?: ProdiItem | null;
}

// 5 Default password resmi yang bisa lolos masuk sesuai revisi user (Disembunyikan dari UI)
export const DEFAULT_ALLOWED_PASSWORDS = [
  "desain-rpsobes1",
  "desain-rpsobes2",
  "desain-rpsobes3",
  "desain-rpsobess-pesialis",
  "desain-rpsobes-profesi",
] as const;

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentSession,
  isLandingPage = false,
  onOpenDirectory,
  initialProdi,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(
    currentSession?.role || "dosen"
  );

  // Akses awal semua dikosongkan sesuai permintaan revisi
  const [prodiFakultasInput, setProdiFakultasInput] = useState<string>(
    initialProdi
      ? `${initialProdi.namaProdi} - ${initialProdi.fakultas}`
      : currentSession?.namaProdi
      ? `${currentSession.namaProdi}${currentSession.namaFakultas ? ` - ${currentSession.namaFakultas}` : ""}`
      : ""
  );
  const [kodeProdiInput, setKodeProdiInput] = useState<string>(
    initialProdi?.kodeProdi || currentSession?.kodeProdi || ""
  );
  const [namaPengguna, setNamaPengguna] = useState<string>(
    currentSession?.nama || ""
  );
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Sync if initialProdi updates from URL
  useEffect(() => {
    if (initialProdi) {
      setProdiFakultasInput(`${initialProdi.namaProdi} - ${initialProdi.fakultas}`);
      setKodeProdiInput(initialProdi.kodeProdi);
    }
  }, [initialProdi]);

  if (!isOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setErrorMessage("");
    // Jangan isi otomatis nama Dr. Bruri Penabur - tetap kosong jika belum diisi pengguna
  };

  // Autocomplete matching against 117 UNPATTI Prodis
  const matchedSuggestions = prodiFakultasInput.trim().length >= 2
    ? UNPATTI_PRODI_DATABASE.filter(
        (p) =>
          p.namaProdi.toLowerCase().includes(prodiFakultasInput.toLowerCase()) ||
          p.kodeProdi.includes(prodiFakultasInput.trim()) ||
          p.fakultas.toLowerCase().includes(prodiFakultasInput.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectSuggestion = (prodi: ProdiItem) => {
    setProdiFakultasInput(`${prodi.namaProdi} - ${prodi.fakultas}`);
    setKodeProdiInput(prodi.kodeProdi);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanedPassword = passwordInput.trim().toLowerCase();
    const cleanedKodeProdi = kodeProdiInput.trim();

    // Verifikasi password: bisa lolos jika cocok dengan 5 password resmi ATAU cocok dengan Kode Prodi
    const isAllowedDefault = DEFAULT_ALLOWED_PASSWORDS.some(
      (p) => p.toLowerCase() === cleanedPassword
    );
    const isMatchingKodeProdi = Boolean(
      cleanedKodeProdi && cleanedPassword === cleanedKodeProdi.toLowerCase()
    );
    // Juga cek jika password cocok dengan kode prodi yang terdaftar di database UNPATTI
    const matchedByPasswordAsKode = UNPATTI_PRODI_DATABASE.find(
      (p) => p.kodeProdi.toLowerCase() === cleanedPassword
    );

    if (!isAllowedDefault && !isMatchingKodeProdi && !matchedByPasswordAsKode) {
      setErrorMessage(
        "Password akses salah! Silakan masukkan password akses yang valid."
      );
      return;
    }

    if (!prodiFakultasInput.trim()) {
      setErrorMessage("Program Studi & Fakultas/Pascasarjana/PSDKU tidak boleh kosong.");
      return;
    }

    if (!namaPengguna.trim()) {
      setErrorMessage("Nama pengguna / Dosen pengampu tidak boleh kosong.");
      return;
    }

    // Cari database UNPATTI untuk mencocokkan jika ada CPL prodi yang relevan
    const matchedProdi =
      findProdiByKode(cleanedKodeProdi) ||
      matchedByPasswordAsKode ||
      UNPATTI_PRODI_DATABASE.find(
        (p) =>
          p.namaProdi.toLowerCase().includes(prodiFakultasInput.toLowerCase()) ||
          prodiFakultasInput.toLowerCase().includes(p.namaProdi.toLowerCase())
      );

    // Deteksi jenjang otomatis dari password atau database atau input
    let detectedJenjang: JenjangPendidikan = "S1";
    if (cleanedPassword === "desain-rpsobes1") {
      detectedJenjang = "S1";
    } else if (cleanedPassword === "desain-rpsobes2") {
      detectedJenjang = "S2";
    } else if (cleanedPassword === "desain-rpsobes3") {
      detectedJenjang = "S3";
    } else if (cleanedPassword === "desain-rpsobess-pesialis") {
      detectedJenjang = "Spesialis";
    } else if (cleanedPassword === "desain-rpsobes-profesi") {
      detectedJenjang = "Profesi";
    } else if (matchedProdi) {
      detectedJenjang = matchedProdi.jenjang;
    } else {
      const up = prodiFakultasInput.toUpperCase();
      if (up.includes("S2") || up.includes("MAGISTER")) detectedJenjang = "S2";
      else if (up.includes("S3") || up.includes("DOKTOR")) detectedJenjang = "S3";
      else if (up.includes("PROFESI")) detectedJenjang = "Profesi";
      else if (up.includes("SPESIALIS") || up.includes("SPESIAL")) detectedJenjang = "Spesialis";
    }

    let parsedProdi = prodiFakultasInput.trim();
    let parsedFakultas = "Universitas Pattimura";
    if (prodiFakultasInput.includes("•")) {
      const parts = prodiFakultasInput.split("•");
      parsedProdi = parts[0].trim();
      parsedFakultas = parts[1].trim();
    } else if (prodiFakultasInput.includes("-")) {
      const parts = prodiFakultasInput.split("-");
      parsedProdi = parts[0].trim();
      parsedFakultas = parts[1].trim();
    } else if (matchedProdi) {
      parsedFakultas = matchedProdi.fakultas;
    }

    const finalProdiItem: ProdiItem = {
      kodeProdi: cleanedKodeProdi || (matchedProdi?.kodeProdi || ""),
      namaProdi: parsedProdi,
      fakultas: parsedFakultas,
      jenjang: detectedJenjang,
      namaKaprodi: activeRole === "kaprodi" ? namaPengguna.trim() : (matchedProdi?.namaKaprodi || ""),
      cplList: matchedProdi?.cplList || [],
    };

    const session: UserSession = {
      role: activeRole,
      nama: namaPengguna.trim(),
      kodeProdi: finalProdiItem.kodeProdi,
      namaProdi: finalProdiItem.namaProdi,
      namaFakultas: finalProdiItem.fakultas,
      jenjang: detectedJenjang,
      isLoggedIn: true,
    };

    onLoginSuccess(session, finalProdiItem);
    onClose();
  };

  return (
    <div
      className={
        isLandingPage
          ? "min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 z-50 overflow-y-auto"
          : "fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      }
    >
      <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200 w-full max-w-lg overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* HEADER KOP: Huruf warna biru terang & jelas */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-b-2 border-blue-100 flex items-center justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-700"></div>

          <div className="flex items-center space-x-3.5 pl-1">
            <div className="w-14 h-14 bg-white rounded-2xl p-1.5 shadow-md border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <img
                src={UNPATTI_LOGO_DATA_URL}
                alt="Logo UNPATTI"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              {/* Sistem Autentikasi RPS OBE: Warna Biru Jelas */}
              <div className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Sistem Autentikasi RPS OBE</span>
              </div>

              {/* RPS OBE Portal Akademik: Warna Biru Jelas */}
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-blue-700 my-0.5">
                RPS OBE Portal Akademik
              </h1>

              {/* Dosen & Kaprodi Universitas Pattimura Ambon: Warna Biru Jelas */}
              <div className="text-xs sm:text-sm font-extrabold text-blue-600">
                Dosen &amp; Kaprodi Universitas Pattimura Ambon
              </div>
            </div>
          </div>

          {!isLandingPage && currentSession?.isLoggedIn && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Portal Khusus Badge jika prodi spesifik terdeteksi dari URL */}
        {initialProdi && (
          <div className="px-5 py-2.5 bg-blue-600 text-white flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-4 h-4 flex-shrink-0 text-amber-300" />
              <span className="truncate">
                Portal: <strong>{initialProdi.namaProdi}</strong> (Kode: {initialProdi.kodeProdi})
              </span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-black uppercase whitespace-nowrap ml-2">
              {initialProdi.jenjang}
            </span>
          </div>
        )}

        {/* Form Container */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[82vh]">
          {/* Pilihan 3 Peran */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              Pilih Peran Pengguna (3 Peran Akademik)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange("dosen")}
                className={`py-2.5 px-2 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  activeRole === "dosen"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4 text-emerald-700" />
                <span>Dosen MK</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("kaprodi")}
                className={`py-2.5 px-2 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  activeRole === "kaprodi"
                    ? "bg-blue-50 border-blue-600 text-blue-950 shadow-sm ring-2 ring-blue-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Ka. Prodi</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("gjm")}
                className={`py-2.5 px-2 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                  activeRole === "gjm"
                    ? "bg-purple-50 border-purple-600 text-purple-950 shadow-sm ring-2 ring-purple-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>GJM / Mutu</span>
              </button>
            </div>

            {/* Keterangan Hak Akses Khusus Sesuai Peran */}
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              {activeRole === "dosen" && (
                <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span><strong>Hak Akses Dosen:</strong> Khusus tugas dosen pengampu (Editor RPS, Unggah Berkas, Pratinjau Dokumen, dan Integrasi Simpel-CPL).</span>
                </div>
              )}
              {activeRole === "kaprodi" && (
                <div className="flex items-center gap-1.5 text-blue-800 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span><strong>Hak Akses Kaprodi:</strong> Khusus tugas Ketua Prodi (Validasi &amp; Pengesahan RPS, Matriks Kurikulum Prodi, Kepatuhan Pasal 47 Peraturan Rektor No. 12/2026).</span>
                </div>
              )}
              {activeRole === "gjm" && (
                <div className="flex items-center gap-1.5 text-purple-800 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                  <span><strong>Hak Akses GJM:</strong> Khusus Gugus Jaminan Mutu (Audit Mutu Internal AMI 8 Standar SN-Dikti &amp; Rekomendasi Akreditasi).</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Field Isian: Program Studi & Fakultas/Pascasarjana/PSDKU */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-800 font-black">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  Program Studi &amp; Fakultas/Pascasarjana/PSDKU
                </span>
                {onOpenDirectory && (
                  <button
                    type="button"
                    onClick={onOpenDirectory}
                    className="text-[10.5px] text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-blue-50/70 hover:bg-blue-100/70 px-2 py-0.5 rounded-md border border-blue-200/60 transition"
                    title="Buka daftar 117 Program Studi UNPATTI (Perlu Password Keamanan)"
                  >
                    <BookOpen className="w-3 h-3 text-blue-700" />
                    <span>Daftar 117 Prodi</span>
                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                  </button>
                )}
              </label>
              <input
                type="text"
                value={prodiFakultasInput}
                onChange={(e) => {
                  setProdiFakultasInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Program Studi & Fakultas/Pascasarjana/PSDKU..."
                required
                className="w-full text-xs px-3 py-2.5 border-2 border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600 shadow-2xs"
              />

              {/* Suggestions popover */}
              {showSuggestions && matchedSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                  <div className="px-3 py-1.5 bg-blue-50 text-[10px] font-black text-blue-800 uppercase tracking-wider border-b border-blue-100 flex items-center justify-between">
                    <span>Saran Program Studi Resmi UNPATTI:</span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {matchedSuggestions.map((item) => (
                    <div
                      key={item.kodeProdi}
                      onMouseDown={() => handleSelectSuggestion(item)}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.namaProdi}</div>
                        <div className="text-[10px] text-slate-500">{item.fakultas}</div>
                      </div>
                      <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.kodeProdi}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Field Isian: Kode Prodi */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kode Prodi</span>
              </label>
              <input
                type="text"
                value={kodeProdiInput}
                onChange={(e) => setKodeProdiInput(e.target.value)}
                placeholder="Masukkan Kode Prodi..."
                className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-xl font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Nama Pengguna / Dosen Pengampu */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {activeRole === "kaprodi"
                  ? "Nama Ketua Program Studi (KaProdi)"
                  : activeRole === "gjm"
                  ? "Nama Tim GJM / Gugus Penjaminan Mutu"
                  : "Nama Dosen Pengampu Mata Kuliah"}
              </label>
              <input
                type="text"
                value={namaPengguna}
                onChange={(e) => setNamaPengguna(e.target.value)}
                placeholder="Masukkan gelar dan nama lengkap..."
                required
                className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-xl font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Password Akses */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                  Password Akses Masuk
                </span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password akses..."
                  required
                  className="w-full text-xs px-3 py-2 pl-9 border-2 border-slate-300 rounded-xl font-mono font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Pesan Error jika password salah */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* TOMBOL MASUK RESMI SESUAI PERAN */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm text-white shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer border ${
                  activeRole === "dosen"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/30 border-emerald-500"
                    : activeRole === "kaprodi"
                    ? "bg-blue-700 hover:bg-blue-800 shadow-blue-900/30 border-blue-600"
                    : "bg-purple-700 hover:bg-purple-800 shadow-purple-900/30 border-purple-600"
                }`}
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>
                  {activeRole === "dosen"
                    ? "Masuk ke Tugas Dosen (Editor RPS)"
                    : activeRole === "kaprodi"
                    ? "Masuk ke Dashboard Kaprodi (Wewenang & Pengesahan)"
                    : "Masuk ke Portal Audit Mutu GJM"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
