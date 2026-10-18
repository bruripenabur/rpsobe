import { CplItem, RpsData, SdgItem } from "../types/rps";
import { DEFAULT_OBE_RUBRICS } from "./defaultRubrics";
export { PIP_UNPATTI_LIST, PIP_CATEGORIES } from "./pipDefaults";
export {
  KKNI_LEVELS_LIST,
  KKNI_DESCRIPTORS_LIST,
  KKNI_CATEGORIES,
} from "./kkniDefaults";

export const UNPATTI_SDGS_LIST: SdgItem[] = [
  { id: 1, name: "Tanpa Kemiskinan (No Poverty)", color: "#e5243b" },
  { id: 2, name: "Tanpa Kelaparan (Zero Hunger)", color: "#dda63a" },
  { id: 3, name: "Kehidupan Sehat & Sejahtera (Good Health)", color: "#4c9f38" },
  { id: 4, name: "Pendidikan Berkualitas (Quality Education)", color: "#c5192d" },
  { id: 5, name: "Kesetaraan Gender (Gender Equality)", color: "#ff3a21" },
  { id: 6, name: "Air Bersih & Sanitasi Layak (Clean Water)", color: "#26bde2" },
  { id: 7, name: "Energi Bersih & Terjangkau (Clean Energy)", color: "#fcc30b" },
  { id: 8, name: "Pekerjaan Layak & Pertumbuhan Ekonomi (Decent Work)", color: "#a21942" },
  { id: 9, name: "Industri, Inovasi & Infrastruktur (Industry & Innovation)", color: "#fd6925" },
  { id: 10, name: "Berkurangnya Ketimpangan (Reduced Inequalities)", color: "#dd1367" },
  { id: 11, name: "Kota & Permukiman Berkelanjutan (Sustainable Cities)", color: "#fd9d24" },
  { id: 12, name: "Konsumsi & Produksi Bertanggung Jawab (Responsible Consumption)", color: "#bf8b2e" },
  { id: 13, name: "Penanganan Perubahan Iklim (Climate Action)", color: "#3f7e44" },
  { id: 14, name: "Ekosistem Lautan (Life Below Water)", color: "#0a97d9" },
  { id: 15, name: "Ekosistem Daratan (Life on Land)", color: "#56c02b" },
  { id: 16, name: "Perdamaian, Keadilan & Kelembagaan Tangguh (Peace & Justice)", color: "#00689d" },
  { id: 17, name: "Kemitraan untuk Mencapai Tujuan (Partnerships for the Goals)", color: "#19486a" },
];

