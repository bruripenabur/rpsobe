import React, { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info,
  Layers,
  Search,
  Filter,
  ArrowRight,
  Download,
  Copy,
  Printer,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
} from "lucide-react";

export interface SemesterWorkloadRecord {
  semId: string; // e.g. "2024-1"
  tahunAkademik: string; // "2024/2025"
  semesterTipe: "Ganjil" | "Genap";
  semLabel: string; // "2024/2025 Ganjil"
  sks: number; // Beban SKS setelah pembagian team teaching
  totalSksSebelumBagi: number;
  jumlahMk: number;
  jumlahTeamTeaching: number;
  status: "IDEAL" | "RINGAN" | "OVERLOAD";
  catatan?: string;
  courses: {
    kodeMK: string;
    namaMK: string;
    sksMK: number;
    teamSize: number;
    sksShare: number;
  }[];
}

export interface LecturerHistoricalProfile {
  id: string;
  dosen: string;
  nidn: string;
  jabatanFungsional: string;
  color: string;
  records: SemesterWorkloadRecord[];
  rataRataSks: number;
  minSks: number;
  maxSks: number;
  konsistensiStatus: "KONSISTEN_IDEAL" | "KECENDERUNGAN_OVERLOAD" | "KECENDERUNGAN_RINGAN" | "FLUKTUATIF";
  rekomendasi: string;
}

export const SEMESTER_LIST_3YEAR: {
  id: string;
  tahun: string;
  tipe: "Ganjil" | "Genap";
  label: string;
  shortLabel: string;
}[] = [
  { id: "2024-1", tahun: "2024/2025", tipe: "Ganjil", label: "TA 2024/2025 Ganjil", shortLabel: "24 Ganjil" },
  { id: "2024-2", tahun: "2024/2025", tipe: "Genap", label: "TA 2024/2025 Genap", shortLabel: "24 Genap" },
  { id: "2025-1", tahun: "2025/2026", tipe: "Ganjil", label: "TA 2025/2026 Ganjil", shortLabel: "25 Ganjil" },
  { id: "2025-2", tahun: "2025/2026", tipe: "Genap", label: "TA 2025/2026 Genap", shortLabel: "25 Genap" },
  { id: "2026-1", tahun: "2026/2027", tipe: "Ganjil", label: "TA 2026/2027 Ganjil", shortLabel: "26 Ganjil" },
  { id: "2026-2", tahun: "2026/2027", tipe: "Genap", label: "TA 2026/2027 Genap", shortLabel: "26 Genap" },
];

