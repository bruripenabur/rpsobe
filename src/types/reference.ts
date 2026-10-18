/**
 * Tipe Data Sistem Manajemen Database Pustaka & Referensi UNPATTI
 */

export type SourceType = "buku" | "jurnal" | "prosiding" | "regulasi" | "website";
export type KategoriPustaka = "utama" | "pendukung";

export interface ReferenceItem {
  id: string;
  title: string;
  authors: string;
  year: number | string;
  sourceType: SourceType;
  publisherOrJournal: string;
  cityOrUrl?: string;
  doi?: string;
  kategoriPustaka: KategoriPustaka;
  bidangMataKuliah: string; // Misal: "Penyuluhan Pertanian", "Agribisnis", "Bina Mulia Ke Lautan", "Sosial Ekonomi", "Umum"
  formattedCitation: string; // Format APA 7th Edition
  isCustom?: boolean;
  tags?: string[];
}

export interface ExternalSearchFilters {
  query: string;
  source: "crossref" | "openalex" | "openlibrary";
  mataKuliahFilter?: string;
  category: KategoriPustaka;
}