export const CPL_OFFICIAL_PENYULUHAN: CplItem[] = [
  {
    id: "CPL1",
    category: "Sikap",
    desc: "Mampu mengimplementasikan perilaku hidup yang mencerminkan ketakwaan kepada Tuhan Yang Maha Esa, berdasarkan Pancasila serta menjunjung tinggi nilai kemanusiaan, berkontribusi peningkatan mutu peradaban bangsa, menjunjung nilai nasionalisme dan cinta tanah air, dan menghargai keanekaragaman budaya, agama, pandangan dan kepercayaan.",
  },
  {
    id: "CPL2",
    category: "Sikap",
    desc: "Mampu bekerja sama dan menunjukkan kepekaan sosial kepada masyarakat dan lingkungan, taat hukum, menginternalisasi nilai dan norma akademik yang benar terkait dengan kejujuran, etika, atribusi, hak cipta, kerahasiaan serta kepemilikan data, metode dan teknologi serta memiliki tanggungjawab dan sikap kemandirian.",
  },
  {
    id: "CPL3",
    category: "Keterampilan Khusus",
    desc: "Mampu menguasai dan mengaplikasikan sistem pertanian yang berbasis IPTEKS dengan ditunjang system digitalisasi untuk memecahkan masalah-masalah pertanian berbasis kepulauan.",
  },
  {
    id: "CPL4",
    category: "Keterampilan Khusus",
    desc: "Menguasai dan mengaplikasikan teori-teori komunikasi berbasis digital.",
  },
  {
    id: "CPL5",
    category: "Penguasaan Pengetahuan",
    desc: "Menguasai dan mengaplikasikan teori dan aplikasi ilmu manajemen, ilmu ekonomi, kewirausahaan, ilmu komputasi, ilmu social dan budaya, ilmu pertanian.",
  },
  {
    id: "CPL6",
    category: "Keterampilan Umum",
    desc: "Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi bidang pertanian.",
  },
  {
    id: "CPL7",
    category: "Keterampilan Umum",
    desc: "Mampu menyusun deskripsi saintifik hasil kajian pengembangan atau implementasi IPTEK bidang agribisnis dalam bentuk skripsi atau laporan tugas akhir dan selanjutnya unggah dalam laman perguruan tinggi.",
  },
  {
    id: "CPL8",
    category: "Keterampilan Umum",
    desc: "Mampu mengambil keputusan, mengembangkan jaringan, bertanggungjawab atas hasil kerja kelompok maupun evaluasi diri, melakukan supervisi dan evaluasi terhadap hasil kerja di bawah tanggungjawabnya, serta mendokumentasi, menyimpan dan menggunakan data untuk menjamin kesahihan data.",
  },
  {
    id: "CPL9",
    category: "Keterampilan Khusus",
    desc: "Mampu mengelola kegiatan penyuluhan pertanian sesuai perannya sebagai dinamisator, fasilitator, motivator dan katalisator untuk transformasi masyarakat.",
  },
  {
    id: "CPL10",
    category: "Keterampilan Khusus",
    desc: "Mampu mendesain perencanaan, monitoring dan evaluasi dalam implementasi sistem pertanian di wilayah kepulauan.",
  },
  {
    id: "CPL11",
    category: "Keterampilan Khusus",
    desc: "Mampu menguasai dan mengaplikasikan literasi data, literasi teknologi dan literasi manusia (etika komunikasi, negosiasi, leadership, inovasi, kreativitas) dan dalam membangun jejaring dengan stakeholders di bidang pertanian.",
  },
  {
    id: "CPL12",
    category: "Keterampilan Umum",
    desc: "Mampu bekerjasama dan berpartisipasi dalam pengambilan keputusan yang tepat dalam rangka membentuk kemandirian.",
  },
  {
    id: "CPL13",
    category: "Sikap",
    desc: "Mampu beradaptasi terhadap perubahan lingkungan dan kemajuan bidang ilmu pertanian.",
  },
];

export const EMPTY_RPS: RpsData = {
  namaKampus: "UNIVERSITAS PATTIMURA",
  namaFakultas: "",
  namaProdi: "",
  kodeDokumen: "",
  tglPengesahan: "",
  namaMK: "",
  kodeMK: "",
  rumpunMK: "MK Prodi",
  jenisMK: "Wajib",
  bobotSKS: 3,
  sksTeori: 2,
  sksPraktik: 1,
  semester: "Semester 1",
  revisiKe: "",
  koorMK: "",
  kaprodi: "",
  wadirAkademik: "",
  dosenPengampu: "",
  deskripsiMK: "",
  bahanKajian: "",
  daftarPustaka: "",
  selectedSdgs: [],
  selectedPipItems: [],
  selectedKkniLevels: [6],
  selectedKkniItems: [],
  jenjang: "S1",
  cplList: [],
  selectedCpls: [],
  cpmkList: [],
  subCpmkList: [],
  syllabusList: [],
  assessmentWeights: {
    partisipatif: 15,
    proyek: 40,
    tugas: 10,
    kuis: 5,
    uts: 15,
    uas: 15,
  },
  rubrics: [],
};

