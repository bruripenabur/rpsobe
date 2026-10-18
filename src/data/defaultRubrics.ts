import { CourseObjectiveRubric } from "../types/rubric";

export const DEFAULT_OBE_RUBRICS: CourseObjectiveRubric[] = [
  {
    id: "rubric-cpmk-1",
    objectiveType: "CPMK",
    objectiveRef: "CPMK 1",
    objectiveTitle:
      "Mahasiswa mampu menjelaskan konsep dasar, definisi, indikator, dan teori kemiskinan serta perkembangan pendekatan kemiskinan multidimensional.",
    assessmentMethod: "Kuis Formatif & Diskusi Kelas Partisipatif",
    targetBloomLevel: "C2-Pemahaman",
    criteria: [
      {
        id: "crit-1-1",
        name: "Penguasaan Konsep & Terminologi Kemiskinan",
        indicator:
          "Ketepatan mendefinisikan dan membedakan kemiskinan absolut, relatif, subjektif, dan multidimensional secara ilmiah.",
        weightPercent: 40,
        levels: {
          sangatBaik:
            "Mampu menjelaskan seluruh konsep kemiskinan dengan definisi tepat, runut, disertai contoh komparatif yang sangat relevan tanpa kekeliruan terminologis.",
          baik: "Mampu menjelaskan konsep dasar kemiskinan dengan benar dan memberikan contoh pendukung, terdapat ketidaktepatan minor pada aspek nuansa teoritis.",
          cukup:
            "Hanya menjelaskan kemiskinan moneter standar tanpa pemahaman komprehensif atas dimensi non-pendapatan / multidimensional.",
          kurang:
            "Definisi kemiskinan tidak tepat, mencampuradukkan konsep dasar, dan gagal memahami indikator kemiskinan.",
        },
      },
      {
        id: "crit-1-2",
        name: "Sintesis Teori & Paradigma Kemiskinan",
        indicator:
          "Kemampuan membandingkan pendekatan teori kemiskinan struktural, kultural, dan kapabilitas (Amartya Sen).",
        weightPercent: 35,
        levels: {
          sangatBaik:
            "Analisis komparatif teori sangat tajam, menyoroti relasi kekuasaan, determinan struktural, dan relevansi pendekatan kapabilitas kesejahteraan.",
          baik: "Mampu membandingkan minimal dua perspektif teori secara memadai dengan argumentasi yang jelas dan logis.",
          cukup:
            "Penjelasan sebatas ringkasan deskriptif tanpa telaah perbandingan kritis yang mendalam antarteori.",
          kurang:
            "Gagal membedakan teori kemiskinan; pemahaman sebatas pengetahuan umum tanpa rujukan akademis.",
        },
      },
      {
        id: "crit-1-3",
        name: "Artikulasi Akademik & Partisipasi Diskusi",
        indicator:
          "Kemampuan menyuarakan gagasan secara santun, ilmiah, dan berbasis fakta/data.",
        weightPercent: 25,
        levels: {
          sangatBaik:
            "Artikulasi sangat lugas, rujukan ilmiah kuat, aktif memicu diskusi kritis yang memperkaya pemahaman kelas.",
          baik: "Menyampaikan pemikiran dengan jelas, merespons pertanyaan dengan baik dan santun.",
          cukup:
            "Cenderung pasif, berpartisipasi hanya saat ditunjuk dengan respons yang singkat.",
          kurang:
            "Tidak menunjukkan partisipasi aktif atau tidak mampu memberikan argumen akademis.",
        },
      },
    ],
  },
  {
    id: "rubric-cpmk-3",
    objectiveType: "CPMK",
    objectiveRef: "CPMK 3",
    objectiveTitle:
      "Mahasiswa mampu mengidentifikasi, mengolah, menginterpretasikan, dan mendokumentasikan data serta indikator kemiskinan.",
    assessmentMethod: "Praktikum Laboratorium Komputasi & Studi Kasus",
    targetBloomLevel: "C3-Penerapan",
    criteria: [
      {
        id: "crit-3-1",
        name: "Presisi Pengolahan Data Kemiskinan & MPI (Alkire-Foster)",
        indicator:
          "Ketelitian dalam menghitung headcount ratio (H), intensity (A), dan Multidimensional Poverty Index (MPI).",
        weightPercent: 40,
        levels: {
          sangatBaik:
            "Kalkulasi angka kemiskinan multidimensional sempurna, prosedur dekomposisi data tepat, dan verifikasi silang data terbukti akurat.",
          baik: "Kalkulasi data dan dekomposisi dimensi kemiskinan benar dengan sedikit kekeliruan teknis minor yang tidak mengubah simpulan akhir.",
          cukup:
            "Perhitungan matematis memiliki kekeliruan perhitungan atau ketidaktahuan dalam mengalokasikan bobot dimensi indikator.",
          kurang:
            "Perhitungan salah mendasar, data acak, dan tidak memahami metodologi indeks kemiskinan.",
        },
      },
      {
        id: "crit-3-2",
        name: "Interpretasi Signifikansi Data Kontekstual Kepulauan",
        indicator:
          "Ketepatan membaca tren data kemiskinan antarwilayah kepulauan dan menarik inferensi analitis.",
        weightPercent: 35,
        levels: {
          sangatBaik:
            "Interpretasi grafik/tabel sangat mendalam, mengaitkan variasi deprivasi dengan kondisi geografis pulau-pulau kecil dan konektivitas logistik.",
          baik: "Mampu menjelaskan makna angka dan tabel statistik kemiskinan secara tepat dengan konteks kedaerahan yang wajar.",
          cukup:
            "Hanya membaca ulang angka yang tertera di tabel tanpa memberikan analisis makna di balik angka.",
          kurang:
            "Salah menafsirkan data statistik dan menarik kesimpulan yang bertentangan dengan tren data riil.",
        },
      },
      {
        id: "crit-3-3",
        name: "Validitas Sumber & Etika Integritas Data",
        indicator:
          "Kepatuhan terhadap atribusi data resmi (BPS, Bank Dunia, OpenAlex) dan kejujuran ilmiah.",
        weightPercent: 25,
        levels: {
          sangatBaik:
            "Seluruh metadata, rujukan sumber, tahun pencatatan, dan keterbatasan data didokumentasikan secara teliti dan mematuhi etika akademik.",
          baik: "Mencantumkan sumber primer dengan format rujukan standar tanpa manipulasi data.",
          cukup:
            "Pencantuman sumber kurang lengkap (tanpa tahun atau tautan resmi institusi).",
          kurang:
            "Tidak mencantumkan sumber data, asal-usul data fiktif, atau manipulasi data angka.",
        },
      },
    ],
  },
  {
    id: "rubric-cpmk-5",
    objectiveType: "CPMK",
    objectiveRef: "CPMK 5",
    objectiveTitle:
      "Mahasiswa mampu mengevaluasi pendekatan dan kebijakan penanggulangan kemiskinan serta merumuskan rekomendasi yang adaptif dan kontekstual.",
    assessmentMethod: "Laporan Hasil Proyek Tim & Presentasi Akhir",
    targetBloomLevel: "C6-Kreasi",
    criteria: [
      {
        id: "crit-5-1",
        name: "Orisinalitas & Kelayakan Rekomendasi Solusi Berkelanjutan",
        indicator:
          "Kekuatan gagasan intervensi kemiskinan berbasis potensi lokal agromaritim wilayah kepulauan.",
        weightPercent: 40,
        levels: {
          sangatBaik:
            "Rekomendasi bersifat terobosan (inovatif), terukur, sangat kontekstual dengan karakteristik kepulauan Maluku, dan terintegrasi dengan target SDGs.",
          baik: "Rekomendasi aplikatif, didasari data empiris, dan dapat diimplementasikan oleh pemangku kepentingan tingkat kabupaten/negeri.",
          cukup:
            "Rekomendasi bersifat generik/klasik, belum mempertimbangkan tantangan spesifik transportasi antar-pulau.",
          kurang:
            "Rekomendasi mengambang, tidak realistis, dan tidak relevan dengan akar persoalan yang diidentifikasi.",
        },
      },
      {
        id: "crit-5-2",
        name: "Evaluasi Kritis Kebijakan Eksisting",
        indicator:
          "Ketajaman dalam menganalisis keberhasilan dan distorsi kebijakan bansos/pemberdayaan sebelumnya.",
        weightPercent: 30,
        levels: {
          sangatBaik:
            "Evaluasi komprehensif membedah ketepatan sasaran, leakage (exclusion/inclusion errors), dan keberlanjutan dampak kebijakan program.",
          baik: "Mampu menunjukkan kelebihan dan kelemahan kebijakan eksisting secara objektif dengan argumen berbasis bukti.",
          cukup:
            "Evaluasi normatif sebatas opini umum tanpa didukung kajian bukti empiris lapangan.",
          kurang:
            "Gagal mengidentifikasi kegagalan implementasi kebijakan sebelumnya.",
        },
      },
      {
        id: "crit-5-3",
        name: "Kualitas Laporan Portofolio & Kolaborasi Tim",
        indicator:
          "Sistematika penulisan saintifik, tata bahasa akademik, visualisasi infografis, dan pembagian peran.",
        weightPercent: 30,
        levels: {
          sangatBaik:
            "Laporan terstruktur sangat rapi, infografis komunikatif dan estetis, kolaborasi tim solid dan harmonis.",
          baik: "Laporan memenuhi struktur baku karya ilmiah dengan visualisasi data pendukung yang rapi.",
          cukup:
            "Format laporan kurang konsisten, tata letak data berantakan, keterlibatan anggota tim timpang.",
          kurang:
            "Laporan tidak memenuhi kaidah penulisan akademik dan koordinasi tim buruk.",
        },
      },
    ],
  },
];
