import React from "react";
import {
  Laptop,
  Users,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  MonitorCheck,
  ChevronDown,
  Building,
} from "lucide-react";
import { SyllabusWeek } from "../types/rps";

interface SyllabusBlendedDeliveryManagerProps {
  syllabusList: SyllabusWeek[];
  onUpdateSyllabus: (updated: SyllabusWeek[]) => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const SyllabusBlendedDeliveryManager: React.FC<SyllabusBlendedDeliveryManagerProps> = ({
  syllabusList,
  onUpdateSyllabus,
  showNotification,
}) => {
  // Hitung jumlah minggu daring vs luring
  const totalWeeks = syllabusList.length || 16;
  const daringCount = syllabusList.filter((w) => w.deliveryMode === "daring").length;
  const hybridCount = syllabusList.filter((w) => w.deliveryMode === "hybrid").length;
  // Untuk hybrid, dihitung 0.5 daring atau terpisah; sesuai aturan umum tatap muka daring
  const effectiveDaringCount = daringCount + (hybridCount * 0.5);
  const luringCount = totalWeeks - daringCount - hybridCount;

  const daringPercentage = totalWeeks > 0 ? Math.round((effectiveDaringCount / totalWeeks) * 100) : 0;
  const isDaringCompliant = daringPercentage <= 40; // Maksimal 40% sesuai Pasal 43 Ayat 4 (maksimal 6.4 minggu -> 6 minggu)

  const handleDeliveryModeChange = (weekIndex: number, mode: "luring" | "daring" | "hybrid") => {
    const updated = [...syllabusList];
    updated[weekIndex] = {
      ...updated[weekIndex],
      deliveryMode: mode,
    };
    onUpdateSyllabus(updated);
  };

  const handleApplyPreset = (preset: "standard" | "full_luring" | "max_daring") => {
    if (!syllabusList || syllabusList.length === 0) {
      showNotification("Silabus mingguan belum tersedia. Silakan susun silabus terlebih dahulu.", "info");
      return;
    }

    const updated = syllabusList.map((w, idx) => {
      // UTS (Mg 8) dan UAS (Mg 16) selalu Luring/Evaluasi Terjadwal
      if (w.isExam || idx === 7 || idx === 15) {
        return { ...w, deliveryMode: "luring" as const, lmsPlatform: "LMS Unpatti (CBT/Ujian)" };
      }

      if (preset === "full_luring") {
        return { ...w, deliveryMode: "luring" as const, lmsPlatform: "LMS Unpatti (Bahan Ajar)" };
      }

      if (preset === "standard") {
        // 4 Minggu Daring (Minggu 3, 5, 11, 13) -> 25% Daring, sangat aman dari batas 40%
        const isDaringWeek = [2, 4, 10, 12].includes(idx);
        return {
          ...w,
          deliveryMode: isDaringWeek ? ("daring" as const) : ("luring" as const),
          lmsPlatform: isDaringWeek ? "LMS Unpatti (Forum Diskusi & Kuis Daring)" : "LMS Unpatti (Materi Pendukung)",
        };
      }

      if (preset === "max_daring") {
        // 6 Minggu Daring (Minggu 2, 4, 6, 10, 12, 14) -> 37.5% Daring (Pasal 43 Ayat 4)
        const isDaringWeek = [1, 3, 5, 9, 11, 13].includes(idx);
        return {
          ...w,
          deliveryMode: isDaringWeek ? ("daring" as const) : ("luring" as const),
          lmsPlatform: isDaringWeek ? "LMS Unpatti (Modul Interaktif Daring)" : "LMS Unpatti (Materi Kelas)",
        };
      }

      return w;
    });

    onUpdateSyllabus(updated);
    if (preset === "standard") {
      showNotification("Pola Blended Learning Standar diterapkan: 4 Minggu Daring (25%), 12 Minggu Luring (75%)!", "success");
    } else if (preset === "full_luring") {
      showNotification("Pola 100% Tatap Muka Luring diterapkan!", "info");
    } else if (preset === "max_daring") {
      showNotification("Pola Daring Maksimal diterapkan: 6 Minggu Daring (37.5% <= 40%)!", "success");
    }
  };

  return (
    <div className="border-2 border-teal-300 rounded-2xl p-4 bg-gradient-to-r from-teal-50/70 via-blue-50/50 to-slate-50/80 shadow-sm space-y-3.5">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
              <Laptop className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Manajemen Moda Pembelajaran Silabus (Pasal 43 Peraturan Rektor No. 12 Tahun 2026)
            </h3>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${
                isDaringCompliant
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-rose-100 text-rose-900 border-rose-300"
              }`}
            >
              {isDaringCompliant
                ? `Porsi Daring ${daringPercentage}% (Sesuai Batas <= 40%)`
                : `Porsi Daring ${daringPercentage}% (Melebihi Batas 40%)`}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-600 mt-1">
            <strong>Pasal 43 Ayat 4:</strong> Porsi pembelajaran daring dalam skema <em>hybrid</em> dan/atau <em>blended learning</em> dilaksanakan <strong>paling banyak 40%</strong> (maksimal 6 minggu dari 16 pertemuan semester).
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleApplyPreset("standard")}
            className="text-[10px] bg-teal-700 hover:bg-teal-800 text-white font-bold px-2.5 py-1 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
            title="Terapkan 4 minggu daring (25%) dan 12 minggu luring"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Preset Blended (25% Daring)</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("max_daring")}
            className="text-[10px] bg-blue-700 hover:bg-blue-800 text-white font-bold px-2.5 py-1 rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
            title="Terapkan batas maksimal 6 minggu daring (37.5%)"
          >
            <MonitorCheck className="w-3 h-3 text-cyan-300" />
            <span>Batas Maks. (37.5% Daring)</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset("full_luring")}
            className="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-2.5 py-1 rounded-lg shadow-xs transition cursor-pointer"
            title="Terapkan 100% tatap muka luring di kelas"
          >
            100% Luring
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block">Tatap Muka Luring</span>
          <strong className="text-sm sm:text-base font-black text-emerald-700">{luringCount} Minggu</strong>
          <span className="text-[9.5px] text-slate-500 block">
            {totalWeeks > 0 ? Math.round((luringCount / totalWeeks) * 100) : 0}% di Ruang Kelas
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block">Daring / LMS Sinkron</span>
          <strong className="text-sm sm:text-base font-black text-blue-700">{daringCount} Minggu</strong>
          <span className="text-[9.5px] text-slate-500 block">
            {totalWeeks > 0 ? Math.round((daringCount / totalWeeks) * 100) : 0}% Daring Penuh
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-teal-200 shadow-xs">
          <span className="text-[10px] text-slate-500 font-bold block">Hybrid Learning</span>
          <strong className="text-sm sm:text-base font-black text-purple-700">{hybridCount} Minggu</strong>
          <span className="text-[9.5px] text-slate-500 block">Kombinasi Luring-Daring</span>
        </div>

        <div className={`p-2.5 rounded-xl border shadow-xs ${
          isDaringCompliant ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"
        }`}>
          <span className="text-[10px] text-slate-600 font-bold block">Audit Pasal 43 Ayat 4</span>
          <strong className={`text-xs sm:text-sm font-black block ${
            isDaringCompliant ? "text-emerald-800" : "text-rose-700"
          }`}>
            {isDaringCompliant ? "Kepatuhan Terpenuhi" : "Melebihi Batas 40%"}
          </strong>
          <span className="text-[9.5px] text-slate-500 block">Maks. 6 Minggu Daring</span>
        </div>
      </div>

      {/* Week-by-Week Interactive Delivery Mode Selector */}
      {syllabusList && syllabusList.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-700 border-b border-slate-200 flex items-center justify-between">
            <span>Rincian Moda Perkuliahan per Pertemuan (16 Minggu)</span>
            <span className="text-[10px] text-slate-500 font-normal">Klik untuk mengubah moda per minggu</span>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-[11px]">
            {syllabusList.map((week, idx) => {
              const currentMode = week.deliveryMode || "luring";
              const isExamWeek = week.isExam || idx === 7 || idx === 15;

              return (
                <div
                  key={week.week || idx}
                  className={`p-2.5 flex items-center justify-between gap-2 transition hover:bg-slate-50 ${
                    isExamWeek ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-black text-xs text-slate-800 w-12 flex-shrink-0">
                      {week.week || `Mg ${idx + 1}`}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate">
                        {isExamWeek ? (
                          <strong className="text-amber-900">
                            {idx === 7 ? "UJIAN TENGAH SEMESTER (UTS)" : "UJIAN AKHIR SEMESTER (UAS)"}
                          </strong>
                        ) : (
                          week.materi || week.sub || "Materi Pembelajaran"
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {week.metode || "Metode Pembelajaran [BT+PT+BM]"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeliveryModeChange(idx, "luring")}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                        currentMode === "luring"
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                          : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      Luring (Tatap Muka)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeliveryModeChange(idx, "daring")}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                        currentMode === "daring"
                          ? "bg-blue-700 text-white border-blue-800 shadow-xs"
                          : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      Daring (LMS)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeliveryModeChange(idx, "hybrid")}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                        currentMode === "hybrid"
                          ? "bg-purple-700 text-white border-purple-800 shadow-xs"
                          : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      Hybrid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
          Silabus 16 minggu belum dirumuskan. Klik tombol <strong>&ldquo;Sinkronisasi AI Gemini (OBE)&rdquo;</strong> di atas untuk merumuskan silabus lengkap beserta rekomendasi moda blended learning.
        </div>
      )}

      {/* Integration with LMS Note (Pasal 43 Ayat 5) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[10px] text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MonitorCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span>
            <strong>Amanat Pasal 43 Ayat 5:</strong> Seluruh aktivitas perkuliahan daring wajib terintegrasi dengan LMS resmi Universitas Pattimura.
          </span>
        </div>
        <span className="text-[9.5px] font-mono text-teal-800 font-bold bg-teal-100 px-2 py-0.5 rounded">
          LMS UNPATTI Ready
        </span>
      </div>
    </div>
  );
};
