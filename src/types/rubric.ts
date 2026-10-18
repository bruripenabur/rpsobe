export interface RubricLevel {
  label: "Sangat Baik" | "Baik" | "Cukup" | "Kurang";
  gradeRange: string; // e.g. "85 - 100 (A)"
  descriptor: string;
}

export interface RubricCriterion {
  id: string;
  name: string; // e.g. "Kedalaman Konseptual & Teori", "Analisis & Pemecahan Masalah Kepulauan"
  indicator: string; // e.g. "Mampu menganalisis akar masalah kemiskinan multidimensional"
  weightPercent: number; // e.g. 25%
  levels: {
    sangatBaik: string; // 85-100 (A)
    baik: string;       // 70-84.99 (B)
    cukup: string;      // 55-69.99 (C)
    kurang: string;     // < 55 (D/E)
  };
}

export interface CourseObjectiveRubric {
  id: string; // unique ID
  objectiveType: "CPMK" | "Sub-CPMK";
  objectiveRef: string; // e.g. "CPMK 1" or "Sub-CPMK 2"
  objectiveTitle: string; // desc of CPMK or Sub-CPMK
  assessmentMethod: string; // e.g. "Hasil Proyek / Studi Kasus", "Aktivitas Partisipatif", "Tugas Analisis", "Presentasi Digital"
  targetBloomLevel?: string; // e.g. "C4-Analisis"
  criteria: RubricCriterion[];
}
