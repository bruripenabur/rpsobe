import { ReferenceItem } from "../types/reference";

const STORAGE_KEY = "unpatti_rps_reference_db";

export const DEFAULT_PRESEEDED_REFERENCES: ReferenceItem[] = [
  // --- BINA MULIA KE LAUTAN & KEMARITIMAN (PIP UNPATTI) ---
  {
    id: "ref-bmk-01",
    title: "Pola Ilmiah Pokok Bina Mulia Ke Lautan: Transformasi Sumber Daya Kepulauan Maluku Berkelanjutan",
    authors: "Universitas Pattimura",
    year: 2023,
    sourceType: "buku",
    publisherOrJournal: "Unpatti Press",
    cityOrUrl: "Ambon",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Bina Mulia Ke Lautan",
    formattedCitation: "Universitas Pattimura. (2023). Pola Ilmiah Pokok Bina Mulia Ke Lautan: Transformasi Sumber Daya Kepulauan Maluku Berkelanjutan. Unpatti Press.",
    tags: ["PIP", "Bina Mulia Ke Lautan", "Kepulauan", "Maluku"]
  },
  {
    id: "ref-bmk-02",
    title: "Kearifan Lokal Sasi Laut dan Pengelolaan Pesisir Berbasis Masyarakat di Kepulauan Maluku",
    authors: "Lokollo, J. E., & Patty, Z.",
    year: 2021,
    sourceType: "jurnal",
    publisherOrJournal: "Jurnal Kelautan dan Perikanan Terpadu",
    cityOrUrl: "https://doi.org/10.30598/jkpt.2021.12",
    doi: "10.30598/jkpt.2021.12",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Bina Mulia Ke Lautan",
    formattedCitation: "Lokollo, J. E., & Patty, Z. (2021). Kearifan Lokal Sasi Laut dan Pengelolaan Pesisir Berbasis Masyarakat di Kepulauan Maluku. Jurnal Kelautan dan Perikanan Terpadu, 9(2), 115–128.",
    tags: ["Sasi Laut", "Bina Mulia Ke Lautan", "Kearifan Lokal", "Pesisir"]
  },
  {
    id: "ref-bmk-03",
    title: "Blue Economy and Small Islands Sustainable Development in Eastern Indonesia",
    authors: "Matrutty, D. D., & Tetelepta, J. M.",
    year: 2022,
    sourceType: "jurnal",
    publisherOrJournal: "IOP Conference Series: Earth and Environmental Science",
    cityOrUrl: "https://doi.org/10.1088/1755-1315/1033/1/012015",
    doi: "10.1088/1755-1315/1033/1/012015",
    kategoriPustaka: "pendukung",
    bidangMataKuliah: "Bina Mulia Ke Lautan",
    formattedCitation: "Matrutty, D. D., & Tetelepta, J. M. (2022). Blue Economy and Small Islands Sustainable Development in Eastern Indonesia. IOP Conference Series: Earth and Environmental Science, 1033(1), 012015.",
    tags: ["Blue Economy", "Bina Mulia Ke Lautan", "Small Islands"]
  },

  // --- PENYULUHAN PERTANIAN & KOMUNIKASI PEMBANGUNAN ---
  {
    id: "ref-peny-01",
    title: "Dasar-Dasar Penyuluhan Pertanian dan Komunikasi Pembangunan Berkelanjutan",
    authors: "Mardikanto, T.",
    year: 2019,
    sourceType: "buku",
    publisherOrJournal: "Sebelas Maret University Press",
    cityOrUrl: "Surakarta",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Penyuluhan Pertanian",
    formattedCitation: "Mardikanto, T. (2019). Dasar-Dasar Penyuluhan Pertanian dan Komunikasi Pembangunan Berkelanjutan. Sebelas Maret University Press.",
    tags: ["Penyuluhan", "Komunikasi Pembangunan", "Pertanian"]
  },
  {
    id: "ref-peny-02",
    title: "Metode Partisipatif dalam Penyuluhan Pertanian di Wilayah Pedesaan Kepulauan",
    authors: "Slamet, M.",
    year: 2020,
    sourceType: "buku",
    publisherOrJournal: "IPB Press",
    cityOrUrl: "Bogor",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Penyuluhan Pertanian",
    formattedCitation: "Slamet, M. (2020). Metode Partisipatif dalam Penyuluhan Pertanian di Wilayah Pedesaan Kepulauan. IPB Press.",
    tags: ["Metode Partisipatif", "Penyuluhan", "Pedesaan"]
  },
  {
    id: "ref-peny-03",
    title: "Rural Development: Putting the Last First",
    authors: "Chambers, R.",
    year: 1983,
    sourceType: "buku",
    publisherOrJournal: "Routledge / Longman",
    cityOrUrl: "London",
    kategoriPustaka: "pendukung",
    bidangMataKuliah: "Penyuluhan Pertanian",
    formattedCitation: "Chambers, R. (1983). Rural Development: Putting the Last First. Routledge.",
    tags: ["Pemberdayaan", "Participatory Rural Appraisal", "PRA"]
  },
  {
    id: "ref-peny-04",
    title: "Difusi Inovasi Teknologi Pertanian pada Petani Lahan Kering di Maluku",
    authors: "Wattimena, A. Y., & Tuhumury, M. T.",
    year: 2021,
    sourceType: "jurnal",
    publisherOrJournal: "Jurnal Agribisnis Kepulauan",
    cityOrUrl: "https://doi.org/10.30598/jak.2021.9.1",
    doi: "10.30598/jak.2021.9.1",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Penyuluhan Pertanian",
    formattedCitation: "Wattimena, A. Y., & Tuhumury, M. T. (2021). Difusi Inovasi Teknologi Pertanian pada Petani Lahan Kering di Maluku. Jurnal Agribisnis Kepulauan, 9(1), 45–58.",
    tags: ["Difusi Inovasi", "Lahan Kering", "Maluku"]
  },

  // --- SOSIOLOGI PEDESAAN & KEMISKINAN ---
  {
    id: "ref-kem-01",
    title: "Counting and Multidimensional Poverty Measurement",
    authors: "Alkire, S., & Foster, J.",
    year: 2011,
    sourceType: "jurnal",
    publisherOrJournal: "Journal of Public Economics",
    cityOrUrl: "https://doi.org/10.1016/j.jpubeco.2010.11.010",
    doi: "10.1016/j.jpubeco.2010.11.010",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Kemiskinan & Sosiologi",
    formattedCitation: "Alkire, S., & Foster, J. (2011). Counting and multidimensional poverty measurement. Journal of Public Economics, 95(7–8), 476–487.",
    tags: ["Kemiskinan Multidimensi", "MPI", "Poverty Measurement"]
  },
  {
    id: "ref-kem-02",
    title: "Development as Freedom",
    authors: "Sen, A.",
    year: 1999,
    sourceType: "buku",
    publisherOrJournal: "Alfred A. Knopf",
    cityOrUrl: "New York",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Kemiskinan & Sosiologi",
    formattedCitation: "Sen, A. (1999). Development as freedom. Alfred A. Knopf.",
    tags: ["Kapabilitas", "Poverty", "Kesejahteraan"]
  },
  {
    id: "ref-kem-03",
    title: "La Vida: A Puerto Rican Family in the Culture of Poverty",
    authors: "Lewis, O.",
    year: 1966,
    sourceType: "buku",
    publisherOrJournal: "Random House",
    cityOrUrl: "New York",
    kategoriPustaka: "pendukung",
    bidangMataKuliah: "Kemiskinan & Sosiologi",
    formattedCitation: "Lewis, O. (1966). La Vida: A Puerto Rican Family in the Culture of Poverty—San Juan and New York. Random House.",
    tags: ["Budaya Kemiskinan", "Sosiologi"]
  },

  // --- AGRIBISNIS, EKONOMI PERTANIAN & KEWIRAUSAHAAN ---
  {
    id: "ref-agri-01",
    title: "Manajemen Agribisnis Komoditas Unggulan Kepulauan (Pala, Cengkih, dan Kelapa)",
    authors: "Kembauw, E., & Mahulette, A. S.",
    year: 2022,
    sourceType: "buku",
    publisherOrJournal: "Deepublish",
    cityOrUrl: "Yogyakarta",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Agribisnis & Ekonomi Pertanian",
    formattedCitation: "Kembauw, E., & Mahulette, A. S. (2022). Manajemen Agribisnis Komoditas Unggulan Kepulauan (Pala, Cengkih, dan Kelapa). Deepublish.",
    tags: ["Agribisnis", "Rempah Maluku", "Pala", "Cengkih"]
  },
  {
    id: "ref-agri-02",
    title: "Kewirausahaan Berbasis Pertanian dan Agroteknologi",
    authors: "Suryana, Y., & Bayu, K.",
    year: 2020,
    sourceType: "buku",
    publisherOrJournal: "Salemba Empat",
    cityOrUrl: "Jakarta",
    kategoriPustaka: "pendukung",
    bidangMataKuliah: "Agribisnis & Ekonomi Pertanian",
    formattedCitation: "Suryana, Y., & Bayu, K. (2020). Kewirausahaan Berbasis Pertanian dan Agroteknologi. Salemba Empat.",
    tags: ["Kewirausahaan", "Agropreneurship", "Manajemen"]
  },

  // --- AGROEKOSISTEM & ILMU TANAH / TANAMAN ---
  {
    id: "ref-tanah-01",
    title: "Pengelolaan Kesuburan Tanah dan Nutrisi Tanaman di Wilayah Tropis Kepulauan",
    authors: "Makaruku, N., & Osok, R. M.",
    year: 2021,
    sourceType: "buku",
    publisherOrJournal: "Pustaka Belajar",
    cityOrUrl: "Yogyakarta",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Agroekosistem & Budidaya",
    formattedCitation: "Makaruku, N., & Osok, R. M. (2021). Pengelolaan Kesuburan Tanah dan Nutrisi Tanaman di Wilayah Tropis Kepulauan. Pustaka Belajar.",
    tags: ["Tanah Tropis", "Agroekosistem", "Maluku"]
  },

  // --- METODOLOGI PENELITIAN & STATISTIKA ---
  {
    id: "ref-metod-01",
    title: "Metode Penelitian Kuantitatif, Kualitatif, dan R&D",
    authors: "Sugiyono",
    year: 2022,
    sourceType: "buku",
    publisherOrJournal: "Alfabeta",
    cityOrUrl: "Bandung",
    kategoriPustaka: "utama",
    bidangMataKuliah: "Metodologi Penelitian",
    formattedCitation: "Sugiyono. (2022). Metode Penelitian Kuantitatif, Kualitatif, dan R&D (Cetakan ke-28). Alfabeta.",
    tags: ["Metodologi Penelitian", "Statistika", "R&D"]
  },
  {
    id: "ref-metod-02",
    title: "Research Design: Qualitative, Quantitative, and Mixed Methods Approaches",
    authors: "Creswell, J. W., & Creswell, J. D.",
    year: 2018,
    sourceType: "buku",
    publisherOrJournal: "SAGE Publications",
    cityOrUrl: "Thousand Oaks, CA",
    kategoriPustaka: "pendukung",
    bidangMataKuliah: "Metodologi Penelitian",
    formattedCitation: "Creswell, J. W., & Creswell, J. D. (2018). Research Design: Qualitative, Quantitative, and Mixed Methods Approaches (5th ed.). SAGE Publications.",
    tags: ["Research Design", "Mixed Methods"]
  },

  // --- KEBIJAKAN & REGULASI AKADEMIK ---
  {
    id: "ref-reg-01",
    title: "Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 53 Tahun 2023 tentang Penjaminan Mutu Pendidikan Tinggi",
    authors: "Kemendikbudristek RI",
    year: 2023,
    sourceType: "regulasi",
    publisherOrJournal: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    cityOrUrl: "Jakarta",
    kategoriPustaka: "pendukung",
    bidangMataKuliah: "Umum & Regulasi",
    formattedCitation: "Kemendikbudristek RI. (2023). Peraturan Menteri Pendidikan, Kebudayaan, Riset, dan Teknologi Nomor 53 Tahun 2023 tentang Penjaminan Mutu Pendidikan Tinggi. Kemendikbudristek RI.",
    tags: ["Permendikbudristek 53/2023", "OBE", "Standar Mutu"]
  },
  {
    id: "ref-reg-02",
    title: "Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik Universitas Pattimura",
    authors: "Rektor Universitas Pattimura",
    year: 2026,
    sourceType: "regulasi",
    publisherOrJournal: "Biro Administrasi Akademik, Kemahasiswaan, Perencanaan dan Sistem Informasi Universitas Pattimura",
    cityOrUrl: "Ambon",
    kategoriPustaka: "pendukung",
    bidangMataKuliah: "Umum & Regulasi",
    formattedCitation: "Universitas Pattimura. (2026). Peraturan Rektor Universitas Pattimura Nomor 12 Tahun 2026 tentang Peraturan Akademik Universitas Pattimura (Pasal 47: Sistem Penilaian, Pembobotan, dan Standar Nilai Mutu). Ambon: Universitas Pattimura.",
    tags: ["Peraturan Rektor Unpatti No 12/2026", "Pasal 47", "Peraturan Akademik", "Sistem Penilaian", "Kurikulum OBE"]
  }
];

