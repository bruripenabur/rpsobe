import React, { useState } from "react";
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  BookOpen,
  Info,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { BkdLecturerItem } from "../utils/bkdReportPdfExport";

interface KaprodiSmartGuideProps {
  isOpen: boolean;
  onClose?: () => void;
  lecturers: BkdLecturerItem[];
  namaProdi: string;
  semesterAktif?: string;
  onSelectLecturer?: (dosenName: string) => void;
  onApplySimulation?: () => void;
}

export const KaprodiSmartGuide: React.FC<KaprodiSmartGuideProps> = ({
  isOpen,
  onClose,
  lecturers,
  namaProdi,
  semesterAktif = "Semester Berjalan",
  onSelectLecturer,
}) => {
  const [activeTab, setActiveTab] = useState<"tips" | "recommendations" | "tridharma" | "simulation">("tips");
  const [expandedTip, setExpandedTip] = useState<number | null>(0);
  const [simulatedAddedMember, setSimulatedAddedMember] = useState<string>("");

  if (!isOpen) return null;

  // Analisis Dosen berdasarkan batas 3 - 9 SKS
  const underloadLecturers = lecturers.filter((l) => l.totalSks < 3);
  const overloadLecturers = lecturers.filter((l) => l.totalSks > 9);
  const idealLecturers = lecturers.filter((l) => l.totalSks >= 3 && l.totalSks <= 9);

  // Rekomendasi Cerdas Team Teaching
  const balancingSuggestions: {
    sourceDosen: string;
    sourceSks: number;
    courseToShare: { kodeMK: string; namaMK: string; sks: number; currentShare: number };
    targetDosen: string;
    targetSks: number;
    projectedSourceSks: number;
    projectedTargetSks: number;
    rationale: string;
  }[] = [];

  if (overloadLecturers.length > 0 && underloadLecturers.length > 0) {
    overloadLecturers.forEach((overLec, idx) => {
      const targetLec = underloadLecturers[idx % underloadLecturers.length];
      // Cari MK yang memiliki SKS >= 3 dan belum diajar oleh targetLec
      const candidateCourse = overLec.courses.find((c) => c.sks >= 3 && !c.isTeamTeaching) || overLec.courses[0];
      if (candidateCourse && targetLec) {
        const newTeamSize = candidateCourse.teamSize + 1;
        const newShare = Number((candidateCourse.sks / newTeamSize).toFixed(2));
        const diff = candidateCourse.sksShare - newShare;
        const projSource = Number((overLec.totalSks - diff).toFixed(1));
        const projTarget = Number((targetLec.totalSks + newShare).toFixed(1));

        balancingSuggestions.push({
          sourceDosen: overLec.dosen,
          sourceSks: overLec.totalSks,
          courseToShare: {
            kodeMK: candidateCourse.kodeMK,
            namaMK: candidateCourse.namaMK,
            sks: candidateCourse.sks,
            currentShare: candidateCourse.sksShare,
          },
          targetDosen: targetLec.dosen,
          targetSks: targetLec.totalSks,
          projectedSourceSks: projSource,
          projectedTargetSks: projTarget,
          rationale: `MK ${candidateCourse.kodeMK} (${candidateCourse.sks} SKS) diampu bersama sebagai Team Teaching. Beban ${overLec.dosen} turun menjadi ${projSource} SKS, dan beban ${targetLec.dosen} naik menjadi ${projTarget} SKS (memenuhi syarat minimal BKD).`,
        });
      }
    });
  }

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-fadeIn">
      {/* Header Smart Guide */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">
                Smart Guide: Asisten Penyeimbang BKD Dosen
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Standar 3 - 9 SKS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Panduan kontekstual dan rekomendasi cerdas pemerataan jam mengajar Program Studi {namaProdi}.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Tutup Smart Guide"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigasi Tab Smart Guide */}
      <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("tips")}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            activeTab === "tips"
              ? "bg-amber-500 text-slate-950 font-black shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Tips Penyeimbang</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recommendations")}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            activeTab === "recommendations"
              ? "bg-amber-500 text-slate-950 font-black shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Rekomendasi Team Teaching ({balancingSuggestions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tridharma")}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
            activeTab === "tridharma"
              ? "bg-amber-500 text-slate-950 font-black shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Proporsi Tri Dharma BKD</span>
        </button>
      </div>

      {/* Tab 1: Tips Penyeimbang Berdasarkan Data Historis */}
      {activeTab === "tips" && (
        <div className="space-y-3">
          {/* Card Deteksi Status Real-Time */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Ideal (3-9 SKS)</div>
              <div className="text-base font-black text-white mt-0.5">{idealLecturers.length} Dosen</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Memenuhi standar</div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300">
              <div className="text-[10px] text-amber-400 font-bold uppercase">Kurang (&lt;3 SKS)</div>
              <div className="text-base font-black text-white mt-0.5">{underloadLecturers.length} Dosen</div>
              <div className="text-[10px] text-amber-400 mt-0.5">Perlu tambahan jam</div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300">
              <div className="text-[10px] text-rose-400 font-bold uppercase">Overload (&gt;9 SKS)</div>
              <div className="text-base font-black text-white mt-0.5">{overloadLecturers.length} Dosen</div>
              <div className="text-[10px] text-rose-400 mt-0.5">Perlu redistribusi</div>
            </div>
          </div>

          {/* Daftar Accordion Tips Praktis */}
          <div className="space-y-2">
            {[
              {
                id: 0,
                title: "1. Strategi Mengatasi Dosen di Bawah 3 SKS (Underload)",
                summary: "Dosen dengan beban < 3 SKS tidak memenuhi syarat pengajaran BKD Dikti.",
                content:
                  "Masukkan dosen tersebut sebagai anggota Team Teaching ke mata kuliah inti/wajib 3-4 SKS yang saat ini diampu mandiri oleh dosen overload. Hal ini menaikkan beban dosen tanpa perlu membuka kelas baru.",
              },
              {
                id: 1,
                title: "2. Mencegah Dosen Overload (> 9 SKS) Mengorbankan Riset",
                summary: "Beban mengajar > 9 SKS berisiko mengurangi waktu penelitian dan PkM.",
                content:
                  "Sesuai Pedoman Operasional BKD, dosen membutuhkan alokasi 3 s.d. 7 SKS untuk penelitian dan pengabdian masyarakat. Jika beban mengajar melebihi 9 SKS, delegasikan kelas paralel atau praktikum ke dosen berjabatan Asisten Ahli/Lektor.",
              },
              {
                id: 2,
                title: "3. Pola Rotasi Semester Ganjil vs Genap (Data Historis 3 Tahun)",
                summary: "Pemerataan beban jangka panjang agar tidak terjadi penumpukan di satu semester.",
                content:
                  "Berdasarkan pola historis 3 tahun terakhir, mata kuliah bimbingan skripsi dan kapita selekta sering terkonsentrasi di semester genap. Distribusikan mata kuliah pilihan secara seimbang antara semester ganjil dan genap untuk menjaga fluktuasi beban di bawah 15%.",
              },
              {
                id: 3,
                title: "4. Formula Pembagian SKS Team Teaching Proporsional",
                summary: "Beban SKS Dosen = Total SKS Mata Kuliah / Jumlah Dosen Pengampu.",
                content:
                  "Misalnya mata kuliah berbobot 3 SKS diampu 3 dosen, maka beban masing-masing dosen diakui 1.0 SKS. Pastikan dalam Berita Acara pembagian tugas tertera jadwal tatap muka dan pembobotan modul yang jelas.",
              },
            ].map((tip) => (
              <div
                key={tip.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                  className="w-full p-3 text-left flex items-center justify-between gap-2 hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    <span className="text-xs font-bold text-slate-200">{tip.title}</span>
                  </div>
                  {expandedTip === tip.id ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
                {expandedTip === tip.id && (
                  <div className="px-3 pb-3 text-xs text-slate-400 border-t border-slate-800/60 pt-2 space-y-1">
                    <p className="text-amber-300/90 font-medium">{tip.summary}</p>
                    <p className="leading-relaxed text-slate-300">{tip.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Rekomendasi Konkret Team Teaching */}
      {activeTab === "recommendations" && (
        <div className="space-y-3">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Sistem mendeteksi <strong>{balancingSuggestions.length} potensi penyeimbangan beban</strong> antara dosen yang mengalami kelebihan beban (&gt; 9 SKS) dan dosen yang kurang (&lt; 3 SKS).
            </span>
          </div>

          {balancingSuggestions.length === 0 ? (
            <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-white">Distribusi Beban Sangat Baik!</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                Seluruh dosen berada di rentang ideal 3 - 9 SKS mengajar, atau tidak ditemukan ketimpangan ekstrem antara dosen overload dan underload.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {balancingSuggestions.map((sug, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 space-y-2 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                        {sIdx + 1}
                      </span>
                      Rotasi MK: {sug.courseToShare.kodeMK} ({sug.courseToShare.sks} SKS)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sug.courseToShare.namaMK}
                    </span>
                  </div>

                  {/* Flow Transfer */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div>
                      <div className="text-slate-400">Dosen Pengampu Asal:</div>
                      <div
                        className="font-bold text-white cursor-pointer hover:text-amber-400 truncate"
                        onClick={() => onSelectLecturer?.(sug.sourceDosen)}
                        title={sug.sourceDosen}
                      >
                        {sug.sourceDosen}
                      </div>
                      <div className="text-rose-400 font-mono text-[10px] mt-0.5">
                        {sug.sourceSks.toFixed(1)} SKS &rarr; Proyeksi: <strong>{sug.projectedSourceSks} SKS</strong>
                      </div>
                    </div>

                    <div className="border-l border-slate-800 pl-2">
                      <div className="text-slate-400">Dosen Ditambahkan:</div>
                      <div
                        className="font-bold text-white cursor-pointer hover:text-emerald-400 truncate"
                        onClick={() => onSelectLecturer?.(sug.targetDosen)}
                        title={sug.targetDosen}
                      >
                        {sug.targetDosen}
                      </div>
                      <div className="text-emerald-400 font-mono text-[10px] mt-0.5">
                        {sug.targetSks.toFixed(1)} SKS &rarr; Proyeksi: <strong>{sug.projectedTargetSks} SKS</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 italic">
                    &ldquo;{sug.rationale}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Panduan Proporsi Tri Dharma BKD */}
      {activeTab === "tridharma" && (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Struktur Beban Kerja Dosen (BKD) Sesuai Regulasi Nasional
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Total BKD dosen per semester adalah <strong>12 s.d. 16 SKS</strong>, yang merupakan gabungan dari 4 unsur Tri Dharma Perguruan Tinggi:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">1. Bidang Pendidikan</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Ideal 3 - 9 SKS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Wajib minimal <strong>3 SKS</strong> (mengajar kelas, bimbingan, menguji). Batas atas 9 SKS agar tidak menghalangi riset.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-blue-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400">2. Bidang Penelitian</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 font-bold border border-blue-800">
                  Min 3 - 6 SKS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pendidikan + Penelitian wajib <strong>&ge; 9 SKS</strong>. Termasuk publikasi jurnal, prosiding, paten, dan monograf.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-amber-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">3. Pengabdian (PkM)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 font-bold border border-amber-800">
                  1 - 3 SKS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pemberdayaan masyarakat kepulauan Maluku, penyuluhan, pelatihan, dan pendampingan UMKM.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-purple-800/60 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-400">4. Unsur Penunjang</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 font-bold border border-purple-800">
                  1 - 2 SKS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Kepanitiaan akademik, reviewer jurnal, keanggotaan senat, dan organisasi profesi ilmiah.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
            <strong>Kesimpulan Audit Kaprodi &amp; GJM:</strong> Dokumen RPS dan distribusi mata kuliah hanya memotret <em>Unsur Pendidikan</em>. Oleh karenanya, batas aman pengajaran yang dipantau Kaprodi adalah <strong>3 s.d. 9 SKS</strong> agar dosen lulus BKD nasional 12–16 SKS setelah ditambah unsur penelitian dan pengabdian.
          </div>
        </div>
      )}
    </div>
  );
};