export const HISTORICAL_LECTURERS_DATA: LecturerHistoricalProfile[] = [
  {
    id: "dosen-1",
    dosen: "Dr. Bruri Penabur, M.Si",
    nidn: "0014087802",
    jabatanFungsional: "Lektor Kepala",
    color: "#10b981", // Emerald
    records: [
      {
        semId: "2024-1",
        tahunAkademik: "2024/2025",
        semesterTipe: "Ganjil",
        semLabel: "2024/2025 Ganjil",
        sks: 5.5,
        totalSksSebelumBagi: 9,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Penyuluhan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP223120", namaMK: "Metodologi Partisipatif", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP225132", namaMK: "Evaluasi Program", sksMK: 3, teamSize: 3, sksShare: 1.0 },
        ],
      },
      {
        semId: "2024-2",
        tahunAkademik: "2024/2025",
        semesterTipe: "Genap",
        semLabel: "2024/2025 Genap",
        sks: 6.0,
        totalSksSebelumBagi: 11,
        jumlahMk: 4,
        jumlahTeamTeaching: 3,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP222115", namaMK: "Ekonomi Pertanian Laut", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP224129", namaMK: "Manajemen Agribisnis Kepulauan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 4, teamSize: 2, sksShare: 2.0 },
        ],
      },
      {
        semId: "2025-1",
        tahunAkademik: "2025/2026",
        semesterTipe: "Ganjil",
        semLabel: "2025/2026 Ganjil",
        sks: 6.5,
        totalSksSebelumBagi: 11,
        jumlahMk: 4,
        jumlahTeamTeaching: 3,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Penyuluhan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP223120", namaMK: "Komunikasi Pembangunan", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP225133", namaMK: "Kewirausahaan Maritim", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
        ],
      },
      {
        semId: "2025-2",
        tahunAkademik: "2025/2026",
        semesterTipe: "Genap",
        semLabel: "2025/2026 Genap",
        sks: 7.0,
        totalSksSebelumBagi: 12,
        jumlahMk: 4,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP226145", namaMK: "Kebijakan Pertanian Kepulauan", sksMK: 2, teamSize: 1, sksShare: 2.0 },
          { kodeMK: "PPP224129", namaMK: "Manajemen Agribisnis Kepulauan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
        ],
      },
      {
        semId: "2026-1",
        tahunAkademik: "2026/2027",
        semesterTipe: "Ganjil",
        semLabel: "2026/2027 Ganjil",
        sks: 6.0,
        totalSksSebelumBagi: 10,
        jumlahMk: 4,
        jumlahTeamTeaching: 3,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Sosiologi Pedesaan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP223120", namaMK: "Komunikasi Pembangunan", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP225132", namaMK: "Perencanaan & Evaluasi", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 4, teamSize: 2, sksShare: 2.0 },
        ],
      },
      {
        semId: "2026-2",
        tahunAkademik: "2026/2027",
        semesterTipe: "Genap",
        semLabel: "2026/2027 Genap",
        sks: 5.5,
        totalSksSebelumBagi: 9,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP222115", namaMK: "Ekonomi Pertanian Hayati", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 6, teamSize: 2, sksShare: 3.0 },
        ],
      },
    ],
    rataRataSks: 6.1,
    minSks: 5.5,
    maxSks: 7.0,
    konsistensiStatus: "KONSISTEN_IDEAL",
    rekomendasi: "Distribusi beban mengajar sangat stabil di koridor ideal 3-9 SKS. Tersedia ruang waktu optimal untuk riset dan pengabdian masyarakat.",
  },
  {
    id: "dosen-2",
    dosen: "Prof. Dr. Ir. J. Pattiasina, M.Sc",
    nidn: "0008036201",
    jabatanFungsional: "Guru Besar / Profesor",
    color: "#f59e0b", // Amber
    records: [
      {
        semId: "2024-1",
        tahunAkademik: "2024/2025",
        semesterTipe: "Ganjil",
        semLabel: "2024/2025 Ganjil",
        sks: 10.5,
        totalSksSebelumBagi: 14,
        jumlahMk: 5,
        jumlahTeamTeaching: 2,
        status: "OVERLOAD",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Sosiologi Pedesaan", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP223121", namaMK: "Dinamika Kelompok Adat", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP227150", namaMK: "Kapita Selekta Komunitas", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Tesis/Skripsi", sksMK: 7, teamSize: 2, sksShare: 3.5 },
        ],
      },
      {
        semId: "2024-2",
        tahunAkademik: "2024/2025",
        semesterTipe: "Genap",
        semLabel: "2024/2025 Genap",
        sks: 11.0,
        totalSksSebelumBagi: 15,
        jumlahMk: 5,
        jumlahTeamTeaching: 2,
        status: "OVERLOAD",
        courses: [
          { kodeMK: "PPP222116", namaMK: "Sosiologi Organisasi Petani", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Tesis/Skripsi", sksMK: 7, teamSize: 2, sksShare: 3.5 },
        ],
      },
      {
        semId: "2025-1",
        tahunAkademik: "2025/2026",
        semesterTipe: "Ganjil",
        semLabel: "2025/2026 Ganjil",
        sks: 10.0,
        totalSksSebelumBagi: 13,
        jumlahMk: 4,
        jumlahTeamTeaching: 2,
        status: "OVERLOAD",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Sosiologi Pedesaan", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP223121", namaMK: "Dinamika Kelompok", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP227150", namaMK: "Kapita Selekta Komunitas", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Tesis/Skripsi", sksMK: 6, teamSize: 2, sksShare: 3.0 },
        ],
      },
      {
        semId: "2025-2",
        tahunAkademik: "2025/2026",
        semesterTipe: "Genap",
        semLabel: "2025/2026 Genap",
        sks: 11.5,
        totalSksSebelumBagi: 16,
        jumlahMk: 5,
        jumlahTeamTeaching: 2,
        status: "OVERLOAD",
        courses: [
          { kodeMK: "PPP222116", namaMK: "Sosiologi Organisasi", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Tesis/Skripsi", sksMK: 8, teamSize: 2, sksShare: 4.0 },
        ],
      },
      {
        semId: "2026-1",
        tahunAkademik: "2026/2027",
        semesterTipe: "Ganjil",
        semLabel: "2026/2027 Ganjil",
        sks: 10.5,
        totalSksSebelumBagi: 14,
        jumlahMk: 4,
        jumlahTeamTeaching: 2,
        status: "OVERLOAD",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Sosiologi Pedesaan", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP223121", namaMK: "Dinamika Kelompok", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP221102", namaMK: "Etika Akademik & Kearifan", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Tesis/Skripsi", sksMK: 7, teamSize: 2, sksShare: 3.5 },
        ],
      },
      {
        semId: "2026-2",
        tahunAkademik: "2026/2027",
        semesterTipe: "Genap",
        semLabel: "2026/2027 Genap",
        sks: 10.0,
        totalSksSebelumBagi: 13,
        jumlahMk: 4,
        jumlahTeamTeaching: 2,
        status: "OVERLOAD",
        courses: [
          { kodeMK: "PPP222116", namaMK: "Sosiologi Organisasi", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Tesis/Skripsi", sksMK: 7, teamSize: 2, sksShare: 3.5 },
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
        ],
      },
    ],
    rataRataSks: 10.6,
    minSks: 10.0,
    maxSks: 11.5,
    konsistensiStatus: "KECENDERUNGAN_OVERLOAD",
    rekomendasi: "Sering melampaui batas wajar 9 SKS mengajar. Disarankan rotasi pengampu MK Sosiologi ke dosen junior/Lektor melalui Team Teaching.",
  },
  {
    id: "dosen-3",
    dosen: "Dr. H. Tuanakotta, M.Si",
    nidn: "0022067503",
    jabatanFungsional: "Lektor Kepala",
    color: "#3b82f6", // Blue
    records: [
      {
        semId: "2024-1",
        tahunAkademik: "2024/2025",
        semesterTipe: "Ganjil",
        semLabel: "2024/2025 Ganjil",
        sks: 5.0,
        totalSksSebelumBagi: 8,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP222114", namaMK: "Metodologi Penelitian Sosial", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP223121", namaMK: "Dinamika Kelompok", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 4, teamSize: 2, sksShare: 2.0 },
        ],
      },
      {
        semId: "2024-2",
        tahunAkademik: "2024/2025",
        semesterTipe: "Genap",
        semLabel: "2024/2025 Genap",
        sks: 5.5,
        totalSksSebelumBagi: 9,
        jumlahMk: 4,
        jumlahTeamTeaching: 3,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP224128", namaMK: "Statistika Sosial & Survei", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP226145", namaMK: "Kebijakan Pertanian Kepulauan", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 4, teamSize: 2, sksShare: 2.0 },
        ],
      },
      {
        semId: "2025-1",
        tahunAkademik: "2025/2026",
        semesterTipe: "Ganjil",
        semLabel: "2025/2026 Ganjil",
        sks: 5.5,
        totalSksSebelumBagi: 9,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP222114", namaMK: "Metodologi Penelitian Sosial", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP223121", namaMK: "Dinamika Kelompok", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
        ],
      },
      {
        semId: "2025-2",
        tahunAkademik: "2025/2026",
        semesterTipe: "Genap",
        semLabel: "2025/2026 Genap",
        sks: 6.0,
        totalSksSebelumBagi: 10,
        jumlahMk: 4,
        jumlahTeamTeaching: 3,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP224128", namaMK: "Statistika Sosial & Survei", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
          { kodeMK: "PPP226145", namaMK: "Kebijakan Pertanian Kepulauan", sksMK: 2, teamSize: 2, sksShare: 1.0 },
        ],
      },
      {
        semId: "2026-1",
        tahunAkademik: "2026/2027",
        semesterTipe: "Ganjil",
        semLabel: "2026/2027 Ganjil",
        sks: 6.0,
        totalSksSebelumBagi: 10,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP222114", namaMK: "Metodologi Penelitian Sosial", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP223121", namaMK: "Dinamika Kelompok", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 6, teamSize: 2, sksShare: 3.0 },
        ],
      },
      {
        semId: "2026-2",
        tahunAkademik: "2026/2027",
        semesterTipe: "Genap",
        semLabel: "2026/2027 Genap",
        sks: 5.5,
        totalSksSebelumBagi: 9,
        jumlahMk: 4,
        jumlahTeamTeaching: 3,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP224128", namaMK: "Statistika Sosial & Survei", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP224127", namaMK: "Kemiskinan Multidimensional", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 4, teamSize: 2, sksShare: 2.0 },
          { kodeMK: "PPP226145", namaMK: "Kebijakan Pertanian Kepulauan", sksMK: 2, teamSize: 2, sksShare: 1.0 },
        ],
      },
    ],
    rataRataSks: 5.6,
    minSks: 5.0,
    maxSks: 6.0,
    konsistensiStatus: "KONSISTEN_IDEAL",
    rekomendasi: "Beban mengajar dan bimbingan sangat ideal dan konsisten di koridor 3-9 SKS. Kinerja sangat stabil.",
  },
  {
    id: "dosen-4",
    dosen: "Dra. M. Soplanit, M.P",
    nidn: "0019126404",
    jabatanFungsional: "Lektor",
    color: "#a855f7", // Purple
    records: [
      {
        semId: "2024-1",
        tahunAkademik: "2024/2025",
        semesterTipe: "Ganjil",
        semLabel: "2024/2025 Ganjil",
        sks: 2.0,
        totalSksSebelumBagi: 4,
        jumlahMk: 2,
        jumlahTeamTeaching: 2,
        status: "RINGAN",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Sosiologi Pedesaan", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP223120", namaMK: "Komunikasi Pembangunan", sksMK: 3, teamSize: 3, sksShare: 1.0 },
        ],
      },
      {
        semId: "2024-2",
        tahunAkademik: "2024/2025",
        semesterTipe: "Genap",
        semLabel: "2024/2025 Genap",
        sks: 2.5,
        totalSksSebelumBagi: 5,
        jumlahMk: 2,
        jumlahTeamTeaching: 2,
        status: "RINGAN",
        courses: [
          { kodeMK: "PPP224128", namaMK: "Statistika Sosial & Survei", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP224129", namaMK: "Manajemen Agribisnis", sksMK: 3, teamSize: 3, sksShare: 1.0 },
        ],
      },
      {
        semId: "2025-1",
        tahunAkademik: "2025/2026",
        semesterTipe: "Ganjil",
        semLabel: "2025/2026 Ganjil",
        sks: 2.0,
        totalSksSebelumBagi: 4,
        jumlahMk: 2,
        jumlahTeamTeaching: 2,
        status: "RINGAN",
        courses: [
          { kodeMK: "PPP221101", namaMK: "Pengantar Sosiologi Pedesaan", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP223120", namaMK: "Komunikasi Pembangunan", sksMK: 3, teamSize: 3, sksShare: 1.0 },
        ],
      },
      {
        semId: "2025-2",
        tahunAkademik: "2025/2026",
        semesterTipe: "Genap",
        semLabel: "2025/2026 Genap",
        sks: 2.5,
        totalSksSebelumBagi: 5,
        jumlahMk: 2,
        jumlahTeamTeaching: 2,
        status: "RINGAN",
        courses: [
          { kodeMK: "PPP224128", namaMK: "Statistika Sosial & Survei", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP224129", namaMK: "Manajemen Agribisnis", sksMK: 3, teamSize: 3, sksShare: 1.0 },
        ],
      },
      {
        semId: "2026-1",
        tahunAkademik: "2026/2027",
        semesterTipe: "Ganjil",
        semLabel: "2026/2027 Ganjil",
        sks: 2.5,
        totalSksSebelumBagi: 5,
        jumlahMk: 2,
        jumlahTeamTeaching: 2,
        status: "RINGAN",
        courses: [
          { kodeMK: "PPP223120", namaMK: "Komunikasi Pembangunan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP225133", namaMK: "Kewirausahaan Maritim", sksMK: 3, teamSize: 3, sksShare: 1.0 },
        ],
      },
      {
        semId: "2026-2",
        tahunAkademik: "2026/2027",
        semesterTipe: "Genap",
        semLabel: "2026/2027 Genap",
        sks: 2.0,
        totalSksSebelumBagi: 4,
        jumlahMk: 2,
        jumlahTeamTeaching: 2,
        status: "RINGAN",
        courses: [
          { kodeMK: "PPP224128", namaMK: "Statistika Sosial", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP224129", namaMK: "Manajemen Agribisnis", sksMK: 3, teamSize: 3, sksShare: 1.0 },
        ],
      },
    ],
    rataRataSks: 2.3,
    minSks: 2.0,
    maxSks: 2.5,
    konsistensiStatus: "KECENDERUNGAN_RINGAN",
    rekomendasi: "Beban mengajar di bawah syarat minimal 3 SKS BKD. Direkomendasikan penambahan 1 MK wajib atau tim pembimbing skripsi.",
  },
  {
    id: "dosen-5",
    dosen: "Dr. Ir. E. Wattimena, M.App.Sc",
    nidn: "0016047205",
    jabatanFungsional: "Lektor Kepala",
    color: "#06b6d4", // Cyan
    records: [
      {
        semId: "2024-1",
        tahunAkademik: "2024/2025",
        semesterTipe: "Ganjil",
        semLabel: "2024/2025 Ganjil",
        sks: 6.0,
        totalSksSebelumBagi: 10,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP225132", namaMK: "Perencanaan & Evaluasi Program", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP222114", namaMK: "Metodologi Penelitian Sosial", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 6, teamSize: 2, sksShare: 3.0 },
        ],
      },
      {
        semId: "2024-2",
        tahunAkademik: "2024/2025",
        semesterTipe: "Genap",
        semLabel: "2024/2025 Genap",
        sks: 6.5,
        totalSksSebelumBagi: 11,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan Iklim", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP222115", namaMK: "Ekonomi Pertanian Laut", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 4, teamSize: 2, sksShare: 2.0 },
        ],
      },
      {
        semId: "2025-1",
        tahunAkademik: "2025/2026",
        semesterTipe: "Ganjil",
        semLabel: "2025/2026 Ganjil",
        sks: 6.0,
        totalSksSebelumBagi: 10,
        jumlahMk: 3,
        jumlahTeamTeaching: 3,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP225132", namaMK: "Perencanaan & Evaluasi", sksMK: 3, teamSize: 3, sksShare: 1.0 },
          { kodeMK: "PPP225133", namaMK: "Kewirausahaan Maritim", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 7, teamSize: 2, sksShare: 3.5 },
        ],
      },
      {
        semId: "2025-2",
        tahunAkademik: "2025/2026",
        semesterTipe: "Genap",
        semLabel: "2025/2026 Genap",
        sks: 7.0,
        totalSksSebelumBagi: 11,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP222115", namaMK: "Ekonomi Pertanian Laut", sksMK: 3, teamSize: 1, sksShare: 3.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
        ],
      },
      {
        semId: "2026-1",
        tahunAkademik: "2026/2027",
        semesterTipe: "Ganjil",
        semLabel: "2026/2027 Ganjil",
        sks: 6.5,
        totalSksSebelumBagi: 11,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP225132", namaMK: "Perencanaan & Evaluasi", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP222114", namaMK: "Metodologi Penelitian Sosial", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 7, teamSize: 2, sksShare: 3.5 },
        ],
      },
      {
        semId: "2026-2",
        tahunAkademik: "2026/2027",
        semesterTipe: "Genap",
        semLabel: "2026/2027 Genap",
        sks: 6.0,
        totalSksSebelumBagi: 10,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP222115", namaMK: "Ekonomi Pertanian Hayati", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 6, teamSize: 2, sksShare: 3.0 },
        ],
      },
    ],
    rataRataSks: 6.3,
    minSks: 6.0,
    maxSks: 7.0,
    konsistensiStatus: "KONSISTEN_IDEAL",
    rekomendasi: "Sangat stabil di zona ideal 6-7 SKS. Kolaborasi Team Teaching perkuliahan dan bimbingan berjalan optimal.",
  },
  {
    id: "dosen-6",
    dosen: "Prof. Dr. Ir. A. Matakupan, M.Sc",
    nidn: "0005016006",
    jabatanFungsional: "Guru Besar / Profesor",
    color: "#f43f5e", // Rose
    records: [
      {
        semId: "2024-1",
        tahunAkademik: "2024/2025",
        semesterTipe: "Ganjil",
        semLabel: "2024/2025 Ganjil",
        sks: 4.5,
        totalSksSebelumBagi: 7,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP221102", namaMK: "Etika Akademik Kearifan Lokal", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP227150", namaMK: "Kapita Selekta Dinamika Komunitas", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi/Disertasi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
        ],
      },
      {
        semId: "2024-2",
        tahunAkademik: "2024/2025",
        semesterTipe: "Genap",
        semLabel: "2024/2025 Genap",
        sks: 5.0,
        totalSksSebelumBagi: 8,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi/Disertasi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
          { kodeMK: "PPP221102", namaMK: "Etika Akademik", sksMK: 2, teamSize: 2, sksShare: 1.0 },
        ],
      },
      {
        semId: "2025-1",
        tahunAkademik: "2025/2026",
        semesterTipe: "Ganjil",
        semLabel: "2025/2026 Ganjil",
        sks: 5.0,
        totalSksSebelumBagi: 8,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP221102", namaMK: "Etika Akademik Kearifan Lokal", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP227150", namaMK: "Kapita Selekta Komunitas", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 6, teamSize: 2, sksShare: 3.0 },
        ],
      },
      {
        semId: "2025-2",
        tahunAkademik: "2025/2026",
        semesterTipe: "Genap",
        semLabel: "2025/2026 Genap",
        sks: 5.5,
        totalSksSebelumBagi: 9,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 6, teamSize: 2, sksShare: 3.0 },
          { kodeMK: "PPP221102", namaMK: "Etika Akademik", sksMK: 2, teamSize: 2, sksShare: 1.0 },
        ],
      },
      {
        semId: "2026-1",
        tahunAkademik: "2026/2027",
        semesterTipe: "Ganjil",
        semLabel: "2026/2027 Ganjil",
        sks: 4.5,
        totalSksSebelumBagi: 7,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP221102", namaMK: "Etika Akademik & Kearifan", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP227150", namaMK: "Kapita Selekta Komunitas", sksMK: 2, teamSize: 2, sksShare: 1.0 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
        ],
      },
      {
        semId: "2026-2",
        tahunAkademik: "2026/2027",
        semesterTipe: "Genap",
        semLabel: "2026/2027 Genap",
        sks: 5.0,
        totalSksSebelumBagi: 8,
        jumlahMk: 3,
        jumlahTeamTeaching: 2,
        status: "IDEAL",
        courses: [
          { kodeMK: "PPP226146", namaMK: "Tata Kelola Lingkungan", sksMK: 3, teamSize: 2, sksShare: 1.5 },
          { kodeMK: "PPP228199", namaMK: "Bimbingan Skripsi", sksMK: 5, teamSize: 2, sksShare: 2.5 },
          { kodeMK: "PPP221102", namaMK: "Etika Akademik", sksMK: 2, teamSize: 2, sksShare: 1.0 },
        ],
      },
    ],
    rataRataSks: 4.9,
    minSks: 4.5,
    maxSks: 5.5,
    konsistensiStatus: "KONSISTEN_IDEAL",
    rekomendasi: "Sangat stabil di rentang aman 4.5-5.5 SKS. Fokus pada penguatan etika ilmiah kelautan dan bimbingan pascasarjana.",
  },
];