/**
 * Format sitasi gaya APA 7th Edition secara otomatis dari parameter buku / jurnal
 */
export function generateApaCitation(item: Partial<ReferenceItem>): string {
  const author = (item.authors || "Anonim").trim();
  const year = item.year ? `(${item.year}).` : "(n.d.).";
  const title = (item.title || "Tanpa Judul").trim();
  const publisherOrJournal = (item.publisherOrJournal || "").trim();
  const cityOrUrl = (item.cityOrUrl || "").trim();
  const doi = (item.doi || "").trim();

  let citation = `${author} ${year} ${title}.`;

  if (publisherOrJournal) {
    citation += ` ${publisherOrJournal}.`;
  }
  if (cityOrUrl && !cityOrUrl.startsWith("http")) {
    citation += ` ${cityOrUrl}.`;
  }
  if (doi) {
    const formattedDoi = doi.startsWith("http") ? doi : `https://doi.org/${doi}`;
    citation += ` ${formattedDoi}`;
  } else if (cityOrUrl && cityOrUrl.startsWith("http")) {
    citation += ` ${cityOrUrl}`;
  }

  return citation.replace(/\.\./g, ".").trim();
}

/**
 * Mengambil database pustaka tersimpan dari LocalStorage atau default
 */
export function getStoredReferences(): ReferenceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESEEDED_REFERENCES));
      return DEFAULT_PRESEEDED_REFERENCES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PRESEEDED_REFERENCES;
  } catch (err) {
    console.error("Gagal membaca database pustaka lokal:", err);
    return DEFAULT_PRESEEDED_REFERENCES;
  }
}

