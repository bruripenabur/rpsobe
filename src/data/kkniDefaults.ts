import { KkniDescriptorItem, KkniLevelOption } from "../types/rps";

/**
 * Kerangka Kualifikasi Nasional Indonesia (KKNI) Khusus Jenjang Perguruan Tinggi (Level 6 - 9)
 * Berdasarkan:
 * 1. Peraturan Presiden Republik Indonesia Nomor 8 Tahun 2012 tentang KKNI
 * 2. Permendikbudristek Nomor 39 Tahun 2025 & Permendikbudristek Nomor 10 Tahun 2026
 * 3. Panduan Penyusunan Kurikulum Pendidikan Tinggi Berbasis OBE (Ditjen Diktiristek)
 */

export const KKNI_LEVELS_LIST: KkniLevelOption[] = [
  {
    level: 6,
    label: "Level 6: Sarjana (S1) & Sarjana Terapan (D4)",
    degree: "S1 / D4",
    color: "emerald",
    description:
      "Aplikasi IPTEKS, penguasaan konsep teoretis umum & mendalam, pemecahan masalah prosedural, pengambilan keputusan data-driven, dan tanggung jawab hasil kerja organisasi.",
  },
  {
    level: 7,
    label: "Level 7: Pendidikan Profesi",
    degree: "Profesi",
    color: "amber",
    description:
      "Pengelolaan sumber daya, evaluasi komprehensif, pendekatan monodisipliner, riset operasional strategis, dan kepatuhan kode etik asosiasi profesi.",
  },
  {
    level: 8,
    label: "Level 8: Magister (S2), Terapan & Spesialis 1",
    degree: "S2 / Sp-1",
    color: "blue",
    description:
      "Pengembangan IPTEKS melalui riset inovatif teruji, pendekatan inter/multidisipliner, manajemen riset berdampak luas, dan publikasi jurnal bereputasi.",
  },
  {
    level: 9,
    label: "Level 9: Doktoral (S3), Terapan & Spesialis 2",
    degree: "S3 / Sp-2",
    color: "purple",
    description:
      "Penemuan IPTEKS baru & original melalui riset filosofis teruji, pendekatan transdisipliner, kepemimpinan riset global, dan pemajuan batas ilmu pengetahuan.",
  },
];

export const KKNI_CATEGORIES = [
  "Semua Kategori",
  "Kemampuan Kerja",
  "Penguasaan Pengetahuan",
  "Manajerial & Pengambilan Keputusan",
  "Sikap & Akuntabilitas",
] as const;

