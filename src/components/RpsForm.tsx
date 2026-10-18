import React, { useState } from "react";
import {
  FileEdit,
  Globe,
  CheckSquare,
  Layers,
  GitBranch,
  Scale,
  Sparkles,
  RotateCcw,
  Upload,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Lightbulb,
  BarChart2,
  Award,
  Loader2,
  ClipboardPaste,
  BookOpen,
  Database,
  Bookmark,
  GraduationCap,
  Bot,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  FileText,
} from "lucide-react";
import { CpmkItem, RpsData, SubCpmkItem, CplItem } from "../types/rps";
import { CPL_OFFICIAL_PENYULUHAN, UNPATTI_SDGS_LIST } from "../data/unpattiDefaults";
import { KKNI_DESCRIPTORS_LIST } from "../data/kkniDefaults";
import { BloomTaxonomyGuide, BLOOM_TAXONOMY_LEVELS } from "./BloomTaxonomyGuide";
import { SdgAlignmentRadarChart } from "./SdgAlignmentRadarChart";
import { PipUnpattiIntegrator } from "./PipUnpattiIntegrator";
import { KkniIntegrator } from "./KkniIntegrator";
import { AssessmentRubricBuilder } from "./AssessmentRubricBuilder";
import { BulkImportModal, BulkImportType } from "./BulkImportModal";
import { ReferenceLibraryModal } from "./ReferenceLibraryModal";
import { parseUploadedRpsFile } from "../utils/rpsDocumentParser";
import {
  getStoredProdiCpls,
  saveStoredProdiCpls,
  parseBulkCplText,
} from "../utils/prodiCplStorage";
import { generateObeCurriculumComponents } from "../utils/obeCurriculumGenerator";

interface RpsFormProps {
  rpsData: RpsData;
  setRpsData: React.Dispatch<React.SetStateAction<RpsData>>;
  onGenerate: () => void;
  onReset: () => void;
  onUploadSuccess?: () => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export const RpsForm: React.FC<RpsFormProps> = ({
  rpsData,
  setRpsData,
  onGenerate,
  onReset,
  onUploadSuccess,
  showNotification,
}) => {
  // Modal states for CPMK
  const [cpmkModalOpen, setCpmkModalOpen] = useState(false);
  const [cpmkModalMode, setCpmkModalMode] = useState<"add" | "edit">("add");
  const [cpmkEditId, setCpmkEditId] = useState("");
  const [cpmkInputId, setCpmkInputId] = useState("");
  const [cpmkInputDesc, setCpmkInputDesc] = useState("");
  const [cpmkInputCplRefs, setCpmkInputCplRefs] = useState<string[]>([]);

  // Modal states for Sub-CPMK
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subModalMode, setSubModalMode] = useState<"add" | "edit">("add");
  const [subEditId, setSubEditId] = useState("");
  const [subInputId, setSubInputId] = useState("");
  const [subInputRef, setSubInputRef] = useState("CPMK 1");
  const [subInputBloom, setSubInputBloom] = useState("C2-Pemahaman");
  const [subInputDesc, setSubInputDesc] = useState("");

  // Bloom Guide Side-Panel/Modal state
  const [bloomGuideOpen, setBloomGuideOpen] = useState(false);

  // SDG Radar Chart visibility state
  const [showSdgRadar, setShowSdgRadar] = useState(false);

  // Search filter for CPLs
  const [cplSearch, setCplSearch] = useState("");

  // Modal states for CPL
  const [cplModalOpen, setCplModalOpen] = useState(false);
  const [cplModalMode, setCplModalMode] = useState<"add" | "edit">("add");
  const [cplEditId, setCplEditId] = useState("");
  const [cplInputId, setCplInputId] = useState("");
  const [cplInputCategory, setCplInputCategory] = useState<
    "Sikap" | "Keterampilan Umum" | "Keterampilan Khusus" | "Penguasaan Pengetahuan" | "Integrasi (S, P, K)"
  >("Keterampilan Khusus");
  const [cplInputDesc, setCplInputDesc] = useState("");

  // Gemini AI Synchronization State
  const [isSyncingWithGemini, setIsSyncingWithGemini] = useState(false);
  const [syncProgressMsg, setSyncProgressMsg] = useState("");
  const [syncResultModalOpen, setSyncResultModalOpen] = useState(false);
  const [syncSummary, setSyncSummary] = useState<{
    cpmkCount: number;
    subCpmkCount: number;
    hasBahanKajian: boolean;
    rubricsCount: number;
    target: string;
  } | null>(null);

  // Bulk Paste CPL Modal state (Ketik atau Paste CPL satu kali untuk prodi dan tersimpan permanen)
  const [bulkPasteCplModalOpen, setBulkPasteCplModalOpen] = useState(false);
  const [rawBulkCplText, setRawBulkCplText] = useState("");
  const [bulkPasteMode, setBulkPasteMode] = useState<"replace" | "append">("replace");

  // Modal Informasi Resmi Peraturan Rektor Universitas Pattimura No. 12 Tahun 2026 Pasal 47
  const [pasal47ModalOpen, setPasal47ModalOpen] = useState(false);