/**
 * Menyimpan / memperbarui item pustaka ke LocalStorage
 */
export function saveReference(item: ReferenceItem): ReferenceItem[] {
  const current = getStoredReferences();
  const index = current.findIndex((r) => r.id === item.id);
  let updated: ReferenceItem[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Gagal menyimpan pustaka ke localStorage:", err);
  }
  return updated;
}

/**
 * Menghapus item pustaka dari LocalStorage
 */
export function deleteReference(id: string): ReferenceItem[] {
  const current = getStoredReferences();
  const filtered = current.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Gagal menghapus pustaka dari localStorage:", err);
  }
  return filtered;
}

/**
 * Reset database pustaka ke koleksi standar UNPATTI
 */
export function resetReferenceDatabase(): ReferenceItem[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRESEEDED_REFERENCES));
  } catch (err) {
    console.error("Gagal reset database pustaka:", err);
  }
  return DEFAULT_PRESEEDED_REFERENCES;
}

/**
 * Ekspor koleksi pustaka ke string JSON
 */
export function exportReferencesJson(): string {
  const refs = getStoredReferences();
  return JSON.stringify(refs, null, 2);
}

/**
 * Impor koleksi pustaka dari string JSON
 */
export function importReferencesJson(jsonStr: string): ReferenceItem[] {
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) {
    throw new Error("Format berkas JSON tidak valid, harus berupa array data pustaka.");
  }
  // Validasi field minimal
  const valid = parsed.filter((r) => r.title && (r.authors || r.formattedCitation));
  if (valid.length === 0) {
    throw new Error("Tidak ditemukan entri pustaka yang valid dalam berkas JSON.");
  }
  const current = getStoredReferences();
  const currentIds = new Set(current.map((c) => c.id));
  const merged = [...current];

  for (const item of valid) {
    if (!item.id || currentIds.has(item.id)) {
      item.id = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }
    merged.push(item);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