export const KKNI_DESCRIPTORS_LIST: KkniDescriptorItem[] = [
  // ====================== LEVEL 6 (SARJANA S1 / D4) ======================
  {
    id: "KKNI-6.1",
    code: "KKNI-6.1",
    level: 6,
    levelTitle: "Sarjana (S1) / D4",
    title: "Aplikasi IPTEKS & Adaptabilitas Masalah",
    category: "Kemampuan Kerja",
    description:
      "Mampu mengaplikasikan bidang keahliannya dan memanfaatkan ilmu pengetahuan, teknologi, dan/atau seni pada bidangnya dalam penyelesaian masalah serta mampu beradaptasi terhadap situasi yang dihadapi.",
    focus: "Aplikasi praktis IPTEKS & adaptasi terhadap tantangan lapangan riil",
    keywords: ["aplikasi ipteks", "pemecahan masalah", "adaptasi", "sarjana", "s1"],
  },
  {
    id: "KKNI-6.2",
    code: "KKNI-6.2",
    level: 6,
    levelTitle: "Sarjana (S1) / D4",
    title: "Penguasaan Konsep Teoretis & Solusi Prosedural",
    category: "Penguasaan Pengetahuan",
    description:
      "Menguasai konsep teoretis bidang pengetahuan tertentu secara umum dan konsep teoretis bagian khusus dalam bidang pengetahuan tersebut secara mendalam, serta mampu memformulasikan penyelesaian masalah prosedural.",
    focus: "Fondasi konsep teoretis mendalam & formulasi prosedur standar",
    keywords: ["teori mendalam", "prosedural", "konseptual", "fondasi sains", "s1"],
  },
  {
    id: "KKNI-6.3",
    code: "KKNI-6.3",
    level: 6,
    levelTitle: "Sarjana (S1) / D4",
    title: "Pengambilan Keputusan Berbasis Analisis Data",
    category: "Manajerial & Pengambilan Keputusan",
    description:
      "Mampu mengambil keputusan yang tepat berdasarkan analisis informasi dan data, dan mampu memberikan petunjuk dalam memilih berbagai alternatif solusi secara mandiri dan kelompok.",
    focus: "Analisis data kuantitatif/kualitatif & rekomendasi alternatif solusi",
    keywords: ["analisis data", "pengambilan keputusan", "solusi mandiri kelompok", "evaluasi"],
  },
  {
    id: "KKNI-6.4",
    code: "KKNI-6.4",
    level: 6,
    levelTitle: "Sarjana (S1) / D4",
    title: "Tanggung Jawab Hasil Kerja & Akuntabilitas Organisasi",
    category: "Sikap & Akuntabilitas",
    description:
      "Bertanggung jawab pada pekerjaan sendiri dan dapat diberi tanggung jawab atas pencapaian hasil kerja organisasi dengan menjunjung etika akademik dan profesional.",
    focus: "Akuntabilitas mandiri & kontribusi capaian target tim/organisasi",
    keywords: ["tanggung jawab", "akuntabilitas", "etika profesi", "kinerja tim"],
  },

  // ====================== LEVEL 7 (PENDIDIKAN PROFESI) ======================
  {
    id: "KKNI-7.1",
    code: "KKNI-7.1",
    level: 7,
    levelTitle: "Pendidikan Profesi",
    title: "Manajemen Sumber Daya & Perencanaan Strategis",
    category: "Kemampuan Kerja",
    description:
      "Mampu merencanakan dan mengelola sumberdaya di bawah tanggung jawabnya, dan mengevaluasi secara komprehensif kerjanya dengan memanfaatkan IPTEKS untuk menghasilkan langkah pengembangan strategis organisasi.",
    focus: "Alokasi sumber daya, evaluasi komprehensif & pengembangan strategis",
    keywords: ["perencanaan sumberdaya", "evaluasi komprehensif", "pengembangan strategis", "profesi"],
  },
  {
    id: "KKNI-7.2",
    code: "KKNI-7.2",
    level: 7,
    levelTitle: "Pendidikan Profesi",
    title: "Pemecahan Masalah Sains/Teknologi Monodisipliner",
    category: "Penguasaan Pengetahuan",
    description:
      "Mampu memecahkan permasalahan sains, teknologi, dan/atau seni di dalam bidang keilmuannya melalui pendekatan monodisipliner yang aplikatif dan presisi tinggi.",
    focus: "Keahlian spesifik bidang monodisipliner & diagnosa klinis/praktis",
    keywords: ["monodisipliner", "spesialisasi", "presisi", "pemecahan masalah profesi"],
  },
  {
    id: "KKNI-7.3",
    code: "KKNI-7.3",
    level: 7,
    levelTitle: "Pendidikan Profesi",
    title: "Riset Terapan & Keputusan Strategis Berakuntabilitas Penuh",
    category: "Manajerial & Pengambilan Keputusan",
    description:
      "Mampu melakukan riset operasional dan mengambil keputusan strategis dengan akuntabilitas dan tanggung jawab penuh atas semua aspek yang berada di bawah tanggung jawab bidang keahliannya.",
    focus: "Riset terapan lapangan & pertanggungjawaban legal/profesional",
    keywords: ["riset terapan", "keputusan strategis", "tanggung jawab penuh", "otoritas"],
  },
  {
    id: "KKNI-7.4",
    code: "KKNI-7.4",
    level: 7,
    levelTitle: "Pendidikan Profesi",
    title: "Kepatuhan Kode Etik Profesi & Standar Pelayanan Mutu",
    category: "Sikap & Akuntabilitas",
    description:
      "Mengelola praktik profesi secara mandiri dan bertanggung jawab sesuai kode etik asosiasi profesi, regulasi hukum, dan standar kompetensi kerja nasional/internasional.",
    focus: "Kode etik profesi, integritas moral & standar mutu pelayanan",
    keywords: ["kode etik", "standar profesi", "regulasi", "pelayanan publik"],
  },

  // ====================== LEVEL 8 (MAGISTER S2 / SPESIALIS 1) ======================
  {
    id: "KKNI-8.1",
    code: "KKNI-8.1",
    level: 8,
    levelTitle: "Magister (S2) / Sp-1",
    title: "Pengembangan IPTEKS Melalui Riset Inovatif & Teruji",
    category: "Kemampuan Kerja",
    description:
      "Mampu mengembangkan pengetahuan, teknologi, dan/atau seni di dalam bidang keilmuannya atau praktek profesionalnya melalui riset, hingga menghasilkan karya inovatif dan teruji.",
    focus: "Riset saintifik inovatif, kebaruan teruji & paten/hki",
    keywords: ["riset inovatif", "teruji", "pengembangan ipteks", "magister", "s2"],
  },
  {
    id: "KKNI-8.2",
    code: "KKNI-8.2",
    level: 8,
    levelTitle: "Magister (S2) / Sp-1",
    title: "Pendekatan Interdisipliner & Multidisipliner",
    category: "Penguasaan Pengetahuan",
    description:
      "Mampu memecahkan permasalahan sains, teknologi, dan/atau seni di dalam bidang keilmuannya melalui pendekatan interdisipliner atau multidisipliner yang integratif.",
    focus: "Sintesis lintas disiplin ilmu untuk memecahkan persoalan kompleks",
    keywords: ["interdisipliner", "multidisipliner", "sintesis ilmu", "kompleksitas"],
  },
  {
    id: "KKNI-8.3",
    code: "KKNI-8.3",
    level: 8,
    levelTitle: "Magister (S2) / Sp-1",
    title: "Manajemen Riset & Rekognisi Nasional/Internasional",
    category: "Manajerial & Pengambilan Keputusan",
    description:
      "Mampu mengelola riset dan pengembangan yang bermanfaat bagi masyarakat dan keilmuan, serta mampu mendapat pengakuan nasional dan internasional.",
    focus: "Manajemen hibah riset, kolaborasi antar lembaga & rekognisi pakar",
    keywords: ["manajemen riset", "rekognisi nasional", "internasional", "pemberdayaan"],
  },
  {
    id: "KKNI-8.4",
    code: "KKNI-8.4",
    level: 8,
    levelTitle: "Magister (S2) / Sp-1",
    title: "Publikasi Ilmiah Bereputasi & Diseminasi Sains",
    category: "Sikap & Akuntabilitas",
    description:
      "Mampu mengomunikasikan dan mempublikasikan hasil riset pada jurnal ilmiah nasional terakreditasi (SINTA) atau jurnal internasional bereputasi secara terbuka dan berintegritas.",
    focus: "Diseminasi peer-reviewed journal & etika integritas riset saintifik",
    keywords: ["publikasi sinta", "jurnal internasional", "diseminasi riset", "sitasi"],
  },

  // ====================== LEVEL 9 (DOKTORAL S3 / SPESIALIS 2) ======================
  {
    id: "KKNI-9.1",
    code: "KKNI-9.1",
    level: 9,
    levelTitle: "Doktoral (S3) / Sp-2",
    title: "Penemuan IPTEKS Baru & Original Melalui Riset Filosofis",
    category: "Kemampuan Kerja",
    description:
      "Mampu menemukan atau mengembangkan teori, konsep, teknologi, dan/atau seni baru di dalam bidang keilmuannya melalui riset mandiri, hingga menghasilkan karya kreatif, original, dan teruji.",
    focus: "Novelty (kebaruan ilmiah original), penemuan teori baru & landasan epistemologis",
    keywords: ["novelty", "original", "penemuan teori baru", "doktor", "s3"],
  },
  {
    id: "KKNI-9.2",
    code: "KKNI-9.2",
    level: 9,
    levelTitle: "Doktoral (S3) / Sp-2",
    title: "Pendekatan Transdisipliner & Solusi Permasalahan Global",
    category: "Penguasaan Pengetahuan",
    description:
      "Mampu memecahkan permasalahan sains, teknologi, dan/atau seni di dalam bidang keilmuannya melalui pendekatan inter, multi, atau transdisipliner yang melampaui sekat sektoral.",
    focus: "Paradigma transdisipliner & transformasi peradaban/kemanusiaan",
    keywords: ["transdisipliner", "paradigma baru", "solusi global", "holistik"],
  },
  {
    id: "KKNI-9.3",
    code: "KKNI-9.3",
    level: 9,
    levelTitle: "Doktoral (S3) / Sp-2",
    title: "Kepemimpinan Riset Dunia & Kemaslahatan Kemanusiaan",
    category: "Manajerial & Pengambilan Keputusan",
    description:
      "Mampu mengelola, memimpin, dan mengembangkan peta jalan (roadmap) riset strategis yang bermanfaat bagi kemajuan ilmu pengetahuan dan kemaslahatan umat manusia di tingkat global.",
    focus: "Research leadership global, pembentukan konsorsium riset internasional",
    keywords: ["research leadership", "roadmap riset", "kemaslahatan global", "pemimpin riset"],
  },
  {
    id: "KKNI-9.4",
    code: "KKNI-9.4",
    level: 9,
    levelTitle: "Doktoral (S3) / Sp-2",
    title: "Pengembangan Paradigma Keilmuan & Integritas Frontier",
    category: "Sikap & Akuntabilitas",
    description:
      "Menguasai filosofi keilmuan mutakhir dan mampu berkontribusi nyata pada pergeseran paradigma (paradigm shift) melalui publikasi global bereputasi tinggi (Scopus/WoS Q1).",
    focus: "Frontier of science, filsafat keilmuan mutakhir & publikasi bereputasi tinggi",
    keywords: ["paradigm shift", "frontier of science", "filsafat ilmu", "scopus q1"],
  },
];