interface DosenWorkload3YearTrendProps {
  namaProdi: string;
  showNotification?: (msg: string, type?: "success" | "error" | "info") => void;
}

export const DosenWorkload3YearTrend: React.FC<DosenWorkload3YearTrendProps> = ({
  namaProdi,
  showNotification,
}) => {
  const [selectedDosenId, setSelectedDosenId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [hoveredPoint, setHoveredPoint] = useState<{
    dosenName: string;
    semLabel: string;
    sks: number;
    courseCount: number;
    status: string;
    courses: any[];
  } | null>(null);

  // Filter lecturers
  const filteredLecturers = HISTORICAL_LECTURERS_DATA.filter((lec) => {
    if (selectedDosenId !== "ALL" && lec.id !== selectedDosenId) return false;
    if (statusFilter !== "ALL" && lec.konsistensiStatus !== statusFilter) return false;
    return true;
  });

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 260;
  const paddingLeft = 55;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const minScaleSks = 0;
  const maxScaleSks = 14;

  const getYCoord = (sks: number) => {
    const clamped = Math.max(minScaleSks, Math.min(maxScaleSks, sks));
    const ratio = (clamped - minScaleSks) / (maxScaleSks - minScaleSks);
    return chartHeight - paddingBottom - ratio * innerHeight;
  };

  const getXCoord = (index: number) => {
    const step = innerWidth / (SEMESTER_LIST_3YEAR.length - 1);
    return paddingLeft + index * step;
  };

  // Koordinat Y untuk koridor ideal pengajaran 3 s.d. 9 SKS
  const y3 = getYCoord(3);
  const y9 = getYCoord(9);

  const handleCopySummary = () => {
    const text = `LAPORAN TREN BEBAN KERJA DOSEN (BKD) 3 TAHUN TERAKHIR (2024 - 2026)\nProgram Studi: ${namaProdi}\n\n` +
      filteredLecturers
        .map(
          (l) =>
            `- ${l.dosen} (${l.jabatanFungsional}): Rata-rata ${l.rataRataSks} SKS | Min: ${l.minSks} SKS | Max: ${l.maxSks} SKS | Status: ${l.konsistensiStatus}\n  Catatan: ${l.rekomendasi}`
        )
        .join("\n\n");

    navigator.clipboard.writeText(text);
    showNotification?.("Ringkasan tren 3 tahun berhasil disalin ke papan klip!", "success");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Tren 3 Tahun */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
              <TrendingUp className="w-5 h-5 text-cyan-300" />
            </span>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Visualisasi Tren Beban Kerja Dosen 3 Tahun Terakhir (2024 - 2026)
                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Standar Pengajaran: 3 - 9 SKS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Memantau distribusi beban mengajar jangka panjang Program Studi {namaProdi} dengan perhitungan SKS Team Teaching proporsional.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700 shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Ringkasan</span>
          </button>
        </div>
      </div>

      {/* Kontrol Filter Tren */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Pilih Dosen Tertentu atau Semua */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Sorot Dosen:
            </span>
            <select
              value={selectedDosenId}
              onChange={(e) => setSelectedDosenId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Dosen (Multi-Line Chart)</option>
              {HISTORICAL_LECTURERS_DATA.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.dosen} (Rerata: {l.rataRataSks} SKS)
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Konsistensi */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status Tren:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="KONSISTEN_IDEAL">Konsisten Ideal (3 - 9 SKS)</option>
              <option value="KECENDERUNGAN_OVERLOAD">Kecenderungan Overload (&gt; 9 SKS)</option>
              <option value="KECENDERUNGAN_RINGAN">Kecenderungan Kurang (&lt; 3 SKS)</option>
            </select>
          </div>
        </div>

        {/* Ringkasan Parameter Rumus Team Teaching */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-300">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Prinsip BKD Bidang Pendidikan:</strong> Sesuai Pedoman Operasional BKD Dikti, beban mengajar minimal <strong>3 SKS</strong> dan batas wajar <strong>9 SKS</strong> (total BKD Tridharma 12–16 SKS). Pada Team Teaching, <code className="text-amber-300 font-mono bg-slate-900 px-1 py-0.5 rounded border border-slate-700">Beban SKS Dosen = SKS MK / Jumlah Pengampu</code>.
          </span>
        </div>
      </div>

      {/* GRAFIK TREN SVG INTERAKTIF */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Kurva Tren Distribusi SKS Pengajaran Selama 6 Semester
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Area hijau menandai Zona Ideal BKD Pengajaran (3 - 9 SKS). Sorot titik untuk melihat rincian mata kuliah yang diampu.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400"></span>
              Zona Ideal 3 - 9 SKS
            </span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[620px] select-none"
            style={{ maxHeight: "380px" }}
          >
            <defs>
              {/* Gradient Zona Ideal */}
              <linearGradient id="idealZoneGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Zona Ideal Corridor (3 - 9 SKS) */}
            <rect
              x={paddingLeft}
              y={y9}
              width={innerWidth}
              height={y3 - y9}
              fill="url(#idealZoneGrad)"
              rx="4"
            />

            {/* Garis Bantu Horizontal Grid */}
            {[0, 2, 3, 5, 7, 9, 11, 13].map((sksVal) => {
              const y = getYCoord(sksVal);
              const isIdealMin = sksVal === 3;
              const isIdealMax = sksVal === 9;
              return (
                <g key={sksVal}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke={isIdealMin || isIdealMax ? "#10b981" : "#334155"}
                    strokeWidth={isIdealMin || isIdealMax ? "1.5" : "0.75"}
                    strokeDasharray={isIdealMin || isIdealMax ? "4 4" : "2 2"}
                    strokeOpacity={isIdealMin || isIdealMax ? "0.9" : "0.4"}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="9.5"
                    fill={isIdealMin || isIdealMax ? "#34d399" : "#64748b"}
                    fontWeight={isIdealMin || isIdealMax ? "bold" : "normal"}
                    fontFamily="monospace"
                  >
                    {sksVal} SKS
                  </text>
                </g>
              );
            })}

            {/* Garis Vertikal & Label Semester X Axis */}
            {SEMESTER_LIST_3YEAR.map((sem, idx) => {
              const x = getXCoord(idx);
              return (
                <g key={sem.id}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={chartHeight - paddingBottom}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={x}
                    y={chartHeight - paddingBottom + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#94a3b8"
                  >
                    {sem.shortLabel}
                  </text>
                  <text
                    x={x}
                    y={chartHeight - paddingBottom + 27}
                    textAnchor="middle"
                    fontSize="7.5"
                    fill="#64748b"
                  >
                    {sem.tahun}
                  </text>
                </g>
              );
            })}

            {/* Kurva Garis Tren untuk Setiap Dosen */}
            {filteredLecturers.map((lec) => {
              const points = lec.records.map((r, rIdx) => {
                const x = getXCoord(rIdx);
                const y = getYCoord(r.sks);
                return `${x},${y}`;
              });
              const pathD = `M ${points.join(" L ")}`;
              const isHighlighted = selectedDosenId === "ALL" || selectedDosenId === lec.id;

              return (
                <g key={lec.id} opacity={isHighlighted ? 1 : 0.25} className="transition-opacity duration-200">
                  {/* Path Garis */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={lec.color}
                    strokeWidth={selectedDosenId === lec.id ? "3" : "2"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Titik-titik Data (Dots) */}
                  {lec.records.map((r, rIdx) => {
                    const cx = getXCoord(rIdx);
                    const cy = getYCoord(r.sks);
                    return (
                      <circle
                        key={r.semId}
                        cx={cx}
                        cy={cy}
                        r={selectedDosenId === lec.id ? "5.5" : "4"}
                        fill="#0f172a"
                        stroke={lec.color}
                        strokeWidth={selectedDosenId === lec.id ? "3" : "2"}
                        className="cursor-pointer hover:scale-150 transition-transform"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            dosenName: lec.dosen,
                            semLabel: r.semLabel,
                            sks: r.sks,
                            courseCount: r.jumlahMk,
                            status: r.status,
                            courses: r.courses,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Card Detail Floating */}
        {hoveredPoint && (
          <div className="p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
            <div>
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>{hoveredPoint.dosenName}</span>
                <span className="text-slate-400 font-normal">&bull; {hoveredPoint.semLabel}</span>
              </div>
              <div className="text-slate-300 mt-1">
                Beban SKS Terhitung: <strong className="text-white font-mono">{hoveredPoint.sks} SKS</strong> ({hoveredPoint.courseCount} Mata Kuliah)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[10.5px] font-black border ${
                  hoveredPoint.status === "IDEAL"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : hoveredPoint.status === "OVERLOAD"
                    ? "bg-rose-950 text-rose-300 border-rose-800"
                    : "bg-amber-950 text-amber-300 border-amber-800"
                }`}
              >
                {hoveredPoint.status === "IDEAL"
                  ? "Optimal Pengajaran (3-9 SKS)"
                  : hoveredPoint.status === "OVERLOAD"
                  ? "Overload (> 9 SKS)"
                  : "Kurang (< 3 SKS)"}
              </span>
            </div>
          </div>
        )}

        {/* Legenda Garis Dosen */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-500">Dosen Pengampu:</span>
          {HISTORICAL_LECTURERS_DATA.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedDosenId(selectedDosenId === l.id ? "ALL" : l.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                selectedDosenId === l.id
                  ? "bg-slate-800 text-white border-white/40 shadow-xs"
                  : "bg-slate-950/80 text-slate-400 hover:text-white border-slate-800"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }}></span>
              <span>{l.dosen.split(",")[0]}</span>
              <span className="font-mono text-[10px] text-slate-500">({l.rataRataSks} SKS)</span>
            </button>
          ))}
        </div>
      </div>

      {/* HEATMAP TABEL DISTRIBUSI 3 TAHUN LENGKAP */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Matriks Heatmap Beban SKS 3 Tahun per Semester
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Nilai SKS mencerminkan beban riil setelah formula pembagian SKS mata kuliah Team Teaching.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-bold uppercase text-[10px]">
                <th className="p-3">Dosen Pengampu</th>
                <th className="p-3 text-center">Jabatan</th>
                {SEMESTER_LIST_3YEAR.map((s) => (
                  <th key={s.id} className="p-2.5 text-center whitespace-nowrap">
                    <div>{s.shortLabel}</div>
                    <div className="text-[9px] text-slate-500 font-normal">{s.tipe}</div>
                  </th>
                ))}
                <th className="p-3 text-center">Rerata</th>
                <th className="p-3 text-center">Status Tren</th>
                <th className="p-3">Rekomendasi Distribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLecturers.map((lec) => (
                <tr key={lec.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lec.color }}></span>
                      <span>{lec.dosen}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 ml-3.5">NIDN: {lec.nidn}</div>
                  </td>

                  <td className="p-3 text-center text-slate-300 text-[11px]">
                    {lec.jabatanFungsional}
                  </td>

                  {/* 6 Semester Kolom Heatmap */}
                  {lec.records.map((r) => {
                    return (
                      <td key={r.semId} className="p-2 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded-lg font-mono font-bold text-xs border ${
                            r.status === "IDEAL"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : r.status === "OVERLOAD"
                              ? "bg-rose-950 text-rose-300 border-rose-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          }`}
                          title={`${r.semLabel}: ${r.sks} SKS (${r.jumlahMk} MK, ${r.jumlahTeamTeaching} Team Teaching)`}
                        >
                          {r.sks.toFixed(1)}
                        </span>
                      </td>
                    );
                  })}

                  <td className="p-3 text-center font-mono font-black text-amber-400">
                    {lec.rataRataSks} SKS
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border inline-block whitespace-nowrap ${
                        lec.konsistensiStatus === "KONSISTEN_IDEAL"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : lec.konsistensiStatus === "KECENDERUNGAN_OVERLOAD"
                          ? "bg-rose-950 text-rose-300 border-rose-800"
                          : "bg-amber-950 text-amber-300 border-amber-800"
                      }`}
                    >
                      {lec.konsistensiStatus === "KONSISTEN_IDEAL"
                        ? "Konsisten Ideal"
                        : lec.konsistensiStatus === "KECENDERUNGAN_OVERLOAD"
                        ? "Sering Overload"
                        : "Cenderung Kurang"}
                    </span>
                  </td>

                  <td className="p-3 text-xs text-slate-300 max-w-xs leading-relaxed">
                    {lec.rekomendasi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REKOMENDASI PEMERATAAN BEBAN MENGAJAR JANGKA PANJANG */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
            <CheckCircle2 className="w-4 h-4" />
            <span>Kepatuhan Standar SPMI</span>
          </div>
          <div className="text-2xl font-black text-white">
            {
              ((filteredLecturers.filter((l) => l.konsistensiStatus === "KONSISTEN_IDEAL").length /
                Math.max(1, filteredLecturers.length)) *
                100
              ).toFixed(0)}
            %
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Dosen konsisten memenuhi rentang 3 - 9 SKS pengajaran selama 3 tahun terakhir tanpa fluktuasi ekstrem.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Perhatian Beban Berlebih</span>
          </div>
          <div className="text-2xl font-black text-rose-400">
            {filteredLecturers.filter((l) => l.konsistensiStatus === "KECENDERUNGAN_OVERLOAD").length} Dosen
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Perlu rotasi atau penambahan anggota Team Teaching untuk mata kuliah sosiologi dan skripsi.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase">
            <RotateCcw className="w-4 h-4" />
            <span>Kapasitas Tersedia</span>
          </div>
          <div className="text-2xl font-black text-cyan-400">
            {filteredLecturers.filter((l) => l.konsistensiStatus === "KECENDERUNGAN_RINGAN").length} Dosen
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Memiliki kuota penugasan mata kuliah tambahan atau tim pendamping riset terapan kepulauan.
          </p>
        </div>
      </div>
    </div>
  );
};