export const DEFAULT_KEMISKINAN_RPS: RpsData = {
  namaKampus: "UNIVERSITAS PATTIMURA",
  namaFakultas: "FAKULTAS PERTANIAN",
  namaProdi: "PROGRAM STUDI PENYULUHAN PERTANIAN",
  kodeDokumen: "PPP224127",
  tglPengesahan: "2025-07-01",
  namaMK: "Kemiskinan Multidimensional",
  kodeMK: "PPP224127",
  rumpunMK: "MK Prodi",
  jenisMK: "Wajib",
  bobotSKS: 3,
  sksTeori: 2,
  sksPraktik: 1,
  semester: "Semester 4",
  revisiKe: "01 (OBE System)",
  koorMK: "Prof. Ir. Wardis Girsang, M.Si, Ph.D",
  kaprodi: "Ir. F.P. Adam, M.Sc.",
  wadirAkademik: "Dr. Cynthia C. C. Lopulalan, S.P., M.Si.",
  dosenPengampu: "1. Prof. Ir. Wardis Girsang, M.Si, Ph.D; 2. Dr. Ir. L.O. Kakisina, M.Si; 3. Dr. J.D. Siwalette, S.P., M.Si.",
  deskripsiMK: `Mata kuliah Kemiskinan Multidimensional membahas konsep dan definisi kemiskinan, indikator dan pengukuran kemiskinan, teori-teori kemiskinan, serta kritik terhadap konsep kebudayaan kemiskinan. Pembelajaran selanjutnya mencakup isu dan teori pembangunan, Indeks Kemiskinan Manusia, pendekatan penanggulangan kemiskinan, serta pendekatan kemiskinan multidimensional yang memperhatikan berbagai dimensi kesejahteraan manusia.

Dalam konteks pembangunan pertanian dan wilayah kepulauan, mahasiswa diarahkan untuk menganalisis kemiskinan sebagai persoalan yang tidak hanya berkaitan dengan pendapatan, tetapi juga keterbatasan pendidikan, kesehatan, standar hidup, aksesibilitas, partisipasi sosial, dan kemampuan masyarakat dalam menghadapi perubahan. Mahasiswa diharapkan mampu mengidentifikasi persoalan kemiskinan, membaca data dan indikator, mengevaluasi alternatif kebijakan, serta bekerja sama dalam menyusun rekomendasi penanggulangan kemiskinan yang kontekstual, etis, dan berkelanjutan.`,
  bahanKajian: `1. Konsep Kemiskinan
2. Indikator Kemiskinan
3. Teori Kemiskinan
4. Tinjuan Kritis Konsep Kebudayaan Kemiskinan
5. Isu Dan Teori Pembangunan
6. Indeks Kemiskinan Manusia
7. Penanggulangan Kemiskinan
8. Kemiskinan Multidimensional`,
  daftarPustaka: `1. Alkire, S., & Foster, J. (2011). Counting and multidimensional poverty measurement. Journal of Public Economics, 95(7–8), 476–487.
2. Chambers, R. (1983). Rural development: Putting the last first. Longman.
3. Lewis, O. (1966). La vida: A Puerto Rican family in the culture of poverty—San Juan and New York. Random House.
4. Sen, A. (1999). Development as freedom. Alfred A. Knopf.
5. Townsend, P. (1979). Poverty in the United Kingdom: A survey of household resources and standards of living. University of California Press.
6. United Nations Development Programme. (1997). Human development report 1997. Oxford University Press.
7. World Bank. (2024). Poverty and Inequality Platform Database. World Bank Group.`,
  selectedSdgs: [1, 2, 8, 10],
  selectedPipItems: ["BMK-01", "BMK-02", "BMK-04", "BMK-05", "BMK-12"],
  selectedKkniLevels: [6],
  selectedKkniItems: ["KKNI-6.1", "KKNI-6.2", "KKNI-6.3", "KKNI-6.4"],
  jenjang: "S1",
  cplList: CPL_OFFICIAL_PENYULUHAN,
  selectedCpls: ["CPL1", "CPL2", "CPL3", "CPL6", "CPL8", "CPL10"],
  cpmkList: [
    { id: "CPMK 1", desc: "Mahasiswa mampu menjelaskan konsep dasar, definisi, indikator, dan teori kemiskinan serta perkembangan pendekatan kemiskinan multidimensional.", cplRefs: ["CPL1", "CPL2"] },
    { id: "CPMK 2", desc: "Mahasiswa mampu menganalisis kemiskinan berdasarkan perspektif sosial, ekonomi, budaya, dan pembangunan (termasuk tinjauan kritis kebudayaan kemiskinan).", cplRefs: ["CPL2", "CPL3"] },
    { id: "CPMK 3", desc: "Mahasiswa mampu mengidentifikasi, mengolah, menginterpretasikan, dan mendokumentasikan data serta indikator kemiskinan.", cplRefs: ["CPL3", "CPL6"] },
    { id: "CPMK 4", desc: "Mahasiswa mampu mengomunikasikan hasil analisis kemiskinan dan mengembangkan kerja sama serta jejaring dengan pemangku kepentingan secara etis.", cplRefs: ["CPL6", "CPL8"] },
    { id: "CPMK 5", desc: "Mahasiswa mampu mengevaluasi pendekatan dan kebijakan penanggulangan kemiskinan serta merumuskan rekomendasi yang adaptif dan kontekstual.", cplRefs: ["CPL8", "CPL10"] }
  ],
  subCpmkList: [
    { id: "Sub-CPMK 1", cpmkRef: "CPMK 1", bloom: "C2-Pemahaman", desc: "Mahasiswa mampu menjelaskan pengertian, definisi, karakteristik, penyebab, dan perkembangan konsep kemiskinan." },
    { id: "Sub-CPMK 2", cpmkRef: "CPMK 1", bloom: "C3-Penerapan", desc: "Mahasiswa mampu mengidentifikasi dan membedakan indikator kemiskinan absolut, relatif, subjektif, dan multidimensional." },
    { id: "Sub-CPMK 3", cpmkRef: "CPMK 1", bloom: "C4-Analisis", desc: "Mahasiswa mampu menjelaskan dan membandingkan teori-teori kemiskinan dari perspektif ekonomi, sosiologi, dan struktural." },
    { id: "Sub-CPMK 4", cpmkRef: "CPMK 2", bloom: "C4-Analisis", desc: "Mahasiswa mampu menganalisis secara kritis konsep kebudayaan kemiskinan dalam konteks masyarakat pedesaan dan kepulauan." },
    { id: "Sub-CPMK 5", cpmkRef: "CPMK 2", bloom: "C4-Analisis", desc: "Mahasiswa mampu menganalisis hubungan isu dan teori pembangunan dengan kemiskinan, ketimpangan, dan perubahan sosial." },
    { id: "Sub-CPMK 6", cpmkRef: "CPMK 3", bloom: "C2-Pemahaman", desc: "Mahasiswa mampu menjelaskan konsep, dimensi, indikator, dan prinsip pengukuran Indeks Kemiskinan Manusia." },
    { id: "Sub-CPMK 7", cpmkRef: "CPMK 3", bloom: "C3-Penerapan", desc: "Mahasiswa mampu mengolah dan menginterpretasikan data kemiskinan serta menyajikan hasilnya dengan etika akademik." },
    { id: "Sub-CPMK 8", cpmkRef: "CPMK 5", bloom: "C4-Analisis", desc: "Mahasiswa mampu menjelaskan dan membandingkan pendekatan serta strategi penanggulangan kemiskinan di berbagai tingkat wilayah." },
    { id: "Sub-CPMK 9", cpmkRef: "CPMK 3", bloom: "C4-Analisis", desc: "Mahasiswa mampu menganalisis kemiskinan multidimensional lintas dimensi sosial, ekonomi, kesehatan, pendidikan, dan standar hidup." },
    { id: "Sub-CPMK 10", cpmkRef: "CPMK 4", bloom: "C3-Penerapan", desc: "Mahasiswa mampu mengomunikasikan hasil kajian kemiskinan melalui presentasi dan media digital secara kolaboratif." },
    { id: "Sub-CPMK 11", cpmkRef: "CPMK 5", bloom: "C6-Kreasi", desc: "Mahasiswa mampu merumuskan rekomendasi penanggulangan kemiskinan berbasis data dan konteks pembangunan wilayah kepulauan." }
  ],
  syllabusList: [
    { week: "1", sub: "Sub-CPMK 1", materi: "Konsep, Definisi, Karakteristik dan Ruang Lingkup Kemiskinan", metode: "Kuliah interaktif, diskusi fenomena kemiskinan [BT: 2x(2x50''); PT: 2x(2x60''); BM: 2x(2x60'')]", asesmen: "Kehadiran & Partisipasi", indikator: "Ketepatan menjelaskan pengertian, definisi, karakteristik, penyebab, dan perkembangan konsep kemiskinan.", bobot: "5", isExam: false },
    { week: "2", sub: "Sub-CPMK 2", materi: "Konsep dan Indikator Kemiskinan: Absolut, Relatif, Subjektif, dan Multidimensional", metode: "Ceramah, studi kasus, latihan identifikasi indikator [BT: 2x(2x50''); PT: 2x(2x60''); BM: 2x(2x60'')]", asesmen: "Tugas Terstruktur", indikator: "Ketepatan mengidentifikasi dan membedakan indikator kemiskinan absolut, relatif, subjektif, dan multidimensional.", bobot: "6", isExam: false },
    { week: "3", sub: "Sub-CPMK 3", materi: "Teori Kemiskinan: Perspektif Ekonomi, Sosiologi, dan Struktural", metode: "Diskusi kelompok, telaah bacaan [BT: 2x(2x50''); PT: 2x(2x60''); BM: 2x(2x60'')]", asesmen: "Diskusi Kelompok", indikator: "Ketepatan menjelaskan dan membandingkan teori-teori kemiskinan dari perspektif ekonomi, sosiologi, dan struktural.", bobot: "6", isExam: false },
    { week: "4", sub: "Sub-CPMK 4", materi: "Tinjauan Kritis Konsep Kebudayaan Kemiskinan", metode: "Debat akademik, analisis artikel [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Analisis Artikel", indikator: "Ketepatan menganalisis secara kritis konsep kebudayaan kemiskinan, asumsi dasar, dan keterbatasannya.", bobot: "6", isExam: false },
    { week: "5", sub: "Sub-CPMK 5", materi: "Isu dan Teori Pembangunan: Modernisasi, Ketergantungan, Pembangunan Manusia", metode: "Kuliah, diskusi kasus pembangunan [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Tugas Mandiri", indikator: "Ketepatan menganalisis hubungan isu dan teori pembangunan dengan kemiskinan dan ketimpangan.", bobot: "6", isExam: false },
    { week: "6", sub: "Sub-CPMK 5", materi: "Kemiskinan, Ketimpangan, Perubahan Sosial dan Pembangunan Pertanian Kepulauan", metode: "Studi kasus pedesaan dan kepulauan [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Kuis Formatif 1", indikator: "Ketepatan menganalisis keterkaitan kemiskinan dengan pembangunan pertanian kepulauan.", bobot: "5", isExam: false },
    { week: "7", sub: "Sub-CPMK 6", materi: "Indeks Kemiskinan Manusia: Konsep, Dimensi, Indikator dan Pengukuran", metode: "Kuliah, latihan interpretasi indikator [BT: 1x(1x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Latihan Interpretasi", indikator: "Ketepatan menjelaskan konsep, dimensi, indikator, dan prinsip pengukuran Indeks Kemiskinan Manusia.", bobot: "6", isExam: false },
    { week: "8", sub: "Evaluasi", materi: "UJIAN TENGAH SEMESTER (UTS) - Evaluasi Materi Pertemuan 1 s.d. 7", metode: "Ujian Tertulis Terjadwal [BT: 1x(1x100''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Ujian UTS", indikator: "Penguasaan konseptual teori, indikator, dan pengukuran kemiskinan.", bobot: "15", isExam: true },
    { week: "9", sub: "Sub-CPMK 7", materi: "Sumber Data Kemiskinan, Literasi Data dan Etika Penggunaan Data", metode: "Praktik membaca data, diskusi validitas [BT: 1x(2x50''); PT: 1x(2x60''); BM: 1x(2x60'')]", asesmen: "Tugas Pengolahan Data", indikator: "Ketepatan mengolah dan menginterpretasikan data kemiskinan dengan etika akademik.", bobot: "6", isExam: false },
    { week: "10", sub: "Sub-CPMK 7 & Sub-CPMK 9", materi: "Pengukuran dan Analisis Kemiskinan Multidimensional (Alkire-Foster)", metode: "Praktik analisis indikator, kerja kelompok [BT: 2x(2x50''); PT: 2x(2x60''); BM: 2x(2x60'')]", asesmen: "Proyek Kelompok", indikator: "Ketepatan menganalisis kemiskinan multidimensional lintas dimensi sosial dan ekonomi.", bobot: "7", isExam: false },
    { week: "11", sub: "Sub-CPMK 9", materi: "Kemiskinan Multidimensional di Pedesaan dan Pulau-Pulau Kecil", metode: "Studi kasus, pemetaan masalah [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Laporan Pemetaan", indikator: "Ketepatan menganalisis karakteristik kemiskinan di wilayah kepulauan kecil.", bobot: "6", isExam: false },
    { week: "12", sub: "Sub-CPMK 8", materi: "Penanggulangan Kemiskinan: Perlindungan Sosial, Pemberdayaan, dan Ekonomi", metode: "Kuliah, diskusi kebijakan [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Kuis Formatif 2", indikator: "Ketepatan menjelaskan strategi penanggulangan kemiskinan pada berbagai tingkat.", bobot: "6", isExam: false },
    { week: "13", sub: "Sub-CPMK 8 & Sub-CPMK 11", materi: "Kebijakan Penanggulangan Kemiskinan dan Pembangunan Pertanian", metode: "Analisis kebijakan, studi kasus [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Analisis Kebijakan", indikator: "Ketepatan merumuskan rekomendasi penanggulangan kemiskinan kontekstual pertanian.", bobot: "6", isExam: false },
    { week: "14", sub: "Sub-CPMK 10", materi: "Komunikasi Digital, Partisipasi dan Jejaring Pemangku Kepentingan", metode: "Presentasi kelompok, simulasi komunikasi [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Presentasi Digital", indikator: "Ketepatan mengomunikasikan hasil kajian melalui media digital secara etis.", bobot: "5", isExam: false },
    { week: "15", sub: "Sub-CPMK 11", materi: "Penyusunan Rekomendasi Penanggulangan Kemiskinan Multidimensional", metode: "Proyek kelompok, konsultasi dan umpan balik [BT: 1x(2x50''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Portofolio Proyek", indikator: "Kualitas rumusan rekomendasi penanggulangan kemiskinan berbasis data lapangan.", bobot: "5", isExam: false },
    { week: "16", sub: "Evaluasi", materi: "UJIAN AKHIR SEMESTER (UAS) - Evaluasi Komprehensif Materi Pertemuan 9 s.d. 15", metode: "Ujian Tertulis Terjadwal [BT: 1x(1x100''); PT: 1x(1x60''); BM: 1x(1x60'')]", asesmen: "Ujian UAS", indikator: "Penguasaan menyeluruh analisis multidimensional dan strategi penanggulangan.", bobot: "15", isExam: true }
  ],
  assessmentWeights: {
    partisipatif: 15,
    proyek: 40,
    tugas: 10,
    kuis: 5,
    uts: 15,
    uas: 15,
  },
  rubrics: DEFAULT_OBE_RUBRICS,
};
