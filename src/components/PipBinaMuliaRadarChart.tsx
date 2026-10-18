import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PIP_UNPATTI_LIST } from "../data/pipDefaults";
import { Anchor, Compass, CheckCircle2, AlertTriangle, Info, Plus, X } from "lucide-react";

interface PipBinaMuliaRadarChartProps {
  selectedPipItems: string[];
  onTogglePipItem?: (code: string) => void;
  onClose?: () => void;
}

interface PillarScore {
  pillar: string;
  shortLabel: string;
  actualScore: number;
  targetScore: number;
  totalItems: number;
  selectedCount: number;
  gapPercent: number;
  items: typeof PIP_UNPATTI_LIST;
}

export const PipBinaMuliaRadarChart: React.FC<PipBinaMuliaRadarChartProps> = ({
  selectedPipItems = [],
  onTogglePipItem,
  onClose,
}) => {
  // 5 Pilar Utama Pola Ilmiah Pokok (PIP) Bina Mulia Ke Lautan UNPATTI
  const pillarsConfig = [
    {
      id: "Pangan",
      label: "Ketahanan Pangan & Agromaritim",
      shortLabel: "1. Agromaritim",
      categoryKey: "Sumberdaya & Ekosistem Pesisir",
    },
    {
      id: "Konservasi",
      label: "Konservasi Hayati Laut & Pesisir",
      shortLabel: "2. Konservasi Laut",
      categoryKey: "Ketahanan Pangan & Agromaritim",
    },
    {
      id: "Kearifan",
      label: "Kearifan Budaya Bahari (Sasi & Adat)",
      shortLabel: "3. Sasi & Adat",
      categoryKey: "Sosial Budaya & Hukum Adat Maritim",
    },
    {
      id: "Teknologi",
      label: "Logistik, Energi & Transportasi Pulau",
      shortLabel: "4. Logistik Pulau",
      categoryKey: "Energi, Kelautan & Infrastruktur",
    },
    {
      id: "Kebijakan",
      label: "Tata Kelola, Bencana & Diplomasi Maritim",
      shortLabel: "5. Kebijakan Maritim",
      categoryKey: "Mitigasi Bencana & Geopolitik Maritim",
    },
  ];

  const pillarScores: PillarScore[] = pillarsConfig.map((p) => {
    const items = PIP_UNPATTI_LIST.filter(
      (item) => item.category === p.categoryKey || item.keywords.some((k) => p.label.toLowerCase().includes(k))
    );
    const count = items.length || 2;
    const selectedCount = items.filter((item) =>
      selectedPipItems.includes(item.id) || selectedPipItems.includes(item.code)
    ).length;

    const actual = Math.min(100, Math.round((selectedCount / Math.max(1, count)) * 100));
    const target = 100;
    const gap = Math.max(0, target - actual);

    return {
      pillar: p.label,
      shortLabel: p.shortLabel,
      actualScore: actual,
      targetScore: target,
      totalItems: count,
      selectedCount,
      gapPercent: gap,
      items,
    };
  });

  const radarData = pillarScores.map((ps) => ({
    subject: ps.shortLabel,
    Cakupan: ps.actualScore,
    Target: ps.targetScore,
    fullLabel: ps.pillar,
  }));

  const overallCoverage = Math.round(
    pillarScores.reduce((sum, p) => sum + p.actualScore, 0) / pillarScores.length
  );

  return (
    <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Anchor className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
                Radar PIP Bina Mulia Ke Lautan (UNPATTI)
              </h3>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold">
                5 Pilar Maritim
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Analisis keselarasan mata kuliah dengan Pola Ilmiah Pokok (PIP) berbasis kepulauan Maluku
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-auto p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Tutup Radar PIP"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            Total Cakupan PIP
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-cyan-400">
              {overallCoverage}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {overallCoverage >= 60 ? "Optimal" : "Perlu Penguatan"}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            Butir Terpilih
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              {selectedPipItems.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">dari 12 Butir BMK</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            Pilar Sasi &amp; Adat
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {pillarScores[2]?.actualScore || 0}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Kearifan Lokal</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            Status Akreditasi
          </span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-base sm:text-lg font-black text-blue-400">
              Unggul OBE
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Khas UNPATTI</span>
          </div>
        </div>
      </div>

      {/* Radar Chart & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Radar Graphic */}
        <div className="lg:col-span-6 h-[260px] sm:h-[300px] w-full bg-slate-950/80 rounded-xl p-2 border border-slate-800 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#38bdf8", fontSize: 10, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 8 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-cyan-500/60 p-2 rounded-lg text-xs shadow-xl text-white">
                        <p className="font-bold text-cyan-300">{data.fullLabel}</p>
                        <p className="text-emerald-400">
                          Cakupan RPS: <strong>{data.Cakupan}%</strong>
                        </p>
                        <p className="text-slate-400">Target Kurikulum: 100%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Cakupan RPS"
                dataKey="Cakupan"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.45}
              />
              <Radar
                name="Target Ideal"
                dataKey="Target"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeDasharray="3 3"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pillar Gap Breakdown & Toggles */}
        <div className="lg:col-span-6 space-y-2 text-xs">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
            Rincian 5 Pilar Bina Mulia Ke Lautan &amp; Kesenjangan (GAP):
          </span>
          {pillarScores.map((p, idx) => (
            <div
              key={idx}
              className="bg-slate-950/50 border border-slate-800 p-2 rounded-xl flex items-center justify-between"
            >
              <div className="flex-1 pr-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                  <span>{p.pillar}</span>
                  <span
                    className={
                      p.actualScore >= 60 ? "text-emerald-400" : "text-amber-400"
                    }
                  >
                    {p.actualScore}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.actualScore >= 60 ? "bg-cyan-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.max(8, p.actualScore)}%` }}
                  ></div>
                </div>
              </div>

              {onTogglePipItem && p.items.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {p.items.slice(0, 2).map((item) => {
                    const isChecked = selectedPipItems.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onTogglePipItem(item.id)}
                        className={`text-[9.5px] px-2 py-0.5 rounded font-mono font-bold transition border ${
                          isChecked
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                        }`}
                        title={`${item.id}: ${item.title}`}
                      >
                        {item.id} {isChecked ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
