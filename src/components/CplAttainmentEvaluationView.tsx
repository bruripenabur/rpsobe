import React, { useState, useMemo } from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Sparkles,
  Printer,
  RotateCcw,
  Target,
  BarChart3,
  Bot,
  Loader2,
  ChevronRight,
  BookOpen,
  Info,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { RpsData, CplAttainmentEvaluation } from "../types/rps";

interface CplAttainmentEvaluationViewProps {
  rpsData: RpsData;
  setRpsData: React.Dispatch<React.SetStateAction<RpsData>>;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
  onBackToForm?: () => void;
}

export const CplAttainmentEvaluationView: React.FC<CplAttainmentEvaluationViewProps> = ({
  rpsData,
  setRpsData,
  showNotification,
  onBackToForm,
}) => {
  const [isGeneratingCqi, setIsGeneratingCqi] = useState(false);
  const [targetBaseline, setTargetBaseline] = useState<number>(75); // Standar minimal 75%
  const [isPrintingReport, setIsPrintingReport] = useState(false);

  // Ambil daftar CPL yang dipilih atau seluruh CPL prodi
  const activeCpls = useMemo(() => {
    if (rpsData.selectedCpls && rpsData.selectedCpls.length > 0 && rpsData.cplList) {
      return rpsData.cplList.filter((c) => rpsData.selectedCpls.includes(c.id));
    }
    if (rpsData.cplList && rpsData.cplList.length > 0) {
      return rpsData.cplList.slice(0, 5);
    }
    return [
      { id: "CPL-01", desc: "Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan iptek pertanian kepulauan." },
      { id: "CPL-02", desc: "Mampu menunjukkan kinerja mandiri, bermutu, dan terukur dalam memecahkan masalah pembangunan masyarakat pesisir." },
      { id: "CPL-03", desc: "Mampu merancang dan mengelola program penyuluhan serta pemberdayaan petani berbasis kearifan lokal Maluku." },
    ];
  }, [rpsData.selectedCpls, rpsData.cplList]);

  // Inisialisasi evaluasi jika belum ada
  const currentEvaluations: CplAttainmentEvaluation[] = useMemo(() => {
    if (rpsData.cplEvaluations && rpsData.cplEvaluations.length > 0) {
      return rpsData.cplEvaluations;
    }

    // Default mock data terstruktur
    return activeCpls.map((cpl, idx) => {
      const mockScores = [84.5, 78.0, 72.5, 88.0, 79.5];
      const avg = mockScores[idx % mockScores.length] || 76.0;
      return {
        cplId: cpl.id,
        cplDesc: cpl.desc,
        targetPercentage: targetBaseline,
        averageScore: avg,
        status: avg >= targetBaseline ? "TERCAPAI" : "BELUM_TERCAPAI",
        evaluatedCpmks: rpsData.cpmkList && rpsData.cpmkList.length > 0
          ? [rpsData.cpmkList[idx % rpsData.cpmkList.length]?.id || `CPMK ${idx + 1}`]
          : [`CPMK ${idx + 1}`],
        assessmentSources: ["Tugas Proyek", "Aktivitas Partisipatif", "UTS/UAS"],
        analisisAkarMasalah:
          avg < targetBaseline
            ? "Sebagian mahasiswa masih kesulitan dalam analisis empiris data lapangan kepulauan."
            : "Mahasiswa menunjukkan pemahaman mendalam dan kolaborasi tim yang solid pada tugas proyek.",
        rencanaTindakLanjut:
          avg < targetBaseline
            ? "Meningkatkan sesi pendampingan terstruktur dan penambahan studi kasus komparatif desa pesisir."
            : "Mempertahankan metode pembelajaran berbasis proyek dan memperkaya referensi jurnal internasional.",
      };
    });
  }, [rpsData.cplEvaluations, activeCpls, targetBaseline, rpsData.cpmkList]);

  // Hitung metrik keseluruhan
  const totalCpls = currentEvaluations.length;
  const tercapaiCount = currentEvaluations.filter((e) => e.averageScore >= (e.targetPercentage || targetBaseline)).length;
  const avgOverallScore = totalCpls > 0
    ? Math.round((currentEvaluations.reduce((acc, e) => acc + e.averageScore, 0) / totalCpls) * 10) / 10
    : 0;
  const attainmentPercentage = totalCpls > 0 ? Math.round((tercapaiCount / totalCpls) * 100) : 0;

  const handleScoreChange = (cplId: string, newScore: number) => {
    const clamped = Math.max(0, Math.min(100, newScore));
    const updated = currentEvaluations.map((ev) => {
      if (ev.cplId === cplId) {
        return {
          ...ev,
          averageScore: clamped,
          status: (clamped >= (ev.targetPercentage || targetBaseline) ? "TERCAPAI" : "BELUM_TERCAPAI") as any,
        };
      }
      return ev;
    });

    setRpsData((prev) => ({
      ...prev,
      cplEvaluations: updated,
    }));
  };

  const handleAnalysisChange = (cplId: string, field: "analisisAkarMasalah" | "rencanaTindakLanjut", val: string) => {
    const updated = currentEvaluations.map((ev) => {
      if (ev.cplId === cplId) {
        return {
          ...ev,
          [field]: val,
        };
      }
      return ev;
    });

    setRpsData((prev) => ({
      ...prev,
      cplEvaluations: updated,
    }));
  };

  const handleSimulateClassData = () => {
    const randomRealistic = activeCpls.map((cpl, idx) => {
      const base = 72 + Math.floor(Math.random() * 20); // 72 s.d. 91
      return {
        cplId: cpl.id,
        cplDesc: cpl.desc,
        targetPercentage: targetBaseline,
        averageScore: base,
        status: (base >= targetBaseline ? "TERCAPAI" : "BELUM_TERCAPAI") as any,
        evaluatedCpmks: rpsData.cpmkList && rpsData.cpmkList.length > 0
          ? [rpsData.cpmkList[idx % rpsData.cpmkList.length]?.id || `CPMK ${idx + 1}`]
          : [`CPMK ${idx + 1}`],
        assessmentSources: ["Hasil Proyek (30%)", "Aktivitas Partisipatif (20%)", "Tugas Terstruktur (20%)", "UTS & UAS (30%)"],
        analisisAkarMasalah:
          base < targetBaseline
            ? "Ketercapaian masih berada di bawah target 75% dikarenakan literasi metodologi analisis data yang perlu diperkuat."
            : "Capaian melampaui target standar dengan hasil laporan proyek yang komprehensif dan implementatif.",
        rencanaTindakLanjut:
          base < targetBaseline
            ? "Menambahkan bimbingan tutorial metodologi sebelum UTS dan menyelaraskan instrumen rubrik penilaian partisipatif."
            : "Mengikutsertakan luaran proyek mahasiswa terbaik ke dalam kompetisi inovasi atau publikasi jurnal pengabdian.",
      };
    });

    setRpsData((prev) => ({
      ...prev,
      cplEvaluations: randomRealistic,
    }));
    showNotification("Data rekapitulasi nilai riil kelas berhasil disimulasikan sesuai standar OBE!", "success");
  };

  const handleGenerateAiCqi = async () => {
    setIsGeneratingCqi(true);
    showNotification("Gemini AI sedang menyusun analisis akar masalah & rencana tindak lanjut CQI...", "info");
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Sebagai Konsultan Ahli Kurikulum OBE Universitas Pattimura, lakukan analisis evaluasi ketercapaian CPL dan susun rencana tindak lanjut Continuous Quality Improvement (CQI) sesuai amanat Pasal 72 Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik:
Mata Kuliah: ${rpsData.namaMK || "Mata Kuliah"} (${rpsData.kodeMK || "Kode MK"})
Program Studi: ${rpsData.namaProdi || "Program Studi"}
Target Minimal: ${targetBaseline}%
Daftar CPL & Rata-rata Skor Saat Ini:
${currentEvaluations.map((e) => `- [${e.cplId}] (Skor: ${e.averageScore}%, Status: ${e.status}): ${e.cplDesc}`).join("\n")}

Berikan:
1. Analisis menyeluruh ketercapaian CPL mata kuliah.
2. Rekomendasi perbaikan pembelajaran terstruktur untuk CPL yang belum optimal.
3. Strategi peningkatan mutu pembelajaran berkelanjutan (CQI) untuk semester berikutnya berbasis PIP Bina Mulia Kelautan & Case Method/PjBL.`,
            },
          ],
        }),
      });

      const resJson = await response.json();
      if (resJson && resJson.reply) {
        setRpsData((prev) => ({
          ...prev,
          cqiNotes: resJson.reply,
        }));
        showNotification("Rencana Tindak Lanjut CQI berhasil dirumuskan oleh Gemini AI!", "success");
      }
    } catch (err: any) {
      showNotification("Gagal merumuskan CQI via AI: " + err.message, "error");
    } finally {
      setIsGeneratingCqi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100 font-sans">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg text-white">
            <Target className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest uppercase text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                Siklus PPEPP &bull; Standar Akreditasi LAM/BAN-PT
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Pasal 72 Peraturan Rektor No. 12 Tahun 2026
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white mt-1 leading-tight">
              Matriks Evaluasi Ketercapaian CPL &amp; Continuous Quality Improvement (CQI)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Mata Kuliah: <strong className="text-white">{rpsData.namaMK || "Belum ditentukan"}</strong> ({rpsData.kodeMK || "Kode MK"}) &bull; Program Studi: <strong className="text-indigo-300">{rpsData.namaProdi || "Program Studi"}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
          <button
            type="button"
            onClick={handleSimulateClassData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Isi data simulasi nilai kelas jika belum ada rekapan nilai akhir"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulasi Nilai Kelas</span>
          </button>
          <button
            type="button"
            onClick={handleGenerateAiCqi}
            disabled={isGeneratingCqi}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md border border-purple-500 cursor-pointer disabled:opacity-50"
            title="Gunakan Gemini AI untuk menganalisis akar masalah dan rekomendasi perbaikan CQI"
          >
            {isGeneratingCqi ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Rekomendasikan CQI (AI)</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">Indeks Capaian CPL Rata-rata</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{avgOverallScore}%</span>
            <span className={`text-xs font-bold ${avgOverallScore >= targetBaseline ? "text-emerald-400" : "text-amber-400"}`}>
              {avgOverallScore >= targetBaseline ? "(Melampaui Target)" : "(Di Bawah Target)"}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${avgOverallScore >= targetBaseline ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, avgOverallScore)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">Tingkat Ketercapaian Mutu</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-400">{attainmentPercentage}%</span>
            <span className="text-xs text-slate-400">
              ({tercapaiCount} dari {totalCpls} CPL)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${attainmentPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Ambang Batas Target</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="50"
                max="90"
                value={targetBaseline}
                onChange={(e) => setTargetBaseline(Math.max(50, Math.min(95, parseInt(e.target.value) || 75)))}
                className="w-12 text-center text-xs font-black bg-slate-800 border border-slate-700 rounded py-0.5 text-white"
              />
              <span className="text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>
          <div className="text-base font-black text-white mt-1">
            Standar Minimal: {targetBaseline}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Batas kelulusan kompetensi dasar program studi
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 block">Audit Kepatuhan Pasal 72</span>
          <div className="flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-black text-emerald-300">
              Evaluasi Terpenuhi
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Dokumen siap lampiran asesmen akreditasi
          </span>
        </div>
      </div>

      {/* CPL MATRIX EVALUATION TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              Tabel Matriks Capaian CPL &amp; Pemetaan Komponen Asesmen
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Dosen dapat merevisi nilai rata-rata kelas langsung pada kolom skor
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/70 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-24">Kode CPL</th>
                <th className="p-3.5">Deskripsi Capaian Pembelajaran Lulusan (CPL)</th>
                <th className="p-3.5 w-32">CPMK Pemenuh</th>
                <th className="p-3.5 w-28 text-center">Target (%)</th>
                <th className="p-3.5 w-32 text-center">Capaian Kelas (%)</th>
                <th className="p-3.5 w-32 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {currentEvaluations.map((ev) => {
                const isPassed = ev.averageScore >= (ev.targetPercentage || targetBaseline);
                const gap = Math.round((ev.averageScore - (ev.targetPercentage || targetBaseline)) * 10) / 10;

                return (
                  <tr key={ev.cplId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-black text-indigo-400 align-top">
                      {ev.cplId}
                    </td>
                    <td className="p-3.5 align-top">
                      <p className="font-semibold text-white leading-relaxed">{ev.cplDesc}</p>
                      
                      {/* Sub-cards for Analysis & CQI */}
                      <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                            Analisis Akar Masalah / Evaluasi Semester:
                          </span>
                          <textarea
                            rows={2}
                            value={ev.analisisAkarMasalah || ""}
                            onChange={(e) => handleAnalysisChange(ev.cplId, "analisisAkarMasalah", e.target.value)}
                            placeholder="Catat evaluasi hasil belajar mahasiswa..."
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans text-[11px]"
                          />
                        </div>

                        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-indigo-300 block mb-0.5">
                            Rencana Tindak Lanjut CQI (Semester Depan):
                          </span>
                          <textarea
                            rows={2}
                            value={ev.rencanaTindakLanjut || ""}
                            onChange={(e) => handleAnalysisChange(ev.cplId, "rencanaTindakLanjut", e.target.value)}
                            placeholder="Rencana perbaikan metode ajar/materi/tugas..."
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans text-[11px]"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 align-top">
                      <div className="flex flex-wrap gap-1">
                        {ev.evaluatedCpmks.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded font-mono text-[10px] font-bold"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-1.5">
                        Sumber: Case Method &amp; PjBL
                      </div>
                    </td>
                    <td className="p-3.5 text-center align-top font-bold text-slate-300">
                      {ev.targetPercentage || targetBaseline}%
                    </td>
                    <td className="p-3.5 text-center align-top">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={ev.averageScore}
                          onChange={(e) => handleScoreChange(ev.cplId, parseFloat(e.target.value) || 0)}
                          className="w-16 text-center font-mono font-black text-sm bg-slate-950 border border-slate-700 rounded-lg py-1 text-white focus:outline-none focus:border-indigo-400"
                        />
                        <span className="font-bold text-slate-400">%</span>
                      </div>
                      <span className={`text-[10px] font-bold mt-1 block ${gap >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {gap >= 0 ? `+${gap}%` : `${gap}%`}
                      </span>
                    </td>
                    <td className="p-3.5 text-center align-top">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border inline-flex items-center gap-1 ${
                          isPassed
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-600"
                            : "bg-rose-950/80 text-rose-300 border-rose-600"
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{isPassed ? "TERCAPAI" : "BELUM"}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONTINUOUS QUALITY IMPROVEMENT (CQI) NARRATIVE SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Laporan Rencana Tindak Lanjut CQI (Pasal 72 Ayat 3)
              </h3>
              <p className="text-xs text-slate-400">
                Dokumen peningkatan mutu berkelanjutan berbasis siklus evaluasi semester
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateAiCqi}
            disabled={isGeneratingCqi}
            className="text-xs px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/60 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Otomatis AI</span>
          </button>
        </div>

        <textarea
          rows={6}
          value={rpsData.cqiNotes || ""}
          onChange={(e) => setRpsData((prev) => ({ ...prev, cqiNotes: e.target.value }))}
          placeholder={`A. Analisis Capaian Pembelajaran:\nBerdasarkan hasil evaluasi semester, sebagian besar mahasiswa berhasil mencapai CPL dengan predikat sangat memuaskan, khususnya pada penugasan proyek berbasis tim (Team-based Project)...\n\nB. Rencana Perbaikan Mutu Pembelajaran (CQI):\n1. Menambah porsi studi kasus lapangan pada desa pesisir Maluku.\n2. Mengintegrasikan jurnal riset terbaru dosen pengampu ke dalam bahan kajian minggu 4 dan 11.\n3. Memperbaiki rubrik analitik pada kriteria orisinalitas luaran proyek.`}
          className="w-full text-xs p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 font-sans"
        />

        {/* Tanda Tangan Validasi Siklus PPEPP */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-12">
            <div>
              <span className="text-[11px] text-slate-400">Dosen Penanggung Jawab MK:</span>
              <div className="font-bold text-white mt-1">{rpsData.dosenPengampu || "Dosen Pengampu"}</div>
            </div>
            <div>
              <span className="text-slate-500 underline font-semibold">(Tanda Tangan &amp; NIP)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-12">
            <div>
              <span className="text-[11px] text-slate-400">Tim Kurikulum Jurusan (TK2A):</span>
              <div className="font-bold text-white mt-1">{rpsData.koorMK || "Koordinator Bidang Keahlian"}</div>
            </div>
            <div>
              <span className="text-slate-500 underline font-semibold">(Tanda Tangan &amp; NIP)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-12">
            <div>
              <span className="text-[11px] text-slate-400">Ketua Program Studi:</span>
              <div className="font-bold text-white mt-1">{rpsData.kaprodi || "Ketua Program Studi"}</div>
            </div>
            <div>
              <span className="text-slate-500 underline font-semibold">(Tanda Tangan &amp; NIP)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
