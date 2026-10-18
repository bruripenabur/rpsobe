import React, { useState } from "react";
import {
  Award,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Scale,
  Target,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  Layers,
} from "lucide-react";
import { RpsData } from "../types/rps";
import { CourseObjectiveRubric, RubricCriterion } from "../types/rubric";
import { generateDefaultObeRubrics } from "../utils/obeCurriculumGenerator";
import { Loader2, Bot } from "lucide-react";

interface AssessmentRubricBuilderProps {
  rpsData: RpsData;
  setRpsData: React.Dispatch<React.SetStateAction<RpsData>>;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
  onSyncGemini?: () => void;
  isSyncing?: boolean;
}

export const OBE_ASSESSMENT_CHECKBOX_OPTIONS = [
  "Ujian Tertulis",
  "Laporan",
  "Paper Analisis",
  "Tes Objektif/Esai",
  "Case Study",
  "Karya Tulis",
  "Unjuk Kerja",
  "Prototipe",
  "Presentasi",
  "Demonstrasi",
  "Observasi Praktikum",
  "Proyek",
  "Hasil Produk",
  "Observation Sheet",
  "Journal",
  "Keaktifan Diskusi",
  "Peer Assessment",
  "Self Assessment",
  "Sikap & Kerjasama Tim",
];

