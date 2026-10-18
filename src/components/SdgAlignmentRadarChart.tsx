import React, { useState, useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { RpsData, SdgItem } from "../types/rps";
import { UNPATTI_SDGS_LIST } from "../data/unpattiDefaults";
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Sparkles,
  Info,
  Maximize2,
  Filter,
} from "lucide-react";

interface SdgAlignmentRadarChartProps {
  rpsData: RpsData;
  setRpsData?: React.Dispatch<React.SetStateAction<RpsData>>;
  showNotification?: (msg: string, type?: "success" | "error" | "info") => void;
}

export const SdgAlignmentRadarChart: React.FC<SdgAlignmentRadarChartProps> = ({
  rpsData,
  setRpsData,
  showNotification,
}) => {
  const [filterMode, setFilterMode] = useState<"selected_only" | "core_agri">("core_agri");

  // Core SDGs particularly relevant to agricultural extension and multidimensional poverty
  const coreSdgIds = [1, 2, 4, 8, 10, 12, 13, 14, 15];

  // Calculate alignment score for each SDG based on course texts, selected SDGs, and syllabus
  const radarData = useMemo(() => {
    const combinedCourseText = (
      `${rpsData.namaMK} ${rpsData.deskripsiMK} ${rpsData.bahanKajian} ` +
      `${rpsData.cpmkList.map((c) => c.desc).join(" ")} ` +
      `${rpsData.subCpmkList.map((s) => s.desc).join(" ")}`
    ).toLowerCase();

    // Mapping keywords for SDGs
    const sdgKeywords: Record<number, string[]> = {
      1: ["miskin", "poverty", "kemiskinan", "pendapatan", "subsisten", "rentan", "deprivasi"],
      2: ["pangan", "hunger", "kelaparan", "gizi", "pertanian", "tani", "panen", "ketahanan pangan"],
      3: ["kesehatan", "health", "kesejahteraan", "sanitasi", "air bersih"],
      4: ["pendidikan", "literasi", "edukasi", "pelatihan", "penyuluhan", "belajar"],
      5: ["gender", "perempuan", "kesetaraan", "wanita tani"],
      6: ["air", "sanitasi", "irigasi"],
      7: ["energi", "biomassa", "terbarukan"],
      8: ["ekonomi", "kerja", "kerja sama", "agribisnis", "usaha", "pendapatan", "pertumbuhan"],
      9: ["infrastruktur", "inovasi", "teknologi", "digital", "industri"],
      10: ["ketimpangan", "inequality", "distribusi", "gini", "kesenjangan", "marjinal"],
      11: ["pedesaan", "pemukiman", "komunitas", "kota"],
      12: ["konsumsi", "produksi", "berkelanjutan", "rantai pasok", "limbah"],
      13: ["iklim", "climate", "bencana", "cuaca", "adaptasi", "emisi", "resiliensi"],
      14: ["laut", "pesisir", "nelayan", "pulau", "perikanan", "marine", "pantai"],
      15: ["daratan", "tanah", "hutan", "agroforestri", "ekosistem", "konservasi"],
      16: ["kelembagaan", "hukum", "kebijakan", "keadilan", "partisipasi", "transparansi"],
      17: ["kemitraan", "jejaring", "stakeholder", "kolaborasi", "kerjasama"],
    };

    const targetIds =
      filterMode === "selected_only"
        ? rpsData.selectedSdgs.length > 0
          ? rpsData.selectedSdgs
          : [1, 2, 8, 10]
        : coreSdgIds;

    return targetIds.map((id) => {
      const sdgItem = UNPATTI_SDGS_LIST.find((s) => s.id === id);
      const name = sdgItem ? `SDG ${id}: ${sdgItem.name.split(" (")[0]}` : `SDG ${id}`;
      const shortName = `SDG ${id}`;

      // Keyword hits calculation
      const keywords = sdgKeywords[id] || [];
      let hits = 0;
      keywords.forEach((kw) => {
        const regex = new RegExp(`\\b${kw}`, "gi");
        const count = (combinedCourseText.match(regex) || []).length;
        hits += count;
      });

      // Bonus if explicitly selected in RPS
      const isSelected = rpsData.selectedSdgs.includes(id);
      const baseScore = isSelected ? 45 : 15;
      const calculatedScore = Math.min(100, Math.round(baseScore + hits * 9));

      // Ideal benchmark target for a comprehensive curriculum
      const idealTarget = isSelected ? 85 : 65;

      const gap = Math.max(0, idealTarget - calculatedScore);

      return {
        sdgId: id,
        shortName,
        fullName: name,
        actualScore: calculatedScore,
        idealTarget,
        gap,
        isSelected,
        status:
          calculatedScore >= 80
            ? "Optimal"
            : calculatedScore >= 60
            ? "Memadai"
            : "Kesenjangan (Gap)",
      };
    });
  }, [rpsData, filterMode]);

  // Overall Coverage Summary
  const averageCoverage = useMemo(() => {
    if (radarData.length === 0) return 0;
    const total = radarData.reduce((acc, curr) => acc + curr.actualScore, 0);
    return Math.round(total / radarData.length);
  }, [radarData]);

  const gapCount = useMemo(() => {
    return radarData.filter((d) => d.actualScore < 60).length;
  }, [radarData]);

  // Quick Action to include missing SDGs into RPS
  const handleToggleSdg = (id: number) => {
    if (!setRpsData) return;
    setRpsData((prev) => {
      const exists = prev.selectedSdgs.includes(id);
      const updated = exists
        ? prev.selectedSdgs.filter((s) => s !== id)
        : [...prev.selectedSdgs, id].sort((a, b) => a - b);
      return { ...prev, selectedSdgs: updated };
    });
    if (showNotification) {
      showNotification(`SDG #${id} diperbarui pada daftar integrasi RPS!`, "success");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Target className="w-4 h-4 text-emerald-300" />
            </span>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Radar Keselarasan Capaian RPS &amp; 17 SDGs PBB</span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Memvisualisasikan tingkat ketercakupan tujuan pembangunan berkelanjutan (SDGs) dan mendeteksi kesenjangan (*coverage gaps*).
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setFilterMode("core_agri")}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              filterMode === "core_agri"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            SDGs Pertanian &amp; Wilayah (9 Pilar)
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("selected_only")}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${
              filterMode === "selected_only"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            SDGs Terpilih RPS ({rpsData.selectedSdgs.length})
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-400 text-sm">
            {averageCoverage}%
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Rata-Rata Cakupan</div>
            <div className="text-xs font-black text-white">
              {averageCoverage >= 75 ? "Sangat Baik" : averageCoverage >= 60 ? "Cukup" : "Perlu Penguatan"}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-sm">
            {gapCount}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Kesenjangan (Gap)</div>
            <div className="text-xs font-black text-amber-300">
              {gapCount === 0 ? "Tidak Ada Gap Signifikan" : `${gapCount} Pilar Rendah`}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-sm">
            {rpsData.selectedSdgs.length}
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">SDGs Terdaftar</div>
            <div className="text-xs font-black text-blue-300">
              {rpsData.selectedSdgs.map((s) => `#${s}`).join(", ") || "Belum ada"}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-sm">
            OBE
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Standar Kurikulum</div>
            <div className="text-xs font-black text-purple-300">Dikti &amp; UNPATTI</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Chart + Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Recharts Radar Chart */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2 sm:p-4 h-[320px] sm:h-[360px] flex items-center justify-center relative shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#334155" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="shortName"
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 9 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-white border-b border-slate-800 pb-1">
                          {data.fullName}
                        </div>
                        <div className="text-emerald-400 font-semibold">
                          Cakupan RPS: <strong>{data.actualScore}%</strong>
                        </div>
                        <div className="text-cyan-400">
                          Target Ideal: <strong>{data.idealTarget}%</strong>
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Status:{" "}
                          <span
                            className={
                              data.actualScore >= 75
                                ? "text-emerald-300 font-bold"
                                : data.actualScore >= 60
                                ? "text-amber-300 font-bold"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {data.status}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value) => (
                  <span className="text-slate-300 font-semibold">{value}</span>
                )}
              />
              <Radar
                name="Cakupan RPS Saat Ini"
                dataKey="actualScore"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.45}
              />
              <Radar
                name="Target Ideal OBE"
                dataKey="idealTarget"
                stroke="#38bdf8"
                fill="#38bdf8"
                fillOpacity={0.15}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Cards & Gap Diagnostics */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Rincian Nilai &amp; Kesenjangan per SDG</span>
            <span>Skala 0-100%</span>
          </div>

          {radarData.map((item) => {
            const isGap = item.actualScore < 60;
            return (
              <div
                key={item.sdgId}
                className={`p-2.5 rounded-xl border text-xs transition ${
                  isGap
                    ? "bg-rose-950/20 border-rose-800/40"
                    : item.actualScore >= 80
                    ? "bg-emerald-950/20 border-emerald-800/40"
                    : "bg-slate-950/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      #{item.sdgId}
                    </span>
                    <span className="font-bold text-white truncate text-[11px]">
                      {item.fullName.split(": ")[1]}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black border ${
                        item.status === "Optimal"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : item.status === "Memadai"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-rose-950 text-rose-300 border-rose-800"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="font-mono font-black text-xs text-white">
                      {item.actualScore}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.actualScore >= 80
                        ? "bg-emerald-500"
                        : item.actualScore >= 60
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${item.actualScore}%` }}
                  ></div>
                </div>

                {/* Quick Toggle Action */}
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    {isGap
                      ? `⚠️ Kesenjangan ${item.gap}% dari target ideal`
                      : "✓ Selaras dengan sasaran capaian pembelajaran"}
                  </span>
                  {setRpsData && (
                    <button
                      type="button"
                      onClick={() => handleToggleSdg(item.sdgId)}
                      className={`font-semibold hover:underline ${
                        item.isSelected ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {item.isSelected ? "Hapus dari RPS" : "+ Tambah ke RPS"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
