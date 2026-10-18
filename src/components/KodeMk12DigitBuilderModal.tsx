import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Hash,
  BookOpen,
  Info,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  KELOMPOK_MK_OPTIONS,
  JENJANG_OPTIONS,
  KARAKTERISTIK_OPTIONS,
  JENJANG_DIGIT_MAP,
  KelompokMkCode,
  KodeMk12DigitStructure,
  buildKodeMk12Digit,
  validateKodeMk12Digit,
  guessProdiAbbr,
} from "../utils/kodeMk12DigitValidator";

interface KodeMk12DigitBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKode: string;
  namaProdi: string;
  jenjang?: string;
  onApplyKode: (kode12Digit: string) => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const KodeMk12DigitBuilderModal: React.FC<KodeMk12DigitBuilderModalProps> = ({
  isOpen,
  onClose,
  currentKode,
  namaProdi,
  jenjang = "S1",
  onApplyKode,
  showNotification,
}) => {
  const [kelompok, setKelompok] = useState<KelompokMkCode>("MWP");
  const [prodiCode, setProdiCode] = useState<string>("PNT");
  const [tahun, setTahun] = useState<string>("26");
  const [jenjangDigit, setJenjangDigit] = useState<"3" | "4" | "5" | "6" | "7" | "8" | "9">("6");
  const [karakteristik, setKarakteristik] = useState<"1" | "2">("1");
  const [nomorUrut, setNomorUrut] = useState<string>("01");

  useEffect(() => {
    if (isOpen) {
      // Cek apakah currentKode sudah 12 digit
      const validation = validateKodeMk12Digit(currentKode);
      if (validation.isValid && validation.parsed) {
        setKelompok(validation.parsed.kelompok);
        setProdiCode(validation.parsed.prodiCode);
        setTahun(validation.parsed.tahun);
        setJenjangDigit(validation.parsed.jenjangDigit);
        setKarakteristik(validation.parsed.karakteristik);
        setNomorUrut(validation.parsed.nomorUrut);
      } else {
        // Ambil default dari jenjang dan prodi
        const guessed = guessProdiAbbr(namaProdi);
        setProdiCode(guessed);
        const jDigit = JENJANG_DIGIT_MAP[jenjang] || "6";
        setJenjangDigit(jDigit);
      }
    }
  }, [isOpen, currentKode, namaProdi, jenjang]);

  if (!isOpen) return null;

  const currentStruct: KodeMk12DigitStructure = {
    kelompok,
    prodiCode: prodiCode.toUpperCase().slice(0, 3),
    tahun: tahun.slice(0, 2),
    jenjangDigit,
    karakteristik,
    nomorUrut: nomorUrut.slice(0, 2),
  };

  const previewCode = buildKodeMk12Digit(currentStruct);
  const validation = validateKodeMk12Digit(previewCode);

  const handleApply = () => {
    if (!validation.isValid) {
      showNotification(validation.error || "Format kode belum valid.", "error");
      return;
    }
    onApplyKode(previewCode);
    showNotification(`Kode MK 12 Digit (${previewCode}) berhasil diterapkan sesuai Pasal 41!`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shadow-inner">
              <Hash className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 font-bold block">
                Pasal 41 Peraturan Rektor No. 12 Tahun 2026
              </span>
              <h3 className="text-base font-extrabold leading-tight">
                Generator &amp; Standarisasi Kode MK 12 Digit
              </h3>
              <p className="text-[11px] text-emerald-200">
                Struktur 12 Digit Unik: 6 Huruf (Kelompok + Prodi) &amp; 6 Angka (Tahun + Jenjang + Karakteristik + Nomor Urut)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-800">
          {/* Live Preview Display */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-400 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Pratinjau Kode Mata Kuliah 12 Digit:
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  validation.isValid
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-rose-100 text-rose-800 border-rose-300"
                }`}
              >
                {validation.isValid ? "Valid 12 Digit (Pasal 41)" : "Belum Sesuai"}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1 sm:gap-2 my-2 font-mono">
              <div className="bg-emerald-900 text-white px-2.5 py-1.5 rounded-lg text-center">
                <div className="text-sm sm:text-base font-black tracking-wider">{kelompok}</div>
                <div className="text-[8.5px] text-emerald-300">3 Huruf Kelompok</div>
              </div>
              <span className="text-slate-400 font-bold">+</span>
              <div className="bg-teal-800 text-white px-2.5 py-1.5 rounded-lg text-center">
                <div className="text-sm sm:text-base font-black tracking-wider">{prodiCode.toUpperCase().slice(0, 3)}</div>
                <div className="text-[8.5px] text-teal-200">3 Huruf Prodi</div>
              </div>
              <span className="text-slate-400 font-bold">+</span>
              <div className="bg-blue-800 text-white px-2 py-1.5 rounded-lg text-center">
                <div className="text-sm sm:text-base font-black tracking-wider">{tahun}</div>
                <div className="text-[8.5px] text-blue-200">Tahun</div>
              </div>
              <div className="bg-indigo-800 text-white px-2 py-1.5 rounded-lg text-center">
                <div className="text-sm sm:text-base font-black tracking-wider">{jenjangDigit}</div>
                <div className="text-[8.5px] text-indigo-200">Jenjang</div>
              </div>
              <div className="bg-purple-800 text-white px-2 py-1.5 rounded-lg text-center">
                <div className="text-sm sm:text-base font-black tracking-wider">{karakteristik}</div>
                <div className="text-[8.5px] text-purple-200">Nilai</div>
              </div>
              <div className="bg-amber-800 text-white px-2 py-1.5 rounded-lg text-center">
                <div className="text-sm sm:text-base font-black tracking-wider">{nomorUrut}</div>
                <div className="text-[8.5px] text-amber-200">No. Urut</div>
              </div>
            </div>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-500 font-medium">Hasil Akhir: </span>
              <strong className="text-base sm:text-lg font-mono font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-inner inline-block">
                {previewCode}
              </strong>
            </div>
          </div>

          {/* Builder Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* 1. Kelompok MK */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                1. Kelompok Mata Kuliah (Pasal 41 Ayat 3)
              </label>
              <select
                value={kelompok}
                onChange={(e) => setKelompok(e.target.value as KelompokMkCode)}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                {KELOMPOK_MK_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[9.5px] text-slate-500">
                {KELOMPOK_MK_OPTIONS.find((k) => k.code === kelompok)?.desc}
              </p>
            </div>

            {/* 2. Singkatan Prodi */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                2. Singkatan Program Studi (Pasal 41 Ayat 4)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={3}
                  value={prodiCode}
                  onChange={(e) => setProdiCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: PNT"
                  className="w-full text-xs p-2 border border-slate-300 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setProdiCode(guessProdiAbbr(namaProdi))}
                  className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-bold flex-shrink-0"
                  title="Deteksi singkatan otomatis dari nama prodi"
                >
                  Auto
                </button>
              </div>
              <p className="text-[9.5px] text-slate-500">
                3 huruf singkatan prodi resmi SK Rektor (misal: PNT, AGR, HUK, BIO, KIM)
              </p>
            </div>

            {/* 3. Tahun Kurikulum */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                3. Tahun Kurikulum (Pasal 41 Ayat 5a)
              </label>
              <input
                type="text"
                maxLength={2}
                value={tahun}
                onChange={(e) => setTahun(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="26"
                className="w-full text-xs p-2 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <p className="text-[9.5px] text-slate-500">
                2 angka penanda tahun berlakunya kurikulum (contoh: 26 = Kurikulum 2026)
              </p>
            </div>

            {/* 4. Digit Jenjang */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                4. Jenjang Pendidikan (Pasal 41 Ayat 5b)
              </label>
              <select
                value={jenjangDigit}
                onChange={(e) => setJenjangDigit(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                {JENJANG_OPTIONS.map((opt) => (
                  <option key={opt.digit} value={opt.digit}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[9.5px] text-slate-500">
                Digit 6 untuk Sarjana (S1/D4), 8 untuk Magister (S2), 9 untuk Doktor (S3)
              </p>
            </div>

            {/* 5. Karakteristik Nilai */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                5. Karakteristik Nilai Mata Kuliah (Pasal 41 Ayat 5c)
              </label>
              <select
                value={karakteristik}
                onChange={(e) => setKarakteristik(e.target.value as any)}
                className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-white font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
              >
                {KARAKTERISTIK_OPTIONS.map((opt) => (
                  <option key={opt.digit} value={opt.digit}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-[9.5px] text-slate-500">
                Angka 1 untuk nilai mutu huruf A-E, angka 2 untuk keterangan Lulus/Tidak Lulus
              </p>
            </div>

            {/* 6. Nomor Urut MK */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                6. Nomor Urut Mata Kuliah (Pasal 41 Ayat 5d)
              </label>
              <input
                type="text"
                maxLength={2}
                value={nomorUrut}
                onChange={(e) => setNomorUrut(e.target.value.replace(/[^0-9]/g, "").padStart(2, "0").slice(-2))}
                placeholder="01"
                className="w-full text-xs p-2 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <p className="text-[9.5px] text-slate-500">
                2 angka nomor urut mata kuliah dalam kelompoknya (01 sampai 99)
              </p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10.5px] text-slate-600 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Amanat Pasal 41 Ayat 6:</strong> Perubahan kode mata kuliah hanya dapat dilakukan apabila terjadi perubahan kurikulum, perubahan status mata kuliah, atau perubahan nomenklatur program studi berdasarkan ketentuan yang berlaku.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!validation.isValid}
            className="px-6 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <span>Terapkan Kode 12 Digit</span>
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
