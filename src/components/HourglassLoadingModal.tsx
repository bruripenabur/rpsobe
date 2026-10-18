import React, { useState, useEffect } from "react";
import { Hourglass, Sparkles } from "lucide-react";

interface HourglassLoadingModalProps {
  isOpen: boolean;
  courseName: string;
  studyProgram?: string;
  currentStepMessage?: string;
}

const GENERATION_STEPS = [
  "Membaca konfigurasi CPL Prodi, KKNI, PIP & 17 SDGs...",
  "Merumuskan Capaian Pembelajaran Mata Kuliah (CPMK)...",
  "Menurunkan Sub-CPMK berorientasi Taksonomi Bloom (C3-C5)...",
  "Menyusun Matriks Rubrik Penilaian OBE & Metode Evaluasi...",
  "Menyelaraskan Silabus Perkuliahan 16 Pertemuan...",
  "Memfinalisasi Dokumen & Menyiapkan Pratinjau RPS...",
];

export const HourglassLoadingModal: React.FC<HourglassLoadingModalProps> = ({
  isOpen,
  courseName,
  studyProgram,
  currentStepMessage,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(7);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(7);
      setStepIndex(0);
      return;
    }

    setSecondsRemaining(7);
    setStepIndex(0);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % GENERATION_STEPS.length);
    }, 1100);

    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(countdownInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayMessage = currentStepMessage || GENERATION_STEPS[stepIndex];
  const progressPercent = Math.min(100, Math.round(((7 - secondsRemaining + 0.6) / 7) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-emerald-950/70 text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Moving Hourglass Container */}
        <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center">
          {/* Animated rotating outer halo */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 animate-[spin_5s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-400/30 animate-[spin_8s_linear_infinite_reverse]"></div>

          {/* Glowing pulse ring */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-amber-500/20 animate-pulse"></div>

          {/* Jam Pasir yang Bergerak (Rotating & Tipping Keyframe Animation) */}
          <div className="relative z-10 flex items-center justify-center animate-[hourglassFlip_2s_cubic-bezier(0.4,0,0.2,1)_infinite]">
            <Hourglass className="w-12 h-12 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          </div>

          {/* Sparkles accent */}
          <div className="absolute -top-1 -right-1 text-emerald-400 animate-bounce">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-white tracking-tight mb-1 flex items-center justify-center gap-2">
          <span>Memproses Generate RPS OBE</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        </h3>

        {/* 5-10 Seconds Countdown Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black mb-3">
          <Hourglass className="w-3.5 h-3.5 animate-spin text-amber-300" style={{ animationDuration: "2.5s" }} />
          <span>Menunggu ~{secondsRemaining} detik &bull; Bergantung jaringan internet</span>
        </div>

        {/* Course Info */}
        <p className="text-xs text-slate-300 font-semibold mb-4 px-2">
          <span className="text-emerald-400 font-bold">{courseName || "Mata Kuliah Baru"}</span>
          {studyProgram ? (
            <span className="text-slate-400 block text-[11px] mt-0.5">
              Prodi {studyProgram} &bull; UNPATTI
            </span>
          ) : null}
        </p>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Dynamic Status Text */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 min-h-[52px] flex items-center justify-center">
          <p className="text-xs text-cyan-300 font-medium leading-relaxed animate-in fade-in duration-300">
            {displayMessage}
          </p>
        </div>

        {/* Pesan Sesuai Permintaan Revisi User: Menunggu 5 - 10 detik bergantung jaringan internet */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold leading-relaxed flex items-center justify-center gap-2 shadow-lg">
          <Hourglass className="w-4 h-4 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: "2s" }} />
          <span>Menunggu 5 - 10 detik bergantung jaringan internet dan langsung munculkan tampilan RPS yang digenerate.</span>
        </div>
      </div>

      {/* Embedded CSS for smooth hourglass flipping animation */}
      <style>{`
        @keyframes hourglassFlip {
          0% {
            transform: rotate(0deg) scale(1);
          }
          45% {
            transform: rotate(0deg) scale(1.05);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          95% {
            transform: rotate(180deg) scale(1.05);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