export const AssessmentRubricBuilder: React.FC<AssessmentRubricBuilderProps> = ({
  rpsData,
  setRpsData,
  showNotification,
  onSyncGemini,
  isSyncing,
}) => {
  // Available objectives: CPMK and Sub-CPMK from rpsData
  const cpmkItems = rpsData.cpmkList || [];
  const subCpmkItems = rpsData.subCpmkList || [];
  const rubrics: CourseObjectiveRubric[] = rpsData.rubrics || [];

  // Expanded rubric accordion IDs
  const [expandedRubricIds, setExpandedRubricIds] = useState<string[]>(() => {
    return rubrics.length > 0 ? [rubrics[0].id] : [];
  });

  // Modal State for Adding/Editing a Rubric Container
  const [rubricModalOpen, setRubricModalOpen] = useState(false);
  const [rubricModalMode, setRubricModalMode] = useState<"add" | "edit">("add");
  const [editingRubricId, setEditingRubricId] = useState<string | null>(null);

  const [formObjectiveType, setFormObjectiveType] = useState<"CPMK" | "Sub-CPMK">("CPMK");
  const [formObjectiveRef, setFormObjectiveRef] = useState<string>(
    cpmkItems[0]?.id || "CPMK 1"
  );
  const [formAssessmentMethod, setFormAssessmentMethod] = useState<string>(
    "Hasil Proyek & Studi Kasus Lapangan"
  );

  // Modal State for Adding/Editing a Criterion inside a Rubric
  const [criterionModalOpen, setCriterionModalOpen] = useState(false);
  const [criterionModalMode, setCriterionModalMode] = useState<"add" | "edit">("add");
  const [activeRubricForCriterion, setActiveRubricForCriterion] = useState<string | null>(null);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);

  const [critName, setCritName] = useState("");
  const [critIndicator, setCritIndicator] = useState("");
  const [critWeight, setCritWeight] = useState<number>(30);
  const [critSangatBaik, setCritSangatBaik] = useState("");
  const [critBaik, setCritBaik] = useState("");
  const [critCukup, setCritCukup] = useState("");
  const [critKurang, setCritKurang] = useState("");

  const toggleAccordion = (id: string) => {
    setExpandedRubricIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Modal to create new rubric
  const handleOpenAddRubric = () => {
    setRubricModalMode("add");
    setEditingRubricId(null);
    setFormObjectiveType("CPMK");
    setFormObjectiveRef(cpmkItems[0]?.id || "CPMK 1");
    setFormAssessmentMethod("Hasil Proyek & Laporan Lapangan");
    setRubricModalOpen(true);
  };

  const handleOpenEditRubric = (rubric: CourseObjectiveRubric) => {
    setRubricModalMode("edit");
    setEditingRubricId(rubric.id);
    setFormObjectiveType(rubric.objectiveType);
    setFormObjectiveRef(rubric.objectiveRef);
    setFormAssessmentMethod(rubric.assessmentMethod);
    setRubricModalOpen(true);
  };

  const handleSaveRubric = () => {
    // Find target title and bloom level
    let targetTitle = "";
    let targetBloom = "C4-Analisis";

    if (formObjectiveType === "CPMK") {
      const found = cpmkItems.find((c) => c.id === formObjectiveRef);
      targetTitle = found?.desc || "";
      targetBloom = "C4-Analisis";
    } else {
      const found = subCpmkItems.find((s) => s.id === formObjectiveRef);
      targetTitle = found?.desc || "";
      targetBloom = found?.bloom || "C3-Penerapan";
    }

    if (rubricModalMode === "add") {
      // Check if rubric for this objective already exists
      const exists = rubrics.some((r) => r.objectiveRef === formObjectiveRef);
      if (exists) {
        showNotification(
          `Rubrik untuk ${formObjectiveRef} sudah ada. Anda dapat mengedit kriteria di dalamnya.`,
          "error"
        );
        return;
      }

      // Generate default criteria aligned with OBE & Bloom level
      const defaultCriteria: RubricCriterion[] = [
        {
          id: `crit-${Date.now()}-1`,
          name: "Ketepatan Konseptual & Kerangka Teori",
          indicator: `Ketepatan dalam merumuskan dan menjelaskan indikator capaian ${formObjectiveRef}.`,
          weightPercent: 40,
          levels: {
            sangatBaik:
              "Konsep sangat matang, artikulasi komprehensif, referensi mutakhir, dan bebas dari miskonsepsi.",
            baik: "Konsep dijelaskan dengan benar dan sistematis dengan bukti pendukung yang relevan.",
            cukup:
              "Pemahaman konseptual sebatas dasar, uraian kurang mendalam atau kurang didukung literatur.",
            kurang:
              "Konsep keliru mendasar atau tidak mampu menjelaskan prinsip capaian pembelajaran.",
          },
        },
        {
          id: `crit-${Date.now()}-2`,
          name: "Aplikasi Masalah & Kontekstual Kepulauan",
          indicator:
            "Kemampuan mengaitkan teori dengan studi empiris atau permasalahan riil masyarakat agromaritim.",
          weightPercent: 35,
          levels: {
            sangatBaik:
              "Aplikasi sangat tajam, solutif, memperhatikan aspek kerentanan wilayah pulau-pulau kecil.",
            baik: "Mampu menerapkan metode pada studi kasus dengan argumen logis dan terstruktur.",
            cukup:
              "Analisis kasus normatif tanpa menyentuh kompleksitas lokal pulau-pulau kecil.",
            kurang:
              "Tidak mampu mengaplikasikan materi pembelajaran pada fenomena empiris.",
          },
        },
        {
          id: `crit-${Date.now()}-3`,
          name: "Kualitas Pelaporan / Artikulasi Akademik",
          indicator:
            "Kerapian penyusunan hasil, etika atribusi data, dan komunikasi ilmiah yang efektif.",
          weightPercent: 25,
          levels: {
            sangatBaik:
              "Penyajian sangat runtut, estetis, kepatuhan etika data 100%, dan argumentasi sangat persuasif.",
            baik: "Penyajian rapi, rujukan sumber jelas, dan memenuhi sistematika baku.",
            cukup:
              "Format penulisan kurang teratur, rujukan referensi tidak lengkap.",
            kurang:
              "Laporan acak-acakan, plagiarisme/tanpa sitasi yang sah, atau tidak mengumpulkan hasil.",
          },
        },
      ];

      const newRubric: CourseObjectiveRubric = {
        id: `rubric-${Date.now()}`,
        objectiveType: formObjectiveType,
        objectiveRef: formObjectiveRef,
        objectiveTitle: targetTitle,
        assessmentMethod: formAssessmentMethod,
        targetBloomLevel: targetBloom,
        criteria: defaultCriteria,
      };

      setRpsData((prev) => ({
        ...prev,
        rubrics: [...(prev.rubrics || []), newRubric],
      }));

      setExpandedRubricIds((prev) => [...prev, newRubric.id]);
      showNotification(`Rubrik OBE untuk ${formObjectiveRef} berhasil dibuat!`, "success");
    } else if (editingRubricId) {
      setRpsData((prev) => ({
        ...prev,
        rubrics: (prev.rubrics || []).map((r) =>
          r.id === editingRubricId
            ? {
                ...r,
                objectiveType: formObjectiveType,
                objectiveRef: formObjectiveRef,
                objectiveTitle: targetTitle,
                assessmentMethod: formAssessmentMethod,
                targetBloomLevel: targetBloom,
              }
            : r
        ),
      }));
      showNotification(`Informasi rubrik ${formObjectiveRef} diperbarui!`, "success");
    }

    setRubricModalOpen(false);
  };

  const handleDeleteRubric = (id: string, ref: string) => {
    if (confirm(`Hapus rubrik penilaian untuk ${ref}?`)) {
      setRpsData((prev) => ({
        ...prev,
        rubrics: (prev.rubrics || []).filter((r) => r.id !== id),
      }));
      setExpandedRubricIds((prev) => prev.filter((i) => i !== id));
      showNotification(`Rubrik untuk ${ref} telah dihapus.`, "info");
    }
  };

  // Open Criterion Modal
  const handleOpenAddCriterion = (rubricId: string) => {
    setActiveRubricForCriterion(rubricId);
    setCriterionModalMode("add");
    setEditingCriterionId(null);
    setCritName("");
    setCritIndicator("");
    setCritWeight(25);
    setCritSangatBaik("");
    setCritBaik("");
    setCritCukup("");
    setCritKurang("");
    setCriterionModalOpen(true);
  };

  const handleOpenEditCriterion = (rubricId: string, criterion: RubricCriterion) => {
    setActiveRubricForCriterion(rubricId);
    setCriterionModalMode("edit");
    setEditingCriterionId(criterion.id);
    setCritName(criterion.name);
    setCritIndicator(criterion.indicator);
    setCritWeight(criterion.weightPercent);
    setCritSangatBaik(criterion.levels.sangatBaik);
    setCritBaik(criterion.levels.baik);
    setCritCukup(criterion.levels.cukup);
    setCritKurang(criterion.levels.kurang);
    setCriterionModalOpen(true);
  };

  const handleSaveCriterion = () => {
    if (!activeRubricForCriterion) return;
    if (!critName.trim() || !critIndicator.trim()) {
      showNotification("Nama kriteria dan indikator kinerja wajib diisi!", "error");
      return;
    }

    const payload: RubricCriterion = {
      id: editingCriterionId || `crit-${Date.now()}`,
      name: critName.trim(),
      indicator: critIndicator.trim(),
      weightPercent: Number(critWeight) || 0,
      levels: {
        sangatBaik:
          critSangatBaik.trim() ||
          "Kinerja melampaui standar OBE dengan bukti empiris dan penguasaan tinggi.",
        baik:
          critBaik.trim() ||
          "Kinerja memenuhi seluruh standar capaian dengan hasil terstruktur.",
        cukup:
          critCukup.trim() ||
          "Kinerja memenuhi standar minimum dengan beberapa kekurangan minor.",
        kurang:
          critKurang.trim() ||
          "Kinerja di bawah standar OBE, belum menunjukkan penguasaan kompetensi.",
      },
    };

    setRpsData((prev) => {
      const currentRubrics = prev.rubrics || [];
      const updated = currentRubrics.map((r) => {
        if (r.id !== activeRubricForCriterion) return r;
        if (criterionModalMode === "add") {
          return {
            ...r,
            criteria: [...r.criteria, payload],
          };
        } else {
          return {
            ...r,
            criteria: r.criteria.map((c) => (c.id === editingCriterionId ? payload : c)),
          };
        }
      });
      return { ...prev, rubrics: updated };
    });

    showNotification(
      criterionModalMode === "add"
        ? "Kriteria penilaian berhasil ditambahkan!"
        : "Kriteria penilaian berhasil diperbarui!",
      "success"
    );
    setCriterionModalOpen(false);
  };

  const handleDeleteCriterion = (rubricId: string, critId: string) => {
    setRpsData((prev) => ({
      ...prev,
      rubrics: (prev.rubrics || []).map((r) => {
        if (r.id !== rubricId) return r;
        return {
          ...r,
          criteria: r.criteria.filter((c) => c.id !== critId),
        };
      }),
    }));
    showNotification("Kriteria rubrik dihapus.", "info");
  };

  // Generate rubrik untuk seluruh CPMK (Jika ada 5 CPMK, maka menghasilkan 5 Rubrik Penilaian OBE)
  const handleAutoGenerateMissingRubrics = () => {
    const targetCpmkList =
      cpmkItems.length > 0
        ? cpmkItems
        : [
            {
              id: "CPMK 1",
              desc: `Penguasaan konsep teoretis & landasan keilmuan ${rpsData.namaMK || "Mata Kuliah"}`,
            },
            {
              id: "CPMK 2",
              desc: `Analisis kasus dan dinamika persoalan kontekstual kepulauan ${rpsData.namaMK || "Mata Kuliah"}`,
            },
            {
              id: "CPMK 3",
              desc: `Penerapan metode, pengolahan data empiris dan investigasi ${rpsData.namaMK || "Mata Kuliah"}`,
            },
            {
              id: "CPMK 4",
              desc: `Perancangan solusi inovatif proyek kolaboratif (PjBL) ${rpsData.namaMK || "Mata Kuliah"}`,
            },
            {
              id: "CPMK 5",
              desc: `Evaluasi kebijakan, etika akademik dan portofolio akhir ${rpsData.namaMK || "Mata Kuliah"}`,
            },
          ];

    const generated = generateDefaultObeRubrics(rpsData.namaMK || "Mata Kuliah", targetCpmkList);

    setRpsData((prev) => ({
      ...prev,
      rubrics: generated,
    }));

    setExpandedRubricIds(generated.map((r) => r.id));

    showNotification(
      `Sukses! Dihasilkan ${generated.length} Rubrik Penilaian OBE lengkap sesuai dengan ${targetCpmkList.length} Capaian Pembelajaran Mata Kuliah (CPMK 1 s.d. CPMK ${targetCpmkList.length}).`,
      "success"
    );
  };

  return (
    <div className="border-2 border-indigo-200 rounded-xl p-3.5 bg-indigo-50/40 shadow-sm transition">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" />
            Pembangun Rubrik Penilaian OBE (Assessment Rubric Builder)
          </label>
          <p className="text-[11px] text-indigo-900/80 font-medium leading-relaxed">
            Menyusun rubrik analitik berbasis kriteria &amp; indikator kinerja untuk tiap CPMK/Sub-CPMK sesuai standar <strong>OBE &amp; Peraturan UNPATTI</strong>.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {onSyncGemini && (
            <button
              type="button"
              onClick={onSyncGemini}
              disabled={isSyncing}
              className="text-[10px] bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-purple-500 active:scale-95"
              title="Sinkronkan Rubrik Penilaian OBE secara otomatis dengan Gemini AI berbasis CPMK dan Pasal 47 Peraturan Rektor UNPATTI No. 12 Tahun 2026"
            >
              {isSyncing ? (
                <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
              ) : (
                <Bot className="w-3 h-3 text-amber-300" />
              )}
              <span>Sinkronkan Rubrik (Gemini AI)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAutoGenerateMissingRubrics}
            className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs"
            title="Otomatis buat rubrik standar OBE untuk CPMK yang belum memiliki rubrik"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>Generate Otomatis</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddRubric}
            className="text-[10px] bg-indigo-700 hover:bg-indigo-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>+ Buat Rubrik</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
        <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 block">Total Rubrik Terdaftar</span>
          <span className="text-sm font-black text-indigo-900">{rubrics.length}</span>
          <span className="text-[9px] text-slate-500 block">Sasaran Belajar</span>
        </div>
        <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 block">Cakupan CPMK</span>
          <span className="text-sm font-black text-emerald-800">
            {rubrics.filter((r) => r.objectiveType === "CPMK").length} / {cpmkItems.length}
          </span>
          <span className="text-[9px] text-slate-500 block">CPMK Terpetakan</span>
        </div>
        <div className="bg-white/80 p-2 rounded-lg border border-indigo-100 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 block">Kriteria Penilaian</span>
          <span className="text-sm font-black text-blue-900">
            {rubrics.reduce((acc, r) => acc + (r.criteria?.length || 0), 0)}
          </span>
          <span className="text-[9px] text-slate-500 block">Indikator Terukur</span>
        </div>
      </div>

      {/* Empty State */}
      {rubrics.length === 0 && (
        <div className="bg-white/90 border-2 border-dashed border-indigo-200 rounded-xl p-5 text-center">
          <FileSpreadsheet className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-indigo-950 mb-1">
            Belum Ada Rubrik Penilaian Terdaftar
          </h4>
          <p className="text-[11px] text-slate-600 max-w-md mx-auto mb-3">
            Gunakan tombol <strong>&ldquo;Generate Otomatis&rdquo;</strong> untuk membuat rubrik analitik berbasis OBE dengan kriteria penguasaan konsep, aplikasi kontekstual, dan etika akademik secara instan.
          </p>
          <button
            type="button"
            onClick={handleAutoGenerateMissingRubrics}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Rubrik untuk Seluruh CPMK Sekarang</span>
          </button>
        </div>
      )}

      {/* List of Rubrics */}
      <div className="space-y-2.5">
        {rubrics.map((rubric) => {
          const isExpanded = expandedRubricIds.includes(rubric.id);
          const totalCritWeight = rubric.criteria.reduce(
            (sum, c) => sum + (c.weightPercent || 0),
            0
          );
          const isWeightValid = totalCritWeight === 100;

          return (
            <div
              key={rubric.id}
              className="bg-white border border-indigo-200 rounded-xl overflow-hidden shadow-xs transition hover:border-indigo-300"
            >
              {/* Rubric Header Row */}
              <div
                className="p-3 bg-slate-50/70 hover:bg-indigo-50/40 transition flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleAccordion(rubric.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                  <span className="font-mono font-black text-[10px] bg-indigo-700 text-white px-2 py-0.5 rounded shadow-xs flex-shrink-0">
                    {rubric.objectiveRef}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 flex-shrink-0">
                    {rubric.objectiveType}
                  </span>
                  {rubric.targetBloomLevel && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex-shrink-0">
                      {rubric.targetBloomLevel}
                    </span>
                  )}
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {rubric.objectiveTitle || rubric.assessmentMethod}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Metode: <strong>{rubric.assessmentMethod}</strong> &bull; {rubric.criteria.length} Kriteria
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                      isWeightValid
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                        : "bg-rose-100 text-rose-900 border-rose-300"
                    }`}
                  >
                    Bobot: {totalCritWeight}%
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditRubric(rubric);
                    }}
                    className="p-1 hover:bg-indigo-100 text-indigo-700 rounded transition"
                    title="Ubah info rubrik"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRubric(rubric.id, rubric.objectiveRef);
                    }}
                    className="p-1 hover:bg-rose-100 text-rose-700 rounded transition"
                    title="Hapus rubrik"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-slate-400 pl-0.5">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-600" />
                    )}
                  </span>
                </div>
              </div>

              {/* Accordion Body: Criteria & Performance Indicators */}
              {isExpanded && (
                <div className="p-3 border-t border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Kriteria Penilaian &amp; Indikator Kinerja OBE:</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddCriterion(rubric.id)}
                      className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2 py-0.8 rounded transition flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Kriteria</span>
                    </button>
                  </div>

                  {rubric.criteria.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <p className="text-[11px] text-slate-500">
                        Belum ada kriteria penilaian dalam rubrik ini.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse text-[10.5px]">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300 text-slate-800">
                            <th className="p-2 font-bold w-44">Kriteria &amp; Bobot</th>
                            <th className="p-2 font-bold w-48">Indikator Kinerja</th>
                            <th className="p-2 font-bold bg-emerald-50/80 text-emerald-950 border-l border-r border-slate-200">
                              Sangat Baik (85-100) [A]
                            </th>
                            <th className="p-2 font-bold bg-blue-50/80 text-blue-950 border-r border-slate-200">
                              Baik (70-84) [B]
                            </th>
                            <th className="p-2 font-bold bg-amber-50/80 text-amber-950 border-r border-slate-200">
                              Cukup (55-69) [C]
                            </th>
                            <th className="p-2 font-bold bg-rose-50/80 text-rose-950">
                              Kurang (&lt;55) [D/E]
                            </th>
                            <th className="p-2 text-center w-12 font-bold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {rubric.criteria.map((crit) => (
                            <tr key={crit.id} className="hover:bg-slate-50/80 transition align-top">
                              <td className="p-2">
                                <div className="font-bold text-slate-900 leading-snug">
                                  {crit.name}
                                </div>
                                <span className="inline-block mt-1 font-mono font-extrabold text-[9px] bg-indigo-100 text-indigo-900 border border-indigo-200 px-1.5 py-0.2 rounded">
                                  Bobot: {crit.weightPercent}%
                                </span>
                              </td>
                              <td className="p-2 text-slate-700 leading-relaxed font-medium">
                                {crit.indicator}
                              </td>
                              <td className="p-2 text-emerald-950 bg-emerald-50/30 border-l border-r border-slate-200 text-[10px] leading-relaxed">
                                {crit.levels.sangatBaik}
                              </td>
                              <td className="p-2 text-blue-950 bg-blue-50/30 border-r border-slate-200 text-[10px] leading-relaxed">
                                {crit.levels.baik}
                              </td>
                              <td className="p-2 text-amber-950 bg-amber-50/30 border-r border-slate-200 text-[10px] leading-relaxed">
                                {crit.levels.cukup}
                              </td>
                              <td className="p-2 text-rose-950 bg-rose-50/30 text-[10px] leading-relaxed">
                                {crit.levels.kurang}
                              </td>
                              <td className="p-2 text-center align-middle">
                                <div className="flex flex-col items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCriterion(rubric.id, crit)}
                                    className="p-1 hover:bg-indigo-100 text-indigo-700 rounded transition"
                                    title="Edit kriteria"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCriterion(rubric.id, crit.id)}
                                    className="p-1 hover:bg-rose-100 text-rose-700 rounded transition"
                                    title="Hapus kriteria"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!isWeightValid && (
                    <div className="flex items-center gap-1.5 text-[10.5px] text-rose-800 bg-rose-50 border border-rose-300 p-2 rounded-lg font-bold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Peringatan: Total bobot kriteria pada rubrik ini adalah{" "}
                        <strong>{totalCritWeight}%</strong>. Standar OBE mewajibkan total bobot bernilai tepat{" "}
                        <strong>100%</strong>.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Tambah / Edit Rubrik Target */}
      {rubricModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 border border-slate-300 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-2.5 mb-2.5 shrink-0">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>
                  {rubricModalMode === "add" ? "Buat Rubrik Penilaian Baru" : "Edit Pengaturan Rubrik"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setRubricModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat Sasaran Pembelajaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormObjectiveType("CPMK");
                      setFormObjectiveRef(cpmkItems[0]?.id || "CPMK 1");
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                      formObjectiveType === "CPMK"
                        ? "bg-indigo-700 text-white border-indigo-700 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    CPMK (Mata Kuliah)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormObjectiveType("Sub-CPMK");
                      setFormObjectiveRef(subCpmkItems[0]?.id || "Sub-CPMK 1");
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition ${
                      formObjectiveType === "Sub-CPMK"
                        ? "bg-indigo-700 text-white border-indigo-700 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    Sub-CPMK (Tahapan)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Sasaran Capaian ({formObjectiveType})
                </label>
                <select
                  value={formObjectiveRef}
                  onChange={(e) => setFormObjectiveRef(e.target.value)}
                  className="w-full text-xs p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
                >
                  {formObjectiveType === "CPMK"
                    ? cpmkItems.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} - {c.desc.slice(0, 70)}...
                        </option>
                      ))
                    : subCpmkItems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} ({s.cpmkRef}) - {s.desc.slice(0, 65)}...
                        </option>
                      ))}
                </select>
              </div>

              {/* Checkboxes untuk Bentuk & Metode Asesmen OBE (User Request) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Bentuk &amp; Metode Asesmen OBE (Dapat dipilih lebih dari 1)
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Centang metode asesmen yang diterapkan dalam rubrik ini
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFormAssessmentMethod(
                          ["Case Study", "Proyek", "Presentasi", "Laporan"].join(", ")
                        );
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition"
                      title="Sesuai Pasal 47: Case Method & PjBL"
                    >
                      Case &amp; Proyek
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormAssessmentMethod(OBE_ASSESSMENT_CHECKBOX_OPTIONS.join(", "));
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 transition"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormAssessmentMethod("")}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold hover:bg-slate-200 transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border-2 border-slate-200 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                    {OBE_ASSESSMENT_CHECKBOX_OPTIONS.map((method) => {
                      // Cek apakah metode sudah terpilih (case-insensitive substring atau kata)
                      const currentSelected = formAssessmentMethod
                        ? formAssessmentMethod.split(",").map((m) => m.trim().toLowerCase())
                        : [];
                      const isChecked =
                        currentSelected.includes(method.toLowerCase()) ||
                        formAssessmentMethod.toLowerCase().includes(method.toLowerCase());

                      return (
                        <label
                          key={method}
                          className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer transition select-none ${
                            isChecked
                              ? "bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const list = formAssessmentMethod
                                ? formAssessmentMethod
                                    .split(",")
                                    .map((m) => m.trim())
                                    .filter(Boolean)
                                : [];
                              if (e.target.checked) {
                                if (!list.some((item) => item.toLowerCase() === method.toLowerCase())) {
                                  list.push(method);
                                }
                              } else {
                                const idx = list.findIndex(
                                  (item) => item.toLowerCase() === method.toLowerCase()
                                );
                                if (idx >= 0) list.splice(idx, 1);
                              }
                              setFormAssessmentMethod(list.join(", "));
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate">{method}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Kolom Teks Bentuk & Metode Asesmen Terpilih */}
                <div className="mt-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Ringkasan Bentuk Asesmen Terpilih (Dapat diketik/ditambahkan manual):
                  </label>
                  <input
                    type="text"
                    value={formAssessmentMethod}
                    onChange={(e) => setFormAssessmentMethod(e.target.value)}
                    placeholder="Pilih dari checkbox di atas atau ketik metode asesmen khusus..."
                    className="w-full text-xs p-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900 bg-white focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setRubricModalOpen(false)}
                className="text-xs px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRubric}
                className="text-xs px-4 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold transition shadow-xs"
              >
                Simpan Rubrik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Tambah / Edit Kriteria & Indikator Kinerja */}
      {criterionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-4 border border-slate-300 animate-in fade-in zoom-in-95 duration-150 my-6">
            <h3 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>
                {criterionModalMode === "add"
                  ? "Tambah Kriteria Penilaian OBE"
                  : "Edit Kriteria & Indikator Kinerja"}
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 mb-3">
              Rumuskan kriteria yang terukur, indikator keberhasilan, dan deskriptor performa untuk masing-masing skala nilai (A, B, C, D/E).
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kriteria Penilaian
                  </label>
                  <input
                    type="text"
                    value={critName}
                    onChange={(e) => setCritName(e.target.value)}
                    placeholder="Contoh: Penguasaan Konsep Kemiskinan Multidimensional"
                    className="w-full text-xs p-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bobot Kriteria (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={critWeight}
                    onChange={(e) => setCritWeight(Number(e.target.value) || 0)}
                    className="w-full text-xs p-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 bg-white text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Indikator Kinerja (Performance Indicator)
                </label>
                <input
                  type="text"
                  value={critIndicator}
                  onChange={(e) => setCritIndicator(e.target.value)}
                  placeholder="Contoh: Ketepatan membedakan kemiskinan multidimensional, rujukan teoritis, dan komputasi MPI"
                  className="w-full text-xs p-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900 bg-white"
                />
              </div>

              {/* Levels of Performance */}
              <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Deskriptor Tingkat Kinerja (Performance Levels):
                </span>

                <div>
                  <label className="block text-[10.5px] font-bold text-emerald-800 mb-0.5">
                    Sangat Baik &bull; Nilai 85 - 100 (A)
                  </label>
                  <textarea
                    rows={2}
                    value={critSangatBaik}
                    onChange={(e) => setCritSangatBaik(e.target.value)}
                    placeholder="Deskripsi performa istimewa / melampaui ekspektasi capaian..."
                    className="w-full text-xs p-1.5 border border-emerald-300 rounded bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-blue-800 mb-0.5">
                    Baik &bull; Nilai 70 - 84.99 (B)
                  </label>
                  <textarea
                    rows={2}
                    value={critBaik}
                    onChange={(e) => setCritBaik(e.target.value)}
                    placeholder="Deskripsi performa memenuhi standar capaian dengan baik..."
                    className="w-full text-xs p-1.5 border border-blue-300 rounded bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-amber-800 mb-0.5">
                    Cukup &bull; Nilai 55 - 69.99 (C)
                  </label>
                  <textarea
                    rows={2}
                    value={critCukup}
                    onChange={(e) => setCritCukup(e.target.value)}
                    placeholder="Deskripsi performa batas minimal, terdapat ketidaksempurnaan..."
                    className="w-full text-xs p-1.5 border border-amber-300 rounded bg-white text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-rose-800 mb-0.5">
                    Kurang &bull; Nilai &lt; 55 (D / E)
                  </label>
                  <textarea
                    rows={2}
                    value={critKurang}
                    onChange={(e) => setCritKurang(e.target.value)}
                    placeholder="Deskripsi performa tidak memenuhi standar kelulusan..."
                    className="w-full text-xs p-1.5 border border-rose-300 rounded bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCriterionModalOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCriterion}
                className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs"
              >
                Simpan Kriteria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