  // Muat Bank CPL Prodi jika form CPL saat ini masih kosong
  React.useEffect(() => {
    if ((!rpsData.cplList || rpsData.cplList.length === 0) && rpsData.namaProdi) {
      const stored = getStoredProdiCpls(rpsData.namaProdi);
      if (stored && stored.length > 0) {
        setRpsData((prev) => ({
          ...prev,
          cplList: stored,
        }));
      }
    }
  }, [rpsData.namaProdi]);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  // Bulk Import Modal state (Unggah / Ketik / Tempel massal untuk CPL, CPMK, Sub-CPMK)
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportType, setBulkImportType] = useState<BulkImportType>("cpl");

  const openBulkImport = (type: BulkImportType) => {
    setBulkImportType(type);
    setBulkImportOpen(true);
  };

  const handleBulkImportSubmit = (importedItems: any[]) => {
    if (bulkImportType === "cpl") {
      const activeCpls = rpsData.cplList || [];
      const existingIds = new Set(activeCpls.map((c) => c.id));
      const newlyAdded: CplItem[] = [];
      const newSelectedIds: string[] = [];

      importedItems.forEach((item, idx) => {
        let targetId = item.id ? item.id.toUpperCase().replace(/\s+/, "") : `CPL${activeCpls.length + idx + 1}`;
        if (!targetId.startsWith("CPL")) {
          targetId = `CPL${targetId}`;
        }
        // Pastikan unik jika bertabrakan
        let uniqueId = targetId;
        let counter = 1;
        while (existingIds.has(uniqueId)) {
          uniqueId = `${targetId}_${counter++}`;
        }
        existingIds.add(uniqueId);
        newlyAdded.push({
          id: uniqueId,
          category: item.category || "Keterampilan Khusus",
          desc: item.desc,
        });
        newSelectedIds.push(uniqueId);
      });

      const updatedCpls = [...activeCpls, ...newlyAdded];
      setRpsData((prev) => ({
        ...prev,
        cplList: updatedCpls,
        selectedCpls: Array.from(new Set([...prev.selectedCpls, ...newSelectedIds])),
      }));
      // Simpan permanen ke Bank CPL Prodi agar tidak hilang saat Reset Form
      saveStoredProdiCpls(rpsData.namaProdi || "Program Studi", updatedCpls);
      showNotification(`Berhasil menambahkan ${newlyAdded.length} CPL dan menyimpannya permanen ke Bank CPL ${rpsData.namaProdi || "Program Studi"}!`, "success");
    } else if (bulkImportType === "cpmk") {
      const existing = rpsData.cpmkList || [];
      const existingIds = new Set(existing.map((c) => c.id));
      const newlyAdded: CpmkItem[] = [];

      importedItems.forEach((item, idx) => {
        let targetId = item.id || `CPMK ${existing.length + idx + 1}`;
        let uniqueId = targetId;
        let counter = 1;
        while (existingIds.has(uniqueId)) {
          uniqueId = `${targetId} (${counter++})`;
        }
        existingIds.add(uniqueId);
        newlyAdded.push({
          id: uniqueId,
          desc: item.desc,
        });
      });

      setRpsData((prev) => ({
        ...prev,
        cpmkList: [...existing, ...newlyAdded],
      }));
    } else if (bulkImportType === "subcpmk") {
      const existing = rpsData.subCpmkList || [];
      const existingIds = new Set(existing.map((s) => s.id));
      const newlyAdded: SubCpmkItem[] = [];

      importedItems.forEach((item, idx) => {
        let targetId = item.id || `Sub-CPMK ${existing.length + idx + 1}`;
        let uniqueId = targetId;
        let counter = 1;
        while (existingIds.has(uniqueId)) {
          uniqueId = `${targetId} (${counter++})`;
        }
        existingIds.add(uniqueId);
        newlyAdded.push({
          id: uniqueId,
          cpmkRef: item.cpmkRef || rpsData.cpmkList[0]?.id || "CPMK 1",
          bloom: item.bloom || "C3-Penerapan",
          desc: item.desc,
        });
      });

      setRpsData((prev) => ({
        ...prev,
        subCpmkList: [...existing, ...newlyAdded],
      }));
    }
  };

  // State & Handler Database Pustaka (Lokal & Online)
  const [refLibraryOpen, setRefLibraryOpen] = useState(false);

  const handleInsertReferences = (
    selectedCitations: string[],
    category: "utama" | "pendukung" | "gabungan"
  ) => {
    setRpsData((prev) => {
      const current = (prev.daftarPustaka || "").trim();
      let updated = current;

      if (category === "gabungan") {
        const numbered = selectedCitations.map((c, i) => `${i + 1}. ${c}`).join("\n");
        updated = current ? `${current}\n\n${numbered}` : numbered;
      } else if (category === "utama") {
        const header = "A. Pustaka Utama:";
        const numbered = selectedCitations.map((c, i) => `   ${i + 1}. ${c}`).join("\n");
        if (current.includes(header)) {
          updated = current.replace(header, `${header}\n${numbered}`);
        } else if (current.includes("B. Pustaka Pendukung:") || current.includes("Pustaka Pendukung:")) {
          updated = `${header}\n${numbered}\n\n${current}`;
        } else {
          updated = current ? `${current}\n\n${header}\n${numbered}` : `${header}\n${numbered}`;
        }
      } else {
        const header = "B. Pustaka Pendukung:";
        const numbered = selectedCitations.map((c, i) => `   ${i + 1}. ${c}`).join("\n");
        if (current.includes(header)) {
          updated = current.replace(header, `${header}\n${numbered}`);
        } else {
          updated = current ? `${current}\n\n${header}\n${numbered}` : `${header}\n${numbered}`;
        }
      }

      return {
        ...prev,
        daftarPustaka: updated,
      };
    });
  };

  // Batas semester sesuai jenjang: S1 & Spesialis (8 Semester), S2 & Profesi (4 Semester), S3 (6 Semester)
  const getMaxSemestersForJenjang = (jenjang?: string): number => {
    if (jenjang === "S2" || jenjang === "Profesi") return 4;
    if (jenjang === "S3") return 6;
    return 8; // S1 dan Spesialis
  };

  // Pemilihan Jenjang Pendidikan (S1, S2, S3, Profesi, Spesialis)
  // Otomatis menyesuaikan Penyesuaian Jenjang KKNI (Level 6 - 9), Taksonomi Bloom, dan Semester
  const handleSelectJenjang = (jenj: "S1" | "S2" | "S3" | "Profesi" | "Spesialis") => {
    let targetKkniLevel = 6;
    if (jenj === "Profesi") targetKkniLevel = 7;
    else if (jenj === "S2" || jenj === "Spesialis") targetKkniLevel = 8;
    else if (jenj === "S3") targetKkniLevel = 9;

    const targetKkniItems = KKNI_DESCRIPTORS_LIST.filter(
      (d) => d.level === targetKkniLevel
    ).map((d) => d.id);

    // Otomatis pilih default bloom untuk Sub-CPMK editor jika ada
    if (jenj === "S1" && !["C1-Mengingat", "C2-Pemahaman", "C3-Penerapan", "C4-Analisis"].includes(subInputBloom)) {
      setSubInputBloom("C4-Analisis");
    } else if ((jenj === "S2" || jenj === "Spesialis") && !["C4-Analisis", "C5-Evaluasi", "C6-Kreasi"].includes(subInputBloom)) {
      setSubInputBloom("C5-Evaluasi");
    } else if (jenj === "S3" && !["C5-Evaluasi", "C6-Kreasi"].includes(subInputBloom)) {
      setSubInputBloom("C6-Kreasi");
    } else if (jenj === "Profesi" && !["C3-Penerapan", "C4-Analisis", "C5-Evaluasi"].includes(subInputBloom)) {
      setSubInputBloom("C4-Analisis");
    }

    // Batasi semester sesuai jenjang terpilih
    const maxSem = getMaxSemestersForJenjang(jenj);
    const currentSemNum = parseInt(rpsData.semester.replace(/[^0-9]/g, "")) || 1;
    const newSem = currentSemNum > maxSem ? "Semester 1" : (rpsData.semester || "Semester 1");

    setRpsData((prev) => ({
      ...prev,
      jenjang: jenj,
      semester: newSem,
      selectedKkniLevels: [targetKkniLevel],
      selectedKkniItems: targetKkniItems,
    }));

    showNotification(
      `Jenjang ${jenj} (${maxSem} Semester) dipilih! KKNI Level ${targetKkniLevel} dan Taksonomi Bloom diselaraskan.`,
      "success"
    );
  };

  // Handle basic inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setRpsData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle SKS numbers
  const handleSksTeoriChange = (val: number) => {
    setRpsData((prev) => {
      const teori = Math.max(0, val);
      return {
        ...prev,
        sksTeori: teori,
        bobotSKS: teori + prev.sksPraktik,
      };
    });
  };

  const handleSksPraktikChange = (val: number) => {
    setRpsData((prev) => {
      const praktik = Math.max(0, val);
      return {
        ...prev,
        sksPraktik: praktik,
        bobotSKS: prev.sksTeori + praktik,
      };
    });
  };

  // Toggle SDG
  const toggleSdg = (id: number) => {
    setRpsData((prev) => {
      const exists = prev.selectedSdgs.includes(id);
      const updated = exists
        ? prev.selectedSdgs.filter((s) => s !== id)
        : [...prev.selectedSdgs, id].sort((a, b) => a - b);
      return { ...prev, selectedSdgs: updated };
    });
  };

  // Toggle CPL
  const toggleCpl = (id: string) => {
    setRpsData((prev) => {
      const exists = prev.selectedCpls.includes(id);
      const updated = exists
        ? prev.selectedCpls.filter((c) => c !== id)
        : [...prev.selectedCpls, id];
      return { ...prev, selectedCpls: updated };
    });
  };

  // Assessment weights handler
  const handleWeightChange = (key: keyof RpsData["assessmentWeights"], val: number) => {
    setRpsData((prev) => ({
      ...prev,
      assessmentWeights: {
        ...prev.assessmentWeights,
        [key]: Math.max(0, val),
      },
    }));
  };

  // Validation according to UNPATTI Pasal 47 Peraturan Rektor No. 12 Tahun 2026 (Ayat 3: Partisipatif & Proyek >= 50%)
  const groupA = rpsData.assessmentWeights.partisipatif + rpsData.assessmentWeights.proyek;
  const groupB =
    rpsData.assessmentWeights.tugas +
    rpsData.assessmentWeights.kuis +
    rpsData.assessmentWeights.uts +
    rpsData.assessmentWeights.uas;
  const totalWeights = groupA + groupB;
  const isWeightsValid = totalWeights === 100 && groupA >= 50 && groupB <= 50;

  // CPMK modal openers
  const openAddCpmk = () => {
    setCpmkModalMode("add");
    const nextIdx = rpsData.cpmkList.length;
    setCpmkInputId(`CPMK ${nextIdx + 1}`);
    setCpmkInputDesc("");
    const availableCpls = rpsData.cplList || [];
    // Rekomendasikan 1-2 CPL sesuai urutan indeks agar tidak kosong
    const suggested: string[] = [];
    if (availableCpls.length > 0) {
      const idx1 = Math.floor((nextIdx * availableCpls.length) / Math.max(1, nextIdx + 1));
      if (availableCpls[idx1]) suggested.push(availableCpls[idx1].id);
    }
    setCpmkInputCplRefs(suggested);
    setCpmkModalOpen(true);
  };

  const openEditCpmk = (item: CpmkItem) => {
    setCpmkModalMode("edit");
    setCpmkEditId(item.id);
    setCpmkInputId(item.id);
    setCpmkInputDesc(item.desc);
    setCpmkInputCplRefs(item.cplRefs || []);
    setCpmkModalOpen(true);
  };

  const saveCpmk = () => {
    if (!cpmkInputId || !cpmkInputDesc) {
      showNotification("Kode dan deskripsi CPMK harus diisi!", "error");
      return;
    }
    setRpsData((prev) => {
      if (cpmkModalMode === "edit") {
        return {
          ...prev,
          cpmkList: prev.cpmkList.map((c) =>
            c.id === cpmkEditId
              ? { id: cpmkInputId, desc: cpmkInputDesc, cplRefs: cpmkInputCplRefs }
              : c
          ),
        };
      } else {
        return {
          ...prev,
          cpmkList: [
            ...prev.cpmkList,
            { id: cpmkInputId, desc: cpmkInputDesc, cplRefs: cpmkInputCplRefs },
          ],
        };
      }
    });
    setCpmkModalOpen(false);
    showNotification(`CPMK ${cpmkInputId} berhasil disimpan beserta pemetaan CPL!`, "success");
  };

  const deleteCpmk = (id: string) => {
    setRpsData((prev) => ({
      ...prev,
      cpmkList: prev.cpmkList.filter((c) => c.id !== id),
    }));
    showNotification(`CPMK ${id} dihapus.`, "info");
  };

  // Sub-CPMK modal openers
  const openAddSubCpmk = () => {
    setSubModalMode("add");
    setSubInputId(`Sub-CPMK ${rpsData.subCpmkList.length + 1}`);
    setSubInputRef(rpsData.cpmkList[0]?.id || "CPMK 1");
    setSubInputBloom("C2-Pemahaman");
    setSubInputDesc("");
    setSubModalOpen(true);
  };

  const openEditSubCpmk = (item: SubCpmkItem) => {
    setSubModalMode("edit");
    setSubEditId(item.id);
    setSubInputId(item.id);
    setSubInputRef(item.cpmkRef);
    setSubInputBloom(item.bloom);
    setSubInputDesc(item.desc);
    setSubModalOpen(true);
  };

  const saveSubCpmk = () => {
    if (!subInputId || !subInputDesc) {
      showNotification("Kode dan uraian Sub-CPMK harus diisi!", "error");
      return;
    }
    setRpsData((prev) => {
      if (subModalMode === "edit") {
        return {
          ...prev,
          subCpmkList: prev.subCpmkList.map((s) =>
            s.id === subEditId
              ? {
                  id: subInputId,
                  cpmkRef: subInputRef,
                  bloom: subInputBloom,
                  desc: subInputDesc,
                }
              : s
          ),
        };
      } else {
        return {
          ...prev,
          subCpmkList: [
            ...prev.subCpmkList,
            {
              id: subInputId,
              cpmkRef: subInputRef,
              bloom: subInputBloom,
              desc: subInputDesc,
            },
          ],
        };
      }
    });
    setSubModalOpen(false);
    showNotification(`Sub-CPMK ${subInputId} disimpan!`, "success");
  };

  const deleteSubCpmk = (id: string) => {
    setRpsData((prev) => ({
      ...prev,
      subCpmkList: prev.subCpmkList.filter((s) => s.id !== id),
    }));
    showNotification(`Sub-CPMK ${id} dihapus.`, "info");
  };

  const handleSelectBloomVerb = (verb: string, levelCode: string) => {
    if (subModalOpen) {
      setSubInputBloom(levelCode);
      setSubInputDesc((prev) => {
        const trimmed = prev.trim();
        const prefix = "Mahasiswa mampu ";
        if (!trimmed || trimmed === prefix.trim()) {
          return `${prefix}${verb.toLowerCase()} `;
        }
        return `${trimmed} serta ${verb.toLowerCase()} `;
      });
      showNotification(`KKO "${verb}" (${levelCode}) disisipkan ke rumusan Sub-CPMK!`, "success");
    } else {
      showNotification(`KKO "${verb}" disalin ke clipboard!`, "info");
    }
  };

  // CPL Modal Openers & Actions
  const openAddCpl = () => {
    setCplModalMode("add");
    const activeCpls = rpsData.cplList || [];
    setCplInputId(`CPL${activeCpls.length + 1}`);
    setCplInputCategory("Keterampilan Khusus");
    setCplInputDesc("");
    setCplModalOpen(true);
  };

  const openEditCpl = (item: CplItem) => {
    setCplModalMode("edit");
    setCplEditId(item.id);
    setCplInputId(item.id);
    setCplInputCategory(item.category || "Keterampilan Khusus");
    setCplInputDesc(item.desc);
    setCplModalOpen(true);
  };

  const saveCpl = () => {
    if (!cplInputId.trim() || !cplInputDesc.trim()) {
      showNotification("Kode CPL dan Uraian deskripsi CPL wajib diisi!", "error");
      return;
    }
    const activeCpls = rpsData.cplList || [];

    const formattedId = cplInputId.trim().toUpperCase();

    if (cplModalMode === "add") {
      const newItem: CplItem = {
        id: formattedId,
        category: cplInputCategory,
        desc: cplInputDesc.trim(),
      };
      const updatedList = [...activeCpls, newItem];
      setRpsData((prev) => ({
        ...prev,
        cplList: updatedList,
        selectedCpls: prev.selectedCpls.includes(formattedId)
          ? prev.selectedCpls
          : [...prev.selectedCpls, formattedId],
      }));
      saveStoredProdiCpls(rpsData.namaProdi || "Program Studi", updatedList);
      showNotification(`CPL ${formattedId} berhasil ditambahkan dan disimpan permanen ke Bank CPL!`, "success");
    } else {
      const updatedList = activeCpls.map((c) =>
        c.id === cplEditId
          ? {
              ...c,
              id: formattedId,
              category: cplInputCategory,
              desc: cplInputDesc.trim(),
            }
          : c
      );
      setRpsData((prev) => ({
        ...prev,
        cplList: updatedList,
        selectedCpls: prev.selectedCpls.map((id) =>
          id === cplEditId ? formattedId : id
        ),
      }));
      saveStoredProdiCpls(rpsData.namaProdi || "Program Studi", updatedList);
      showNotification(`CPL ${formattedId} berhasil diperbarui di Bank CPL Prodi!`, "success");
    }
    setCplModalOpen(false);
  };

  const deleteCpl = (id: string) => {
    const activeCpls = rpsData.cplList || [];
    const updated = activeCpls.filter((c) => c.id !== id);
    setRpsData((prev) => ({
      ...prev,
      cplList: updated,
      selectedCpls: prev.selectedCpls.filter((cId) => cId !== id),
    }));
    saveStoredProdiCpls(rpsData.namaProdi || "Program Studi", updated);
    showNotification(`CPL ${id} berhasil dihapus dari Bank CPL Prodi.`, "info");
  };

  // 1-Click Paste / Ketik CPL Sekaligus untuk Bank Prodi (Tersimpan Permanen)
  const handleBulkPasteCplToBank = () => {
    if (!rawBulkCplText.trim()) {
      showNotification("Silakan ketik atau tempelkan teks daftar CPL terlebih dahulu!", "error");
      return;
    }

    const parsedCpls = parseBulkCplText(rawBulkCplText);
    if (parsedCpls.length === 0) {
      showNotification(
        "Tidak ada butir CPL yang terdeteksi. Pastikan terdapat nomor atau kode seperti 'CPL 1 - ...' atau '1. Mampu ...'",
        "error"
      );
      return;
    }

    const prodi = rpsData.namaProdi || "Program Studi";
    let finalList: CplItem[] = [];

    if (bulkPasteMode === "replace") {
      finalList = parsedCpls;
    } else {
      const existing = rpsData.cplList || [];
      const existingIds = new Set(existing.map((c) => c.id));
      const newlyAdded: CplItem[] = [];

      parsedCpls.forEach((item) => {
        let uniqueId = item.id;
        let counter = 1;
        while (existingIds.has(uniqueId)) {
          uniqueId = `${item.id}_${counter++}`;
        }
        existingIds.add(uniqueId);
        newlyAdded.push({ ...item, id: uniqueId });
      });
      finalList = [...existing, ...newlyAdded];
    }

    setRpsData((prev) => ({
      ...prev,
      cplList: finalList,
      selectedCpls: finalList.slice(0, 6).map((c) => c.id),
    }));

    // Simpan permanen ke Bank CPL Prodi di localStorage
    saveStoredProdiCpls(prodi, finalList);

    setBulkPasteCplModalOpen(false);
    setRawBulkCplText("");
    showNotification(
      `🎉 Sukses! ${finalList.length} CPL resmi berhasil disimpan ke Bank CPL "${prodi}". CPL ini aman & TIDAK AKAN HILANG saat Anda me-reset formulir!`,
      "success"
    );
  };

  // Sinkronisasi Gemini AI: Merumuskan CPMK, Sub-CPMK, Bahan Kajian, dan Rubrik Penilaian
  const handleSyncObeWithGemini = async (
    target: "all" | "cpmk" | "subcpmk" | "bahankajian" | "rubrik" = "all"
  ) => {
    if (!rpsData.namaMK || !rpsData.namaMK.trim()) {
      showNotification(
        "Harap isi Identitas Mata Kuliah (minimal Nama Mata Kuliah) terlebih dahulu agar Gemini AI dapat merumuskan kurikulum secara presisi.",
        "error"
      );
      const mkInput = document.getElementById("namaMK");
      if (mkInput) {
        mkInput.scrollIntoView({ behavior: "smooth", block: "center" });
        mkInput.focus();
      }
      return;
    }

    setIsSyncingWithGemini(true);
    setSyncProgressMsg("Gemini AI menganalisis Identitas MK, SDGs, PIP Unpatti, Level KKNI, dan CPL...");

    try {
      const generated = await generateObeCurriculumComponents(rpsData, (msg) => {
        setSyncProgressMsg(msg);
      });

      setRpsData((prev) => {
        const updated = { ...prev };
        if (target === "all" || target === "cpmk") {
          updated.cpmkList = generated.cpmkList;
        }
        if (target === "all" || target === "subcpmk") {
          updated.subCpmkList = generated.subCpmkList;
        }
        if (target === "all" || target === "bahankajian") {
          if (generated.bahanKajian) {
            updated.bahanKajian = generated.bahanKajian;
          }
        }
        if (target === "all" || target === "rubrik") {
          updated.rubrics = generated.rubrics;
        }
        if (target === "all" && generated.syllabusList && generated.syllabusList.length > 0) {
          updated.syllabusList = generated.syllabusList;
        }
        if (
          target === "all" &&
          generated.deskripsiMK &&
          (!prev.deskripsiMK || prev.deskripsiMK.trim().length === 0)
        ) {
          updated.deskripsiMK = generated.deskripsiMK;
        }
        return updated;
      });

      setSyncSummary({
        cpmkCount: generated.cpmkList.length,
        subCpmkCount: generated.subCpmkList.length,
        hasBahanKajian: Boolean(generated.bahanKajian),
        rubricsCount: generated.rubrics.length,
        target,
      });
      setSyncResultModalOpen(true);

      showNotification(
        `✨ Sinkronisasi Gemini AI Berhasil! CPMK (${generated.cpmkList.length}), Sub-CPMK (${generated.subCpmkList.length}), Bahan Kajian, dan Rubrik Penilaian (${generated.rubrics.length}) telah terisi otomatis. Anda tinggal menyesuaikan dan mengeditnya.`,
        "success"
      );
    } catch (err: any) {
      console.error("Gagal sinkronisasi OBE dengan Gemini:", err);
      showNotification(
        "Terjadi kendala saat menyinkronkan dengan Gemini AI. Silakan coba kembali.",
        "error"
      );
    } finally {
      setIsSyncingWithGemini(false);
    }
  };

  // File Upload Handler (Ekstrak informasi terbatas: Nama MK, Prodi, SKS, Deskripsi MK, Referensi/Pustaka)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(`Membaca dan memproses berkas "${file.name}"...`);
    showNotification(`Membaca berkas "${file.name}"...`, "info");

    try {
      const parsedRps = await parseUploadedRpsFile(file, (msg) => {
        setUploadStatus(msg);
      });

      // Ekstrak informasi terbatas sesuai permintaan:
      // Nama MK, Nama Program Studi, SKS, Deskripsi Mata Kuliah, dan Referensi/Pustaka
      setRpsData((prev) => ({
        ...prev,
        namaMK: parsedRps.namaMK || prev.namaMK,
        kodeMK: parsedRps.kodeMK || prev.kodeMK,
        namaProdi: parsedRps.namaProdi || prev.namaProdi,
        namaFakultas: parsedRps.namaFakultas || prev.namaFakultas,
        bobotSKS: parsedRps.bobotSKS || prev.bobotSKS,
        sksTeori: parsedRps.sksTeori || prev.sksTeori,
        sksPraktik: parsedRps.sksPraktik || prev.sksPraktik,
        semester: parsedRps.semester || prev.semester,
        deskripsiMK: parsedRps.deskripsiMK || prev.deskripsiMK,
        daftarPustaka: parsedRps.daftarPustaka || prev.daftarPustaka,
        bahanKajian: parsedRps.bahanKajian || prev.bahanKajian,
      }));

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      showNotification(
        `Sukses! Informasi inti berkas ("${parsedRps.namaMK}", Prodi: ${parsedRps.namaProdi}, ${parsedRps.bobotSKS} SKS) berhasil diisi ke form. Pratinjau dikosongkan. Silakan periksa pilihan KKNI, PIP & SDGs, lalu klik 'Generate & Tampilkan RPS' untuk menghasilkan CPMK, Sub-CPMK, dan Rubrik OBE secara otomatis.`,
        "success"
      );
    } catch (err: any) {
      console.error("Gagal parse berkas RPS:", err);
      showNotification(`Gagal memproses berkas RPS: ${err?.message || "Format berkas tidak dikenali"}`, "error");
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      e.target.value = "";
    }
  };

  const activeCpls = rpsData.cplList || [];

  const filteredCpls = activeCpls.filter(
    (c) =>
      c.id.toLowerCase().includes(cplSearch.toLowerCase()) ||
      c.desc.toLowerCase().includes(cplSearch.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(cplSearch.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-900 overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <FileEdit className="w-4 h-4 text-emerald-700" />
            Parameter RPS &amp; Kurikulum OBE
          </h2>
          <p className="text-[11px] text-slate-600 font-medium truncate max-w-[280px] sm:max-w-md">
            {rpsData.namaProdi || rpsData.namaFakultas ? (
              <>
                {rpsData.namaProdi ? rpsData.namaProdi : ""}
                {rpsData.namaProdi && rpsData.namaFakultas ? " • " : ""}
                {rpsData.namaFakultas ? rpsData.namaFakultas : ""}
              </>
            ) : (
              <span className="text-slate-500 italic">
                (Data Prodi &amp; Fakultas Kosong &bull; Silakan isi formulir di bawah atau unggah berkas RPS)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Progress banner saat parsing berkas unggahan */}
      {isUploading && (
        <div className="bg-emerald-50 border-b border-emerald-300 px-5 py-2.5 flex items-center gap-2 text-emerald-950 text-xs font-bold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
          <span>{uploadStatus || "Membaca berkas RPS dan memperbarui seluruh informasi..."}</span>
        </div>
      )}

      {/* Scrollable Form Body */}
      <form
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* Identitas Kampus & Fakultas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nama Perguruan Tinggi
            </label>
            <input
              type="text"
              id="namaKampus"
              value={rpsData.namaKampus}
              onChange={handleChange}
              placeholder="Contoh: UNIVERSITAS PATTIMURA"
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Nama Fakultas</label>
            <input
              type="text"
              id="namaFakultas"
              value={rpsData.namaFakultas}
              onChange={handleChange}
              placeholder="Contoh: FAKULTAS PERTANIAN"
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Prodi, Tombol Pilih Jenjang Pendidikan di Sisi Kanan, & Kode Dokumen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
          {/* Nama Program Studi */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nama Program Studi
            </label>
            <input
              type="text"
              id="namaProdi"
              value={rpsData.namaProdi}
              onChange={handleChange}
              placeholder="Contoh: PROGRAM STUDI S1 PENYULUHAN PERTANIAN"
              className="w-full text-xs px-3 py-2 border-2 border-emerald-300 bg-emerald-50/40 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Tombol Pilih Jenjang Pendidikan di Sisi Kanan Nama Program Studi */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black text-indigo-950 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                <span>Pilih Jenjang Pendidikan</span>
              </label>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                {rpsData.jenjang === "S1"
                  ? "KKNI Level 6"
                  : rpsData.jenjang === "Profesi"
                  ? "KKNI Level 7"
                  : rpsData.jenjang === "S2" || rpsData.jenjang === "Spesialis"
                  ? "KKNI Level 8"
                  : rpsData.jenjang === "S3"
                  ? "KKNI Level 9"
                  : "KKNI Level 6"}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-300">
              {(
                [
                  { key: "S1", label: "S1", sem: "8 Sem" },
                  { key: "S2", label: "S2", sem: "4 Sem" },
                  { key: "S3", label: "S3", sem: "6 Sem" },
                  { key: "Profesi", label: "Profesi", sem: "4 Sem" },
                  { key: "Spesialis", label: "Spesialis", sem: "8 Sem" },
                ] as const
              ).map((item) => {
                const isActive =
                  rpsData.jenjang === item.key || (!rpsData.jenjang && item.key === "S1");
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectJenjang(item.key)}
                    className={`py-1.5 px-0.5 rounded-md text-[10.5px] font-black transition cursor-pointer text-center flex flex-col items-center justify-center ${
                      isActive
                        ? "bg-indigo-700 text-white shadow-sm ring-1 ring-indigo-900"
                        : "bg-white text-slate-700 hover:bg-slate-200"
                    }`}
                    title={`Pilih Jenjang ${item.label} (${item.sem} - Otomatis menyaring KKNI & Taksonomi Bloom)`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[8.5px] font-bold ${isActive ? "text-indigo-200" : "text-slate-400"}`}>
                      {item.sem}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kode Dokumen */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-800 mb-1">Kode Dokumen</label>
            <input
              type="text"
              id="kodeDokumen"
              value={rpsData.kodeDokumen}
              onChange={handleChange}
              placeholder="Contoh: RPS-OBE-01"
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Nama MK & Kode MK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">Nama Mata Kuliah</label>
            <input
              type="text"
              id="namaMK"
              value={rpsData.namaMK}
              onChange={handleChange}
              placeholder="Contoh: Kemiskinan Multidimensional"
              className="w-full text-xs px-3 py-2 border-2 border-emerald-400 bg-emerald-50/40 rounded-lg font-black text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Kode MK</label>
            <input
              type="text"
              id="kodeMK"
              value={rpsData.kodeMK}
              onChange={handleChange}
              placeholder="Contoh: PPP224127"
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900 uppercase focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Rumpun, Jenis, Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Rumpun MK</label>
            <select
              id="rumpunMK"
              value={rpsData.rumpunMK}
              onChange={handleChange}
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg bg-white font-semibold text-slate-900"
            >
              <option value="MK Prodi">MK Prodi</option>
              <option value="Wajib Nasional">Wajib Nasional</option>
              <option value="Wajib Fakultas">Wajib Fakultas</option>
              <option value="Wajib Universitas">Wajib Universitas</option>
              <option value="Pilihan Minat">Pilihan Minat</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Jenis MK</label>
            <select
              id="jenisMK"
              value={rpsData.jenisMK}
              onChange={handleChange}
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg bg-white font-semibold text-slate-900"
            >
              <option value="Wajib">Wajib</option>
              <option value="Pilihan">Pilihan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Tgl. Penyusunan</label>
            <input
              type="date"
              id="tglPengesahan"
              value={rpsData.tglPengesahan}
              onChange={handleChange}
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* Bobot SKS & Semester */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-3 rounded-xl border-2 border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Bobot Total SKS</label>
            <input
              type="number"
              value={rpsData.bobotSKS}
              readOnly
              className="w-full text-xs px-2 py-1.5 border-2 border-slate-300 rounded text-center font-black text-slate-900 bg-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">SKS Teori</label>
            <input
              type="number"
              min="0"
              max="6"
              value={rpsData.sksTeori}
              onChange={(e) => handleSksTeoriChange(parseInt(e.target.value) || 0)}
              className="w-full text-xs px-2 py-1.5 border-2 border-slate-300 rounded text-center font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">SKS Praktik</label>
            <input
              type="number"
              min="0"
              max="6"
              value={rpsData.sksPraktik}
              onChange={(e) => handleSksPraktikChange(parseInt(e.target.value) || 0)}
              className="w-full text-xs px-2 py-1.5 border-2 border-slate-300 rounded text-center font-bold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Semester (1-{getMaxSemestersForJenjang(rpsData.jenjang)})
            </label>
            <select
              id="semester"
              value={rpsData.semester}
              onChange={handleChange}
              className="w-full text-xs px-2 py-1.5 border-2 border-slate-300 rounded bg-white font-black text-center text-slate-900"
            >
              {Array.from(
                { length: getMaxSemestersForJenjang(rpsData.jenjang) },
                (_, i) => i + 1
              ).map((num) => (
                <option key={num} value={`Semester ${num}`}>
                  Semester {num}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Koordinator, Kaprodi, GJM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Koordinator Pengembang RPS / PJMK
            </label>
            <input
              type="text"
              id="koorMK"
              value={rpsData.koorMK}
              onChange={handleChange}
              placeholder="Contoh: Prof. Ir. Wardis Girsang, M.Si, Ph.D"
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Ketua Program Studi
            </label>
            <input
              type="text"
              id="kaprodi"
              value={rpsData.kaprodi}
              onChange={handleChange}
              placeholder="Contoh: Ir. F.P. Adam, M.Sc."
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Otorisasi GJM</label>
            <input
              type="text"
              id="wadirAkademik"
              value={rpsData.wadirAkademik}
              onChange={handleChange}
              placeholder="Contoh: Dr. Cynthia C. C. Lopulalan, S.P., M.Si."
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Revisi Ke-</label>
            <input
              type="text"
              id="revisiKe"
              value={rpsData.revisiKe}
              onChange={handleChange}
              placeholder="Contoh: 00 / 01 (OBE System)"
              className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Tim Dosen Pengampu (Team Teaching)
          </label>
          <input
            type="text"
            id="dosenPengampu"
            value={rpsData.dosenPengampu}
            onChange={handleChange}
            placeholder="Contoh: 1. Prof. Ir. Wardis Girsang, M.Si, Ph.D; 2. Dr. Ir. L.O. Kakisina, M.Si"
            className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-900"
          />
        </div>

        {/* 17 SDGs Integrator */}
        <div className="border-2 border-emerald-300 rounded-xl p-3 bg-emerald-50/50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-700" />
                Integrasi 17 SDGs Pertanian &amp; Pembangunan
              </label>
              <p className="text-[10.5px] text-emerald-800">
                Pilih tujuan SDGs yang diintegrasikan dalam materi perkuliahan
              </p>
            </div>
            <div className="flex items-center space-x-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowSdgRadar(!showSdgRadar)}
                className={`text-[10px] px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border ${
                  showSdgRadar
                    ? "bg-slate-900 text-emerald-300 border-slate-700"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-600"
                }`}
                title="Buka visualisasi Radar Chart keselarasan SDGs"
              >
                <BarChart2 className="w-3 h-3 text-emerald-300" />
                <span>{showSdgRadar ? "Tutup Radar Chart" : "Radar Chart SDGs"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRpsData((p) => ({ ...p, selectedSdgs: [1, 2, 8, 10] }));
                  showNotification("SDGs Kemiskinan (1, 2, 8, 10) terpilih!", "info");
                }}
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 px-2 py-1 rounded font-bold transition"
              >
                Default Kemiskinan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1 text-[10px]">
            {UNPATTI_SDGS_LIST.map((sdg) => {
              const checked = rpsData.selectedSdgs.includes(sdg.id);
              return (
                <label
                  key={sdg.id}
                  className={`flex items-center space-x-1.5 p-1 rounded border cursor-pointer select-none transition ${
                    checked
                      ? "bg-emerald-100 border-emerald-500 font-bold text-emerald-950 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSdg(sdg.id)}
                    className="rounded text-emerald-700 h-3.5 w-3.5 border-slate-300"
                  />
                  <span className="truncate leading-tight">
                    <strong className="font-mono text-[9px] text-emerald-800">#{sdg.id}</strong>{" "}
                    {sdg.name.split(" (")[0]}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Expandable Recharts Radar Chart for SDGs Alignment */}
          {showSdgRadar && (
            <div className="mt-3 pt-3 border-t-2 border-emerald-300">
              <SdgAlignmentRadarChart
                rpsData={rpsData}
                setRpsData={setRpsData}
                showNotification={showNotification}
              />
            </div>
          )}
        </div>

        {/* Integrasi PIP Unpatti (Pola Ilmiah Pokok: Bina Mulia Ke Lautan) */}
        <PipUnpattiIntegrator
          rpsData={rpsData}
          setRpsData={setRpsData}
          showNotification={showNotification}
        />

        {/* Penyesuaian Jenjang KKNI (Level 6 - 9) */}
        <KkniIntegrator
          rpsData={rpsData}
          setRpsData={setRpsData}
          showNotification={showNotification}
        />

        {/* Capaian Pembelajaran Lulusan (CPL Resmi Program Studi) */}
        <div className="border-2 border-slate-300 rounded-xl p-3.5 bg-slate-50 shadow-sm">
          {/* Banner Bank CPL Permanen Prodi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 text-[11px] text-emerald-950 font-bold mb-3 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>
                Bank CPL Resmi: <strong className="text-emerald-900 underline">{rpsData.namaProdi || "Program Studi"}</strong> • Tersimpan Permanen (Tidak hilang saat Reset Form &amp; Tidak tumpang tindih antar prodi)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setBulkPasteCplModalOpen(true)}
              className="text-[10.5px] bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-md font-bold flex items-center justify-center gap-1 shadow-xs transition active:scale-95 shrink-0"
              title="Ketik atau paste seluruh daftar CPL prodi sekali saja untuk disimpan permanen"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-amber-300" />
              <span>Ketik / Paste CPL Sekaligus (Simpan Bank)</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div>
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                Capaian Pembelajaran Lulusan ({activeCpls.length} CPL Terdaftar)
              </label>
              <p className="text-[11px] text-slate-600 font-medium">
                Pilih atau centang CPL program studi yang dibebankan pada mata kuliah ini
              </p>
            </div>
            <div className="flex items-center flex-wrap gap-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={cplSearch}
                  onChange={(e) => setCplSearch(e.target.value)}
                  placeholder="Cari CPL..."
                  className="text-[11px] pl-6 pr-2 py-0.5 border border-slate-300 rounded bg-white text-slate-800 w-28 sm:w-36"
                />
              </div>
              <button
                type="button"
                onClick={() => setBulkPasteCplModalOpen(true)}
                className="text-[10px] bg-gradient-to-r from-teal-700 to-emerald-800 hover:from-teal-800 hover:to-emerald-900 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-teal-600 active:scale-95"
                title="Ketik atau tempelkan seluruh rumusan CPL prodi sekali saja"
              >
                <ClipboardPaste className="w-3 h-3 text-amber-300" />
                <span>Paste Sekaligus</span>
              </button>
              <button
                type="button"
                onClick={() => openBulkImport("cpl")}
                className="text-[10px] bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-2 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-emerald-500 active:scale-95"
                title="Unggah berkas Word/Excel/JSON CPL"
              >
                <Upload className="w-3 h-3" />
                <span>Unggah CPL</span>
              </button>
              <button
                type="button"
                onClick={openAddCpl}
                className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs"
                title="Tambah CPL baru secara manual"
              >
                <Plus className="w-3 h-3" /> Tambah CPL
              </button>
              <button
                type="button"
                onClick={() =>
                  setRpsData((p) => ({
                    ...p,
                    selectedCpls: activeCpls.slice(0, 6).map((c) => c.id),
                  }))
                }
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-950 px-2 py-1 rounded font-bold transition border border-emerald-300 flex-shrink-0"
              >
                Pilih Semua
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 bg-white p-2.5 rounded-lg border-2 border-slate-200 text-xs">
            {filteredCpls.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
                <p className="text-xs font-bold text-slate-700 mb-1">
                  Belum ada CPL yang dimasukkan (Form Kosong)
                </p>
                <p className="text-[11px] text-slate-500">
                  Gunakan tombol <strong>"Unggah &amp; Ketik/Paste CPL"</strong> di atas atau klik <strong>"+ Tambah CPL"</strong> untuk menambahkan rumusan CPL prodi yang dibebankan pada mata kuliah ini.
                </p>
              </div>
            ) : (
              filteredCpls.map((item) => {
              const isChecked = rpsData.selectedCpls.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-start justify-between p-2 rounded-lg border-2 transition text-[11px] group ${
                    isChecked
                      ? "bg-emerald-50/80 border-emerald-400 text-slate-900 shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <label className="flex items-start space-x-2.5 flex-1 cursor-pointer select-none pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCpl(item.id)}
                      className="mt-0.5 rounded text-emerald-800 h-4 w-4 border-2 border-slate-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold font-mono px-1.5 rounded text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {item.id}
                        </span>
                        {item.category && (
                          <span className="text-[9px] text-slate-500 font-semibold">
                            [{item.category}]
                          </span>
                        )}
                      </div>
                      <span className="text-slate-900 font-semibold leading-tight block">
                        {item.desc}
                      </span>
                    </div>
                  </label>

                  {/* Tombol Aksi CPL (Edit & Hapus) */}
                  <div className="flex items-center space-x-1 pl-1 flex-shrink-0 opacity-90 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditCpl(item);
                      }}
                      className="p-1 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-100/70 transition"
                      title={`Edit rumusan ${item.id}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCpl(item.id);
                      }}
                      className="p-1 rounded text-rose-600 hover:text-rose-800 hover:bg-rose-100/70 transition"
                      title={`Hapus ${item.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Seksi CPMK */}
        <div className="border-2 border-slate-300 rounded-xl p-3.5 bg-slate-50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-700" />
                Capaian Pembelajaran Mata Kuliah (CPMK)
              </label>
              <p className="text-[11px] text-slate-600 font-medium">
                Rumusan kompetensi terukur mata kuliah
              </p>
            </div>
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <button
                type="button"
                onClick={() => handleSyncObeWithGemini("cpmk")}
                disabled={isSyncingWithGemini}
                className="text-[10px] bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 hover:from-blue-800 hover:to-violet-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-blue-500 active:scale-95"
                title="Rumuskan & sinkronkan CPMK terukur otomatis dengan Gemini AI berbasis CPL, SDGs, PIP, & KKNI"
              >
                {isSyncingWithGemini ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                ) : (
                  <Bot className="w-3 h-3 text-amber-300" />
                )}
                <span>Sinkronkan CPMK (Gemini AI)</span>
              </button>
              <button
                type="button"
                onClick={() => setBloomGuideOpen(true)}
                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs"
                title="Buka panduan kata kerja operasional (KKO) Bloom"
              >
                <Lightbulb className="w-3 h-3 text-amber-600" />
                <span>Panduan Bloom</span>
              </button>
              <button
                type="button"
                onClick={() => openBulkImport("cpmk")}
                className="text-[10px] bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-blue-600 active:scale-95"
                title="Unggah berkas atau ketik/paste banyak CPMK sekaligus tanpa input satu per satu"
              >
                <ClipboardPaste className="w-3 h-3 text-amber-300" />
                <span>Unggah &amp; Ketik/Paste CPMK</span>
              </button>
              <button
                type="button"
                onClick={openAddCpmk}
                className="text-[10px] bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" /> Tambah CPMK
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {rpsData.cpmkList.map((cpmk) => (
              <div
                key={cpmk.id}
                className="flex items-start justify-between bg-white p-2.5 rounded-lg border-2 border-slate-200 text-[11px] shadow-xs"
              >
                <div className="pr-2 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                      {cpmk.id}
                    </span>
                    {cpmk.cplRefs && cpmk.cplRefs.length > 0 ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[9.5px] text-slate-500 font-bold">CPL:</span>
                        {cpmk.cplRefs.map((ref) => (
                          <span
                            key={ref}
                            className="font-mono text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9.5px] text-slate-400 italic">
                        (CPL otomatis dipetakan ke Tabel Matriks)
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-slate-800 leading-snug block">{cpmk.desc}</span>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => openEditCpmk(cpmk)}
                    className="p-1 hover:bg-emerald-100 text-emerald-800 rounded transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCpmk(cpmk.id)}
                    className="p-1 hover:bg-rose-100 text-rose-700 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seksi Sub-CPMK */}
        <div className="border-2 border-slate-300 rounded-xl p-3.5 bg-slate-50 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-emerald-700" />
                Sub-CPMK &amp; Taksonomi Bloom
              </label>
              <p className="text-[11px] text-slate-600 font-medium">
                Kemampuan akhir tahapan belajar dan level taksonomi (C2-C6)
              </p>
            </div>
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <button
                type="button"
                onClick={() => handleSyncObeWithGemini("subcpmk")}
                disabled={isSyncingWithGemini}
                className="text-[10px] bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 hover:from-emerald-800 hover:to-cyan-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-emerald-500 active:scale-95"
                title="Rumuskan & selaraskan Sub-CPMK bertaksonomi Bloom (C2-C6) otomatis dengan Gemini AI"
              >
                {isSyncingWithGemini ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                ) : (
                  <Bot className="w-3 h-3 text-amber-300" />
                )}
                <span>Sinkronkan Sub-CPMK (Gemini AI)</span>
              </button>
              <button
                type="button"
                onClick={() => setBloomGuideOpen(true)}
                className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs"
                title="Buka panduan kata kerja operasional (KKO) Bloom"
              >
                <Lightbulb className="w-3 h-3 text-amber-600" />
                <span>Panduan Bloom</span>
              </button>
              <button
                type="button"
                onClick={() => openBulkImport("subcpmk")}
                className="text-[10px] bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-emerald-500 active:scale-95"
                title="Unggah berkas atau ketik/paste banyak Sub-CPMK sekaligus tanpa input satu per satu"
              >
                <ClipboardPaste className="w-3 h-3 text-amber-300" />
                <span>Unggah &amp; Ketik/Paste Sub-CPMK</span>
              </button>
              <button
                type="button"
                onClick={openAddSubCpmk}
                className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" /> Tambah Sub-CPMK
              </button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {rpsData.subCpmkList.map((sub) => (
              <div
                key={sub.id}
                className="flex items-start justify-between bg-white p-2.5 rounded-lg border-2 border-slate-200 text-[11px] shadow-xs"
              >
                <div className="pr-2 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-[10px] bg-emerald-100 text-emerald-900 px-1.5 rounded border border-emerald-200">
                      {sub.id}
                    </span>
                    <span className="font-mono text-[9px] bg-blue-100 text-blue-900 px-1.5 rounded border border-blue-200 font-semibold">
                      {sub.cpmkRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBloomGuideOpen(true)}
                      title="Klik untuk melihat panduan taksonomi Bloom & kata kerja operasional (KKO)"
                      className="font-semibold text-[9px] bg-amber-100 hover:bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{sub.bloom}</span>
                      <Lightbulb className="w-2.5 h-2.5 text-amber-600" />
                    </button>
                  </div>
                  <p className="font-medium text-slate-800 leading-snug">{sub.desc}</p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => openEditSubCpmk(sub)}
                    className="p-1 hover:bg-emerald-100 text-emerald-800 rounded transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubCpmk(sub.id)}
                    className="p-1 hover:bg-rose-100 text-rose-700 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deskripsi Singkat MK */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Deskripsi Singkat Mata Kuliah
          </label>
          <textarea
            id="deskripsiMK"
            rows={5}
            value={rpsData.deskripsiMK}
            onChange={handleChange}
            className="w-full text-xs p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none font-semibold text-slate-900 leading-relaxed bg-white"
          />
        </div>

        {/* Bahan Kajian */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Bahan Kajian / Pokok Bahasan Pembelajaran
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSyncObeWithGemini("bahankajian")}
                disabled={isSyncingWithGemini}
                className="text-[10px] bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white px-2.5 py-1 rounded font-bold transition flex items-center gap-1 shadow-xs border border-amber-500 active:scale-95"
                title="Rumuskan pokok bahasan / bahan kajian perkuliahan secara otomatis dengan Gemini AI selaras Sub-CPMK, SDGs, dan PIP Laut Pulau"
              >
                {isSyncingWithGemini ? (
                  <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                ) : (
                  <Bot className="w-3 h-3 text-amber-300" />
                )}
                <span>Rumuskan Bahan Kajian (Gemini AI)</span>
              </button>
              <span className="text-[10.5px] text-amber-700 font-bold hidden md:inline">
                💡 Cek Kesenjangan Riset di tab &apos;API Hub&apos;
              </span>
            </div>
          </div>
          <textarea
            id="bahanKajian"
            rows={4}
            value={rpsData.bahanKajian}
            onChange={handleChange}
            placeholder="1. Landasan Filosofis & Teoretis..."
            className="w-full text-xs p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none font-semibold text-slate-900 leading-relaxed bg-white"
          />
        </div>

        {/* Daftar Pustaka / Referensi */}
        <div className="bg-white p-3.5 rounded-xl border-2 border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <div>
              <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Daftar Pustaka &amp; Referensi Acuan (Format APA 7th Edition)
              </label>
              <p className="text-[10.5px] text-slate-500">
                Pustaka Utama dan Pendukung sesuai kurikulum OBE Universitas Pattimura
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRefLibraryOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 active:scale-95"
                title="Buka Database Pustaka Lokal & Pencarian Pustaka Eksternal Online (CrossRef/OpenAlex)"
              >
                <Database className="w-3.5 h-3.5 text-amber-300" />
                <span>Pilih dari Database Pustaka (Lokal &amp; Online)</span>
              </button>
            </div>
          </div>

          <textarea
            id="daftarPustaka"
            rows={6}
            value={rpsData.daftarPustaka}
            onChange={handleChange}
            placeholder={`A. Pustaka Utama:\n   1. Sugiyono. (2022). Metode Penelitian Kuantitatif, Kualitatif, dan R&D. Alfabeta.\n\nB. Pustaka Pendukung:\n   1. Chambers, R. (1983). Rural Development: Putting the Last First. Routledge.`}
            className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none font-serif text-slate-900 leading-relaxed bg-white"
          />
        </div>

        {/* Sistem Penilaian Pasal 47 Peraturan Rektor UNPATTI No. 12 Tahun 2026 */}
        <div className="border-2 border-emerald-400/80 rounded-xl p-3.5 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-amber-50/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>Sistem Penilaian &amp; Pembobotan (Pasal 47 Peraturan Rektor Universitas Pattimura No. 12 Tahun 2026)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPasal47ModalOpen(true)}
                  className="text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2 py-0.5 rounded shadow-xs inline-flex items-center gap-1 transition"
                  title="Lihat teks resmi dan tabel skala nilai mutu Pasal 47 Peraturan Rektor No. 12/2026"
                >
                  <FileText className="w-3 h-3 text-amber-300" />
                  <span>Rujukan Resmi Pasal 47</span>
                </button>
              </div>
              <p className="text-[10.5px] text-emerald-900 mt-0.5">
                Amanat Pasal 47 Ayat 3: <strong>Partisipatif &amp; Hasil Proyek &ge; 50%</strong> (Ayat 3a), sedangkan{" "}
                <strong>Tugas/Kuis/UTS/UAS &le; 50%</strong> (Ayat 3b). Total bobot = <strong>100%</strong>.
              </p>
            </div>
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded border self-start sm:self-center shadow-xs ${
                isWeightsValid
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-rose-100 text-rose-900 border-rose-300"
              }`}
            >
              {isWeightsValid ? "Valid: 100% (Sesuai Pasal 47)" : `Total: ${totalWeights}% (Tidak Sesuai)`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-emerald-200 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-700">Aktivitas Partisipatif</label>
              <input
                type="number"
                min="0"
                max="50"
                value={rpsData.assessmentWeights.partisipatif}
                onChange={(e) => handleWeightChange("partisipatif", parseInt(e.target.value) || 0)}
                className="w-full text-center font-black text-emerald-900 border border-slate-300 rounded py-1 mt-1 text-xs"
              />
              <span className="text-[9px] text-slate-500">Case Method (0-50%)</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-emerald-200 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-700">Hasil Proyek</label>
              <input
                type="number"
                min="0"
                max="60"
                value={rpsData.assessmentWeights.proyek}
                onChange={(e) => handleWeightChange("proyek", parseInt(e.target.value) || 0)}
                className="w-full text-center font-black text-emerald-900 border border-slate-300 rounded py-1 mt-1 text-xs"
              />
              <span className="text-[9px] text-slate-500">Team-Based Project (0-50%)</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-700">Tugas Terstruktur</label>
              <input
                type="number"
                min="0"
                max="50"
                value={rpsData.assessmentWeights.tugas}
                onChange={(e) => handleWeightChange("tugas", parseInt(e.target.value) || 0)}
                className="w-full text-center font-semibold text-slate-900 border border-slate-300 rounded py-1 mt-1 text-xs"
              />
              <span className="text-[9px] text-slate-500">Tugas Mandiri (0-50%)</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-700">Kuis (Formatif)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={rpsData.assessmentWeights.kuis}
                onChange={(e) => handleWeightChange("kuis", parseInt(e.target.value) || 0)}
                className="w-full text-center font-semibold text-slate-900 border border-slate-300 rounded py-1 mt-1 text-xs"
              />
              <span className="text-[9px] text-slate-500">Kuis Formatif (0-50%)</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-700">UTS</label>
              <input
                type="number"
                min="0"
                max="50"
                value={rpsData.assessmentWeights.uts}
                onChange={(e) => handleWeightChange("uts", parseInt(e.target.value) || 0)}
                className="w-full text-center font-semibold text-slate-900 border border-slate-300 rounded py-1 mt-1 text-xs"
              />
              <span className="text-[9px] text-slate-500">Ujian Tengah (0-50%)</span>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
              <label className="block text-[10px] font-bold text-slate-700">UAS</label>
              <input
                type="number"
                min="0"
                max="50"
                value={rpsData.assessmentWeights.uas}
                onChange={(e) => handleWeightChange("uas", parseInt(e.target.value) || 0)}
                className="w-full text-center font-semibold text-slate-900 border border-slate-300 rounded py-1 mt-1 text-xs"
              />
              <span className="text-[9px] text-slate-500">Ujian Akhir (0-50%)</span>
            </div>
          </div>

          <div className="mt-2 text-[10px] flex items-center justify-between text-slate-700 font-medium bg-white p-1.5 rounded border border-emerald-200">
            <div>
              Pasal 47 Ayat (3a) Partisipatif &amp; Proyek: <strong className="text-emerald-700">{groupA}%</strong>{" "}
              (Syarat &ge; 50%)
            </div>
            <div>
              Pasal 47 Ayat (3b) Tugas/Kuis/UTS/UAS: <strong className="text-blue-700">{groupB}%</strong> (Syarat &le;
              50%)
            </div>
          </div>
        </div>

        {/* Rubrik Penilaian OBE (Assessment Rubrics for Course Objectives) */}
        <AssessmentRubricBuilder
          rpsData={rpsData}
          setRpsData={setRpsData}
          showNotification={showNotification}
          onSyncGemini={() => handleSyncObeWithGemini("rubrik")}
          isSyncing={isSyncingWithGemini}
        />
      </form>

      {/* Action Footer (responsif iPhone & Android di atas bottom nav) */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 mb-14 md:mb-0 border-t-2 border-slate-200 bg-white flex items-center space-x-2 sm:space-x-2.5 shadow-lg flex-shrink-0">
        <label
          className={`py-3 px-3.5 rounded-xl font-bold text-xs shadow-sm border transition flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer ${
            isUploading
              ? "bg-slate-200 text-slate-500 border-slate-300 pointer-events-none opacity-80"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 hover:border-emerald-400 active:scale-95"
          }`}
          title="Unggah berkas RPS sebelumnya (.json, .docx, .xlsx, .pdf, .txt) untuk menggantikan seluruh data form secara instan"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
          ) : (
            <Upload className="w-4 h-4 text-emerald-700" />
          )}
          <span className="hidden sm:inline">
            {isUploading ? "Memproses..." : "Unggah RPS Sebelumnya (.json/.docx/.xlsx/.pdf)"}
          </span>
          <input
            type="file"
            accept=".json,.docx,.xlsx,.xls,.pdf,.txt,.doc"
            className="hidden"
            disabled={isUploading}
            onChange={handleFileUpload}
          />
        </label>

        {/* Tombol Sinkronisasi AI Gemini di Sisi Kiri Tombol Reset Form */}
        <button
          type="button"
          onClick={() => handleSyncObeWithGemini("all")}
          disabled={isSyncingWithGemini}
          title="Dosen cukup mengisi Identitas MK, mencentang SDGs, PIP, Level KKNI, mengisi CPL dan deskripsi MK, maka Gemini Chat membantu merumuskan/mengisi dan mensinkron CPMK, Sub-CPMK, Bahan Kajian, dan Rubrik Penilaian secara otomatis"
          className={`py-3 px-3 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 shrink-0 border ${
            isSyncingWithGemini
              ? "bg-indigo-200 text-indigo-900 border-indigo-300 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white border-indigo-400 shadow-indigo-900/20"
          }`}
        >
          {isSyncingWithGemini ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
          ) : (
            <Bot className="w-4 h-4 text-amber-300 animate-pulse" />
          )}
          <span className="flex items-center gap-1">
            <span>Sinkronisasi AI Gemini</span>
            <span className="hidden lg:inline text-[9.5px] bg-indigo-950/40 text-amber-300 px-1.5 py-0.5 rounded font-black border border-indigo-300/40">
              OBE
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onReset}
          title="Reset semua isian formulir menjadi kosong bersih (Daftar CPL Prodi tetap aman tersimpan & tidak terhapus)"
          className="py-3 px-3.5 sm:px-4 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 hover:border-rose-400 text-rose-700 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs shrink-0 active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <span>Reset Form</span>
        </button>

        <button
          type="button"
          onClick={onGenerate}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 hover:from-emerald-800 hover:to-slate-950 text-white rounded-xl font-extrabold text-sm shadow-md shadow-emerald-950/30 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate &amp; Tampilkan RPS</span>
        </button>
      </div>

      {/* MODAL: CPMK */}
      {cpmkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-300 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-3 shrink-0">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>{cpmkModalMode === "add" ? "Tambah CPMK Baru" : `Edit ${cpmkEditId}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCpmkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode CPMK</label>
                  <input
                    type="text"
                    value={cpmkInputId}
                    onChange={(e) => setCpmkInputId(e.target.value)}
                    placeholder="Contoh: CPMK 1"
                    className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Pemetaan CPL</label>
                  <div className="text-xs py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-semibold flex items-center justify-between">
                    <span>Terpilih: <strong>{cpmkInputCplRefs.length} CPL</strong></span>
                    <span className="text-[10px] text-emerald-700">Tercatat di Tabel III RPS</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Rumusan CPMK
                </label>
                <textarea
                  rows={3}
                  value={cpmkInputDesc}
                  onChange={(e) => setCpmkInputDesc(e.target.value)}
                  placeholder="Tuliskan capaian pembelajaran mata kuliah secara spesifik dan terukur..."
                  className="w-full text-xs p-2.5 border-2 border-slate-300 rounded-lg font-medium text-slate-900 leading-relaxed"
                />
              </div>

              {/* Fitur Kode CPL yang Dibebankan (Gambar 2 User Request) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Kode CPL yang Dibebankan pada {cpmkInputId || "CPMK ini"}
                    </label>
                    <span className="text-[10px] text-slate-500">
                      Centang CPL yang didukung oleh capaian mata kuliah ini
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const allIds = (rpsData.cplList || []).map((c) => c.id);
                        setCpmkInputCplRefs(allIds);
                      }}
                      className="text-[10.5px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold transition"
                    >
                      Pilih Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setCpmkInputCplRefs([])}
                      className="text-[10.5px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-bold transition"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-xl border-2 border-slate-200">
                  {rpsData.cplList && rpsData.cplList.length > 0 ? (
                    rpsData.cplList.map((cpl) => {
                      const isChecked = cpmkInputCplRefs.includes(cpl.id);
                      return (
                        <label
                          key={cpl.id}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                            isChecked
                              ? "bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCpmkInputCplRefs((prev) => [...prev, cpl.id]);
                              } else {
                                setCpmkInputCplRefs((prev) => prev.filter((id) => id !== cpl.id));
                              }
                            }}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-[10.5px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded border border-emerald-300">
                                {cpl.id}
                              </span>
                              {cpl.category && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                                  {cpl.category}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-700 line-clamp-2 mt-0.5 leading-snug">
                              {cpl.desc}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500">
                      Belum ada CPL di Bank CPL. Silakan tambah CPL terlebih dahulu di bagian Capaian Pembelajaran Lulusan.
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 italic">
                  * CPL yang dicentang akan otomatis memunculkan tanda centang (✓) pada <strong>Tabel III: Matriks Korelasi CPL terhadap CPMK &amp; Bobot Penilaian (Total 100%)</strong> di dokumen RPS.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setCpmkModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveCpmk}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-950 rounded-lg shadow-sm transition"
              >
                Simpan CPMK &amp; Pemetaan CPL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Sub-CPMK */}
      {subModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">
                {subModalMode === "add" ? "Tambah Sub-CPMK Baru" : `Edit ${subEditId}`}
              </h3>
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Sub-CPMK
                  </label>
                  <input
                    type="text"
                    value={subInputId}
                    onChange={(e) => setSubInputId(e.target.value)}
                    placeholder="Sub-CPMK 1"
                    className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merujuk ke CPMK
                  </label>
                  <select
                    value={subInputRef}
                    onChange={(e) => setSubInputRef(e.target.value)}
                    className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    {rpsData.cpmkList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Level Taksonomi Bloom
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Jenjang {rpsData.jenjang || "S1"}
                  </span>
                </div>
                <select
                  value={subInputBloom}
                  onChange={(e) => setSubInputBloom(e.target.value)}
                  className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-amber-900 bg-amber-50"
                >
                  {rpsData.jenjang === "S1" ? (
                    <>
                      <option value="C1-Mengingat">C1 - Mengingat (Remember)</option>
                      <option value="C2-Pemahaman">C2 - Pemahaman (Understand)</option>
                      <option value="C3-Penerapan">C3 - Penerapan (Apply)</option>
                      <option value="C4-Analisis">C4 - Analisis (Analyze)</option>
                    </>
                  ) : rpsData.jenjang === "S2" || rpsData.jenjang === "Spesialis" ? (
                    <>
                      <option value="C4-Analisis">C4 - Analisis (Analyze)</option>
                      <option value="C5-Evaluasi">C5 - Evaluasi (Evaluate)</option>
                      <option value="C6-Kreasi">C6 - Kreasi (Create)</option>
                    </>
                  ) : rpsData.jenjang === "S3" ? (
                    <>
                      <option value="C5-Evaluasi">C5 - Evaluasi (Evaluate)</option>
                      <option value="C6-Kreasi">C6 - Kreasi (Create)</option>
                    </>
                  ) : rpsData.jenjang === "Profesi" ? (
                    <>
                      <option value="C3-Penerapan">C3 - Penerapan (Apply)</option>
                      <option value="C4-Analisis">C4 - Analisis (Analyze)</option>
                      <option value="C5-Evaluasi">C5 - Evaluasi (Evaluate)</option>
                    </>
                  ) : (
                    <>
                      <option value="C1-Mengingat">C1 - Mengingat (Remember)</option>
                      <option value="C2-Pemahaman">C2 - Pemahaman (Understand)</option>
                      <option value="C3-Penerapan">C3 - Penerapan (Apply)</option>
                      <option value="C4-Analisis">C4 - Analisis (Analyze)</option>
                      <option value="C5-Evaluasi">C5 - Evaluasi (Evaluate)</option>
                      <option value="C6-Kreasi">C6 - Kreasi (Create)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Uraian Kemampuan Akhir (Sub-CPMK)
                  </label>
                  <button
                    type="button"
                    onClick={() => setBloomGuideOpen(true)}
                    className="text-[10px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded transition shadow-xs"
                    title="Pilih kata kerja operasional terukur dari panduan Taksonomi Bloom"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                    <span>Pilih KKO Bloom</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={subInputDesc}
                  onChange={(e) => setSubInputDesc(e.target.value)}
                  placeholder="Tuliskan kemampuan akhir tahapan belajar (misal: Mahasiswa mampu menganalisis...)"
                  className="w-full text-xs p-2.5 border-2 border-slate-300 rounded-lg font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSubModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveSubCpmk}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-950 rounded-lg shadow"
              >
                Simpan Sub-CPMK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CPL Program Studi */}
      {cplModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                <span>{cplModalMode === "add" ? "Tambah CPL Program Studi Baru" : `Edit CPL ${cplEditId}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCplModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode / ID CPL</label>
                <input
                  type="text"
                  value={cplInputId}
                  onChange={(e) => setCplInputId(e.target.value)}
                  placeholder="Contoh: CPL1, CPL14, CPL-01"
                  className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori CPL</label>
                <select
                  value={cplInputCategory}
                  onChange={(e: any) => setCplInputCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border-2 border-slate-300 rounded-lg font-bold text-slate-800 bg-white"
                >
                  <option value="Sikap">Sikap</option>
                  <option value="Keterampilan Umum">Keterampilan Umum</option>
                  <option value="Keterampilan Khusus">Keterampilan Khusus</option>
                  <option value="Penguasaan Pengetahuan">Penguasaan Pengetahuan</option>
                  <option value="Integrasi (S, P, K)">Integrasi (S, P, K)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uraian Capaian Pembelajaran Lulusan (CPL)
                </label>
                <textarea
                  rows={4}
                  value={cplInputDesc}
                  onChange={(e) => setCplInputDesc(e.target.value)}
                  placeholder="Rumuskan pernyataan capaian pembelajaran lulusan prodi secara terukur..."
                  className="w-full text-xs p-2.5 border-2 border-slate-300 rounded-lg font-medium text-slate-900 leading-relaxed"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setCplModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveCpl}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-950 rounded-lg shadow"
              >
                Simpan CPL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bloom's Taxonomy Action Verbs Guide Panel */}
      <BloomTaxonomyGuide
        isOpen={bloomGuideOpen}
        onClose={() => setBloomGuideOpen(false)}
        onSelectVerb={handleSelectBloomVerb}
        jenjang={rpsData.jenjang || "S1"}
      />

      {/* MODAL: Unggah & Ketik / Paste Massal (CPL, CPMK, Sub-CPMK) */}
      <BulkImportModal
        isOpen={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        type={bulkImportType}
        title={
          bulkImportType === "cpl"
            ? "CPL Program Studi"
            : bulkImportType === "cpmk"
            ? "CPMK"
            : "Sub-CPMK & Bloom"
        }
        defaultCpmkRef={rpsData.cpmkList[0]?.id || "CPMK 1"}
        existingCount={
          bulkImportType === "cpl"
            ? (rpsData.cplList?.length || 0)
            : bulkImportType === "cpmk"
            ? (rpsData.cpmkList?.length || 0)
            : (rpsData.subCpmkList?.length || 0)
        }
        availableCpmkList={rpsData.cpmkList || []}
        onImport={handleBulkImportSubmit}
        showNotification={showNotification}
      />

      {/* MODAL DATABASE PUSTAKA LOKAL & ONLINE (CrossRef / OpenAlex) */}
      <ReferenceLibraryModal
        isOpen={refLibraryOpen}
        onClose={() => setRefLibraryOpen(false)}
        currentCourseName={rpsData.namaMK}
        onInsertToRps={handleInsertReferences}
        showNotification={showNotification}
      />

      {/* MODAL: Ketik / Paste CPL Sekaligus untuk Bank CPL Prodi (Tersimpan Permanen) */}
      {bulkPasteCplModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Bank CPL Resmi: {rpsData.namaProdi || "Program Studi"}
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Ketik atau tempelkan (paste) seluruh CPL sekaligus. Tersimpan permanen &amp; aman dari Reset Form.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkPasteCplModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-emerald-950 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Cukup Diketik atau Dipaste Sekali Saja:</span>
                </div>
                <p>
                  Sistem otomatis mengenali format nomor CPL (misal: <em>&quot;CPL 1 - Deskripsi...&quot;</em> atau <em>&quot;1. Mampu...&quot;</em> atau copy-paste tabel dari Excel/Word/PDF).
                </p>
                <p className="text-[10.5px] text-emerald-800">
                  Data langsung disimpan permanen di perangkat Anda khusus untuk <strong>{rpsData.namaProdi || "Prodi Ini"}</strong> sehingga dosen lain tidak saling tumpang tindih dan CPL <strong>TIDAK AKAN HILANG</strong> saat tombol Reset Form diklik!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tempelkan (Paste) atau Ketik Teks Daftar CPL Prodi:
                </label>
                <textarea
                  rows={8}
                  value={rawBulkCplText}
                  onChange={(e) => setRawBulkCplText(e.target.value)}
                  placeholder={`Contoh Format (Teks Bebas / Tabel / Nomor):\nCPL 1: Mampu mengimplementasikan perilaku hidup yang mencerminkan ketakwaan kepada Tuhan YME...\nCPL 2: Mampu bekerja sama dan menunjukkan kepekaan sosial...\nCPL 3: Mampu menguasai dan mengaplikasikan sistem pertanian kepulauan...\n4. Mampu menerapkan pemikiran logis, kritis, dan sistematis...`}
                  className="w-full text-xs p-3 border-2 border-slate-300 rounded-xl font-mono text-slate-900 leading-relaxed outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 text-[11px]">Opsi Penyimpanan:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="bulkPasteMode"
                    value="replace"
                    checked={bulkPasteMode === "replace"}
                    onChange={() => setBulkPasteMode("replace")}
                    className="text-emerald-700"
                  />
                  <span>Ganti / Timpa Daftar CPL Saat Ini ({activeCpls.length} CPL)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-800">
                  <input
                    type="radio"
                    name="bulkPasteMode"
                    value="append"
                    checked={bulkPasteMode === "append"}
                    onChange={() => setBulkPasteMode("append")}
                    className="text-emerald-700"
                  />
                  <span>Tambahkan ke Daftar CPL yang Ada</span>
                </label>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setBulkPasteCplModalOpen(false)}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkPasteCplToBank}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Simpan Permanen ke Bank CPL Prodi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY LOADING SAAT SINKRONISASI DENGAN GEMINI AI */}
      {isSyncingWithGemini && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-indigo-300 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Bot className="w-9 h-9 text-amber-300 animate-bounce" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Gemini AI OBE Sync Assistant
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Menyinkronkan kurikulum OBE untuk mata kuliah:
              </p>
              <p className="text-xs font-extrabold text-indigo-700 mt-0.5">
                &ldquo;{rpsData.namaMK || "Mata Kuliah"}&rdquo;
              </p>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-700 flex-shrink-0" />
              <span className="font-semibold text-left leading-snug">
                {syncProgressMsg || "Merumuskan CPMK, Sub-CPMK, Bahan Kajian, dan Rubrik Penilaian..."}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 text-left space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Komponen yang diselaraskan secara otomatis:</span>
              </div>
              <ul className="list-disc list-inside text-[10.5px] text-slate-600 space-y-0.5 pl-1">
                <li>Capaian Pembelajaran Mata Kuliah (CPMK)</li>
                <li>Sub-CPMK dengan Taksonomi Bloom (C2-C6)</li>
                <li>Bahan Kajian &amp; Pokok Bahasan Terstruktur</li>
                <li>Rubrik Penilaian Holistik &amp; Analitik (Pasal 47 Peraturan Rektor No. 12/2026)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HASIL SINKRONISASI GEMINI AI */}
      {syncResultModalOpen && syncSummary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Sinkronisasi Kurikulum OBE Berhasil!
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Didukung Asisten Kurikulum Gemini AI Universitas Pattimura
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncResultModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-emerald-950 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Komponen Berhasil Dirumuskan &amp; Diisi ke Form:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-bold block">CPMK Terumuskan</span>
                    <strong className="text-sm text-blue-900">{syncSummary.cpmkCount} CPMK</strong>
                    <span className="text-[9.5px] text-slate-500 block">Selaras CPL &amp; SDGs</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Sub-CPMK &amp; Bloom</span>
                    <strong className="text-sm text-emerald-900">{syncSummary.subCpmkCount} Tahapan</strong>
                    <span className="text-[9.5px] text-slate-500 block">Gradasi C2 s.d. C6</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Bahan Kajian</span>
                    <strong className="text-sm text-amber-900">8 - 10 Pokok Bahasan</strong>
                    <span className="text-[9.5px] text-slate-500 block">PIP Bina Mulia Kelautan</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Rubrik Penilaian OBE</span>
                    <strong className="text-sm text-purple-900">{syncSummary.rubricsCount} Rubrik Lengkap</strong>
                    <span className="text-[9.5px] text-slate-500 block">Kriteria &amp; Pasal 47</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-950 flex items-start gap-2">
                <Bot className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Tinggal Disesuaikan dan Diedit:</strong> Seluruh isian di atas telah terpasang rapi pada formulir. Bapak/Ibu Dosen dapat dengan mudah menyesuaikan redaksi kata kerja operasional, menambah pokok bahasan, atau merevisi bobot sesuai kebutuhan spesifik kelas Anda.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setSyncResultModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Tinjau &amp; Sesuaikan di Formulir</span>
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SALINAN RESMI PERATURAN REKTOR UNIVERSITAS PATTIMURA NOMOR 12 TAHUN 2026 PASAL 47 */}
      {pasal47ModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden text-left">
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-5 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-300 font-bold block">
                    Regulasi Akademik Resmi UNPATTI
                  </span>
                  <h3 className="text-sm font-extrabold leading-tight">
                    PERATURAN REKTOR UNIVERSITAS PATTIMURA NOMOR 12 TAHUN 2026
                  </h3>
                  <p className="text-[11px] text-emerald-200 font-medium">
                    Tentang Peraturan Akademik Universitas Pattimura &bull; Pasal 47
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasal47ModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span>Pasal 47: Penilaian Hasil Belajar Mahasiswa &amp; Pembobotan</span>
                </div>
                <div className="space-y-2 text-[11.5px] text-slate-800 pl-1">
                  <p>
                    <strong>(1)</strong> Penilaian hasil belajar mahasiswa dilakukan secara periodik, terencana, terpadu, objektif, dan transparan untuk mengukur pemenuhan Capaian Pembelajaran Lulusan (CPL) yang dibebankan pada mata kuliah melalui Capaian Pembelajaran Mata Kuliah (CPMK) dan Sub-CPMK.
                  </p>
                  <p>
                    <strong>(2)</strong> Penilaian hasil belajar dilakukan dengan teknik observasi, partisipasi aktif, unjuk kerja (performance), tes tertulis (kuis, UTS, UAS), tes lisan, dan/atau penilaian proyek/portofolio dengan instrumen berupa rubrik penilaian analitik atau holistik.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-300 space-y-1.5 shadow-xs">
                    <strong className="text-emerald-950 font-bold block">
                      (3) Ketentuan Komposisi Pembobotan Penilaian Mata Kuliah:
                    </strong>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-slate-800 font-medium">
                      <li>
                        <strong>Huruf a:</strong> Pembelajaran dengan metode pemecahan kasus (<em>Case Method</em>) berupa aktivitas partisipatif dan/atau pembelajaran berbasis proyek kelompok (<em>Team-based Project</em>) berupa hasil proyek diberikan bobot <strong>paling sedikit 50% (&ge; 50%)</strong>.
                      </li>
                      <li>
                        <strong>Huruf b:</strong> Tugas terstruktur, kuis formatif, Ujian Tengah Semester (UTS), dan Ujian Akhir Semester (UAS) diberikan bobot <strong>paling banyak 50% (&le; 50%)</strong>.
                      </li>
                      <li>
                        <strong>Huruf c:</strong> Total bobot keseluruhan penilaian mata kuliah adalah tepat <strong>100%</strong>.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tabel Skala Nilai Mutu Sarjana & Diploma - Ayat 4 */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-900 text-[11px] border-b border-slate-300 flex items-center justify-between">
                  <span>Pasal 47 Ayat (4): Skala Nilai Mutu Diploma, Sarjana (S1), Sarjana Terapan, dan Profesi</span>
                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">Jenjang S1 / D4 / Profesi</span>
                </div>
                <table className="w-full text-center text-[11px]">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-left">Rentang Nilai</th>
                      <th className="py-2 px-3">Nilai Huruf</th>
                      <th className="py-2 px-3">Nilai Angka</th>
                      <th className="py-2 px-3 text-right">Kategori Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-emerald-50/50">
                      <td className="py-2 px-3 text-left font-semibold">85 &ndash; 100</td>
                      <td className="py-2 px-3 font-black text-emerald-700">A</td>
                      <td className="py-2 px-3 font-bold">4,00</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">Sangat Baik (Lulus)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-semibold">70 &ndash; 84,99</td>
                      <td className="py-2 px-3 font-black text-blue-700">B</td>
                      <td className="py-2 px-3 font-bold">3,00</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">Baik (Lulus)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-semibold">55 &ndash; 69,99</td>
                      <td className="py-2 px-3 font-black text-amber-700">C</td>
                      <td className="py-2 px-3 font-bold">2,00</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">Cukup (Lulus)</td>
                    </tr>
                    <tr className="bg-rose-50/40">
                      <td className="py-2 px-3 text-left font-semibold">40 &ndash; 54,99</td>
                      <td className="py-2 px-3 font-black text-rose-600">D</td>
                      <td className="py-2 px-3 font-bold">1,00</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">Kurang (Belum Lulus)</td>
                    </tr>
                    <tr className="bg-rose-100/50">
                      <td className="py-2 px-3 text-left font-semibold">0 &ndash; 39,99</td>
                      <td className="py-2 px-3 font-black text-red-700">E</td>
                      <td className="py-2 px-3 font-bold">0,00</td>
                      <td className="py-2 px-3 text-right font-bold text-red-700">Gagal (Tidak Lulus)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabel Skala Nilai Mutu Pascasarjana - Ayat 5 */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-900 text-[11px] border-b border-slate-300 flex items-center justify-between">
                  <span>Pasal 47 Ayat (5): Skala Nilai Mutu Jenjang Magister (S2), Doktor (S3), dan Spesialis</span>
                  <span className="text-[10px] text-purple-800 font-extrabold bg-purple-100 px-2 py-0.5 rounded">Pascasarjana S2 / S3</span>
                </div>
                <table className="w-full text-center text-[11px]">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 text-left">Rentang Nilai</th>
                      <th className="py-2 px-3">Nilai Huruf</th>
                      <th className="py-2 px-3">Nilai Angka</th>
                      <th className="py-2 px-3 text-right">Kategori Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-emerald-50/50">
                      <td className="py-2 px-3 text-left font-semibold">&ge; 90</td>
                      <td className="py-2 px-3 font-black text-emerald-700">A</td>
                      <td className="py-2 px-3 font-bold">4,00</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">Sangat Baik (Lulus)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-semibold">85 &ndash; 89,99</td>
                      <td className="py-2 px-3 font-black text-emerald-600">A-</td>
                      <td className="py-2 px-3 font-bold">3,70</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600">Sangat Baik (Lulus)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-semibold">80 &ndash; 84,99</td>
                      <td className="py-2 px-3 font-black text-blue-700">B+</td>
                      <td className="py-2 px-3 font-bold">3,30</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-700">Baik (Lulus)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-semibold">70 &ndash; 79,99</td>
                      <td className="py-2 px-3 font-black text-blue-600">B</td>
                      <td className="py-2 px-3 font-bold">3,00</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-600">Baik (Lulus)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-semibold">65 &ndash; 69,99</td>
                      <td className="py-2 px-3 font-black text-blue-500">B-</td>
                      <td className="py-2 px-3 font-bold">2,70</td>
                      <td className="py-2 px-3 text-right font-bold text-blue-500">Baik (Lulus)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-left font-semibold">55 &ndash; 64,99</td>
                      <td className="py-2 px-3 font-black text-amber-700">C</td>
                      <td className="py-2 px-3 font-bold">2,00</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">Cukup</td>
                    </tr>
                    <tr className="bg-rose-100/50">
                      <td className="py-2 px-3 text-left font-semibold">&lt; 55</td>
                      <td className="py-2 px-3 font-black text-red-700">E</td>
                      <td className="py-2 px-3 font-bold">0,00</td>
                      <td className="py-2 px-3 text-right font-bold text-red-700">Gagal (Tidak Lulus)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setRpsData((prev) => ({
                    ...prev,
                    assessmentWeights: {
                      partisipatif: 20,
                      proyek: 30,
                      tugas: 20,
                      kuis: 10,
                      uts: 10,
                      uas: 10,
                    },
                  }));
                  showNotification("Bobot otomatis Pasal 47 diterapkan (50% Case/PjBL, 50% Tugas/Ujian)!", "success");
                  setPasal47ModalOpen(false);
                }}
                className="px-3.5 py-2 text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl transition"
              >
                Terapkan Contoh Bobot Standar (50:50)
              </button>
              <button
                type="button"
                onClick={() => setPasal47ModalOpen(false)}
                className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
