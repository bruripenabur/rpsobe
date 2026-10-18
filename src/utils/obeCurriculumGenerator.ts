import { RpsData, CpmkItem, SubCpmkItem, SyllabusWeek } from "../types/rps";
import { CourseObjectiveRubric } from "../types/rubric";
import { CPL_OFFICIAL_PENYULUHAN, PIP_UNPATTI_LIST } from "../data/unpattiDefaults";

/**
 * Otomatis menghasilkan CPMK, Sub-CPMK, Silabus 16 Minggu, dan Rubrik Penilaian OBE
 * berdasarkan:
 * - CPL prodi yang dipilih
 * - Pilihan jenjang KKNI
 * - Pilihan PIP Bina Mulia Ke Lautan
 * - Pilihan SDGs
 * - Judul Mata Kuliah
 * - SKS
 * - Deskripsi singkat
 * - Daftar Pustaka
 */
export async function generateObeCurriculumComponents(
  currentData: RpsData,
  onProgress?: (msg: string) => void
): Promise<{
  cpmkList: CpmkItem[];
  subCpmkList: SubCpmkItem[];
  bahanKajian?: string;
  rubrics: CourseObjectiveRubric[];
  syllabusList: SyllabusWeek[];
  deskripsiMK?: string;
  analisisOBE?: any;
}> {
  onProgress?.("Gemini AI menghubungkan CPL, SDGs, PIP, dan KKNI untuk merumuskan kurikulum...");

  // Dapatkan rincian teks CPL yang dicentang
  const selectedCplDetails = (currentData.selectedCpls || []).map((id) => {
    const found = (currentData.cplList || []).find((c) => c.id === id);
    return found ? { id: found.id, category: found.category, desc: found.desc } : { id };
  });

  // Coba panggil Gemini AI jika endpoint backend tersedia
  try {
    const res = await fetch("/api/gemini/generate-curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName: currentData.namaMK,
        courseCode: currentData.kodeMK,
        sks: currentData.bobotSKS,
        semester: currentData.semester,
        jenjang: currentData.jenjang,
        selectedCpls: currentData.selectedCpls,
        cplDetails: selectedCplDetails,
        selectedSdgs: currentData.selectedSdgs,
        selectedPipItems: currentData.selectedPipItems,
        selectedKkniLevels: currentData.selectedKkniLevels,
        selectedKkniItems: currentData.selectedKkniItems,
        courseDescription: currentData.deskripsiMK,
        studyProgram: currentData.namaProdi,
        faculty: currentData.namaFakultas,
        university: currentData.namaKampus,
        focusTopic: `${currentData.deskripsiMK}\nBahan kajian: ${currentData.bahanKajian}\nPustaka: ${currentData.daftarPustaka}`,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const cpmkList: CpmkItem[] = Array.isArray(d.cpmk)
          ? d.cpmk.map((c: any, i: number) => ({
              id: c.id || `CPMK ${i + 1}`,
              desc: c.desc || String(c),
            }))
          : [];

        const subCpmkList: SubCpmkItem[] = Array.isArray(d.subCpmk)
          ? d.subCpmk.map((s: any, i: number) => ({
              id: s.id || `Sub-CPMK ${i + 1}`,
              cpmkRef: s.cpmkRef || (cpmkList[0]?.id || "CPMK 1"),
              bloom: s.bloom || "C3-Penerapan",
              desc: s.desc || String(s),
            }))
          : [];

        let syllabusList: SyllabusWeek[] = [];
        if (Array.isArray(d.syllabus16Weeks) && d.syllabus16Weeks.length >= 14) {
          syllabusList = d.syllabus16Weeks;
        }

        if (cpmkList.length > 0 && subCpmkList.length > 0) {
          const rubrics = generateDefaultObeRubrics(currentData.namaMK, cpmkList);
          return {
            cpmkList,
            subCpmkList,
            bahanKajian: d.bahanKajian || undefined,
            rubrics,
            syllabusList: syllabusList.length >= 14 ? syllabusList : generateDefaultSyllabus(currentData.namaMK, subCpmkList),
            deskripsiMK: d.deskripsiMK || undefined,
            analisisOBE: d.analisisOBE || undefined,
          };
        }
      }
    }
  } catch (err) {
    console.warn("AI generation fallback to deterministic OBE generator:", err);
  }

  // Fallback Deterministik Standar OBE UNPATTI
  return generateDeterministicObe(currentData);
}

/**
 * Generator OBE Deterministik Standar Kurikulum UNPATTI
 */
export function generateDeterministicObe(data: RpsData): {
  cpmkList: CpmkItem[];
  subCpmkList: SubCpmkItem[];
  bahanKajian: string;
  rubrics: CourseObjectiveRubric[];
  syllabusList: SyllabusWeek[];
} {
  const mk = data.namaMK || "Mata Kuliah";
  const prodi = data.namaProdi || "Program Studi";
  const kkniLvl = (data.selectedKkniLevels && data.selectedKkniLevels[0]) || 6;

  // Analisis CPL terpilih
  const cplCodes = (data.selectedCpls && data.selectedCpls.length > 0)
    ? data.selectedCpls
    : ["CPL1", "CPL2", "CPL3", "CPL6", "CPL8", "CPL10"];

  const hasPIP = (data.selectedPipItems || []).length > 0;
  const pipDesc = hasPIP ? "berorientasi Pola Ilmiah Pokok Bina Mulia Ke Lautan (PIP-BMK)" : "berbasis keilmuan mutakhir";

  // 1. CPMK
  const cpmkList: CpmkItem[] = [
    {
      id: "CPMK 1",
      desc: `Mahasiswa mampu menguasai landasan teoretis, konsep kunci, dan terminologi fundamental ${mk} secara komprehensif dan kritis.`,
      cplRefs: ["CPL1", "CPL2"],
    },
    {
      id: "CPMK 2",
      desc: `Mahasiswa mampu menganalisis permasalahan riil dan dinamika kontekstual dalam ${mk} ${pipDesc} di wilayah kepulauan Maluku.`,
      cplRefs: ["CPL2", "CPL3"],
    },
    {
      id: "CPMK 3",
      desc: `Mahasiswa mampu menerapkan metodologi ilmiah, literasi data, dan instrumen analisis terukur untuk memecahkan problematika ${mk} sesuai standar KKNI Level ${kkniLvl}.`,
      cplRefs: ["CPL3", "CPL6"],
    },
    {
      id: "CPMK 4",
      desc: `Mahasiswa mampu merancang strategi intervensi, rekomendasi kebijakan, atau purwarupa solusi kolaboratif yang terintegrasi dengan tujuan pembangunan berkelanjutan (SDGs).`,
      cplRefs: ["CPL6", "CPL8"],
    },
    {
      id: "CPMK 5",
      desc: `Mahasiswa mampu mengomunikasikan hasil analisis, bersikap mandiri dan bertanggung jawab, serta menjunjung tinggi etika akademik dan kearifan lokal dalam konteks ${mk}.`,
      cplRefs: ["CPL8", "CPL10"],
    },
  ];

  // 2. Sub-CPMK (Gradasi Taksonomi Bloom C2 - C6)
  const subCpmkList: SubCpmkItem[] = [
    {
      id: "Sub-CPMK 1",
      cpmkRef: "CPMK 1",
      bloom: "C2-Pemahaman",
      desc: `Mampu menjelaskan ruang lingkup, perkembangan historis, dan konsep dasar ${mk}.`,
    },
    {
      id: "Sub-CPMK 2",
      cpmkRef: "CPMK 1",
      bloom: "C2-Pemahaman",
      desc: `Mampu mengidentifikasi kerangka konseptual dan teori-teori utama pendukung ${mk}.`,
    },
    {
      id: "Sub-CPMK 3",
      cpmkRef: "CPMK 2",
      bloom: "C4-Analisis",
      desc: `Mampu menganalisis faktor determinan dan karakteristik multidimensional persoalan ${mk} pada konteks sosial-ekologis kepulauan.`,
    },
    {
      id: "Sub-CPMK 4",
      cpmkRef: "CPMK 2",
      bloom: "C4-Analisis",
      desc: `Mampu membedah studi kasus empiris mengenai dinamika komunitas dan tantangan keberlanjutan terkait ${mk}.`,
    },
    {
      id: "Sub-CPMK 5",
      cpmkRef: "CPMK 3",
      bloom: "C3-Penerapan",
      desc: `Mampu menghitung, mengolah, dan memvisualisasikan data kuantitatif dan kualitatif instrumen ${mk}.`,
    },
    {
      id: "Sub-CPMK 6",
      cpmkRef: "CPMK 3",
      bloom: "C3-Penerapan",
      desc: `Mampu menerapkan teknik asesmen dan instrumen pengukuran langsung di lapangan atau simulasi laboratorium.`,
    },
    {
      id: "Sub-CPMK 7",
      cpmkRef: "CPMK 4",
      bloom: "C5-Evaluasi",
      desc: `Mampu mengevaluasi efektivitas program dan kebijakan penanganan masalah ${mk} yang pernah diimplementasikan.`,
    },
    {
      id: "Sub-CPMK 8",
      cpmkRef: "CPMK 4",
      bloom: "C6-Kreasi",
      desc: `Mampu merumuskan proposal inovasi proyek kolaboratif berbasis potensi lokal kepulauan dan target SDGs.`,
    },
    {
      id: "Sub-CPMK 9",
      cpmkRef: "CPMK 5",
      bloom: "C6-Kreasi",
      desc: `Mampu mempresentasikan hasil proyek secara saintifik, argumentatif, dan etis kepada pemangku kepentingan.`,
    },
  ];

  // 3. Bahan Kajian Terstruktur
  const bahanKajian = [
    `1. Landasan Filosofis, Konseptual, dan Perkembangan Teoretis ${mk}`,
    `2. Karakteristik, Tipologi, dan Kerangka Analisis Terkait ${mk}`,
    `3. Dimensi Kebijakan, SDGs (Tujuan Pembangunan Berkelanjutan), dan Tata Kelola`,
    `4. Pendekatan Kontekstual Kepulauan Maluku & Pola Ilmiah Pokok Bina Mulia Kelautan (PIP-BMK)`,
    `5. Metodologi Analisis, Literasi Data, dan Pengukuran Indikator Kinerja Terukur`,
    `6. Kajian Studi Kasus Lapangan dan Dinamika Komunitas Pesisir/Pedesaan`,
    `7. Formulasi Solusi Inovatif, Desain Proyek Kolaboratif (Project-Based Learning) & Case Method`,
    `8. Sintesis Portofolio Akhir, Etika Akademik, dan Presentasi Publik Hasil Kajian`,
  ].join("\n");

  // 4. Rubrik Penilaian OBE (Pasal 47 Peraturan Rektor UNPATTI No. 12/2026: Partisipatif & Proyek >= 50%)
  const rubrics = generateDefaultObeRubrics(mk, cpmkList);

  // 5. Silabus 16 Minggu
  const syllabusList = generateDefaultSyllabus(mk, subCpmkList);

  return {
    cpmkList,
    subCpmkList,
    bahanKajian,
    rubrics,
    syllabusList,
  };
}

export function generateDefaultObeRubrics(mk: string, cpmkList: CpmkItem[]): CourseObjectiveRubric[] {
  const activeCpmks = cpmkList && cpmkList.length > 0 ? cpmkList : [
    { id: "CPMK 1", desc: `Penguasaan konsep teoretis & landasan keilmuan ${mk}` },
    { id: "CPMK 2", desc: `Analisis kasus dan dinamika persoalan sosial-ekologis ${mk}` },
    { id: "CPMK 3", desc: `Penerapan metode, pengolahan data empiris dan investigasi ${mk}` },
    { id: "CPMK 4", desc: `Perancangan solusi inovatif proyek kolaboratif ${mk}` },
    { id: "CPMK 5", desc: `Evaluasi kebijakan, etika akademik dan portofolio akhir ${mk}` },
  ];

  const rubrics: CourseObjectiveRubric[] = [];

  activeCpmks.forEach((cpmk, idx) => {
    const cpmkId = cpmk.id || `CPMK ${idx + 1}`;
    const descShort = cpmk.desc.length > 70 ? cpmk.desc.slice(0, 70) + "..." : cpmk.desc;

    if (idx === 0) {
      // CPMK 1: Penguasaan Konseptual & Teoretis
      rubrics.push({
        id: `rubric-${cpmkId.toLowerCase().replace(/[^a-z0-9]/g, "-")}-1`,
        objectiveType: "CPMK",
        objectiveRef: cpmkId,
        objectiveTitle: `Penguasaan Konsep Teoretis & Landasan Keilmuan (${cpmkId}: ${descShort})`,
        assessmentMethod: "Ujian Tertulis / Review Konseptual & Kuis Terstruktur",
        targetBloomLevel: "C2-Pemahaman",
        criteria: [
          {
            id: `crit-${cpmkId}-1`,
            name: "Ketepatan Definisi & Penguasaan Konsep Dasar",
            indicator: "Ketepatan dalam menjelaskan ruang lingkup, definisi, dan teori fundamental",
            weightPercent: 40,
            levels: {
              sangatBaik: "Sangat komprehensif, menguraikan konsep secara sistematis tanpa kesalahan definisi ilmiah (Nilai: 85 - 100)",
              baik: "Memahami konsep dengan baik, rujukan teori relevan, pembahasan terstruktur (Nilai: 70 - 84.99)",
              cukup: "Penguasaan konsep terbatas, terdapat beberapa kerancuan istilah teknis (Nilai: 55 - 69.99)",
              kurang: "Gagal menjelaskan konsep dasar atau salah dalam mendefinisikan istilah (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-2`,
            name: "Sistematika Argumentasi & Rujukan Pustaka",
            indicator: "Kemampuan menyusun alur berpikir logis dan menghubungkan dengan pustaka terpercaya",
            weightPercent: 30,
            levels: {
              sangatBaik: "Argumentasi sangat kuat, logis, dan didukung rujukan pustaka bereputasi (Nilai: 85 - 100)",
              baik: "Argumentasi jelas dan runtut dengan dasar rujukan yang cukup (Nilai: 70 - 84.99)",
              cukup: "Alur berpikir kurang runtut, rujukan pustaka minim (Nilai: 55 - 69.99)",
              kurang: "Argumentasi tidak logis dan tidak memiliki dasar rujukan (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-3`,
            name: "Kontekstualitas Contoh Kasus Kepulauan",
            indicator: "Kemampuan memberikan contoh riil dalam konteks wilayah pulau-pulau kecil Maluku",
            weightPercent: 30,
            levels: {
              sangatBaik: "Memberikan contoh konkret yang sangat relevan dengan karakteristik kepulauan Maluku (Nilai: 85 - 100)",
              baik: "Contoh yang diberikan cukup relevan dengan isu lingkungan/sosial kepulauan (Nilai: 70 - 84.99)",
              cukup: "Contoh bersifat umum dan belum menyentuh konteks kepulauan (Nilai: 55 - 69.99)",
              kurang: "Tidak mampu memberikan contoh atau contoh tidak relevan sama sekali (Nilai: < 55)",
            },
          },
        ],
      });
    } else if (idx === 1) {
      // CPMK 2: Aktivitas Partisipatif & Diskusi Kasus (Case Method)
      rubrics.push({
        id: `rubric-${cpmkId.toLowerCase().replace(/[^a-z0-9]/g, "-")}-2`,
        objectiveType: "CPMK",
        objectiveRef: cpmkId,
        objectiveTitle: `Aktivitas Partisipatif & Diskusi Kasus (Case Method) (${cpmkId}: ${descShort})`,
        assessmentMethod: "Aktivitas Partisipatif & Diskusi Kritis (Case Method)",
        targetBloomLevel: "C4-Analisis",
        criteria: [
          {
            id: `crit-${cpmkId}-1`,
            name: "Kontribusi Ide & Argumentasi Kritis",
            indicator: "Frekuensi dan mutu tanggapan berbasis bukti ilmiah dalam diskusi kelas",
            weightPercent: 50,
            levels: {
              sangatBaik: "Selalu aktif memantik diskusi dengan argumentasi kritis dan rujukan pustaka bereputasi (Nilai: 85 - 100)",
              baik: "Sering berkontribusi secara relevan dan menghargai pandangan rekan sejawat (Nilai: 70 - 84.99)",
              cukup: "Hanya berpendapat jika ditunjuk dosen, tanggapan normatif (Nilai: 55 - 69.99)",
              kurang: "Pasif atau tidak menunjukkan pemahaman bahan kajian (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-2`,
            name: "Kolaborasi Tim & Etika Akademik",
            indicator: "Kemampuan bekerjasama dalam kelompok, kejujuran ilmiah, dan sikap santun",
            weightPercent: 50,
            levels: {
              sangatBaik: "Menunjukkan kepemimpinan kolaboratif, empati sosial, dan kepatuhan norma akademik prima (Nilai: 85 - 100)",
              baik: "Bekerja sama dengan baik dalam kelompok dan bertanggung jawab (Nilai: 70 - 84.99)",
              cukup: "Kurang aktif dalam pembagian tugas kelompok (Nilai: 55 - 69.99)",
              kurang: "Menghambat kinerja tim atau melakukan pelanggaran etika (Nilai: < 55)",
            },
          },
        ],
      });
    } else if (idx === 2) {
      // CPMK 3: Penerapan Metode, Pengolahan Data & Investigasi Empiris
      rubrics.push({
        id: `rubric-${cpmkId.toLowerCase().replace(/[^a-z0-9]/g, "-")}-3`,
        objectiveType: "CPMK",
        objectiveRef: cpmkId,
        objectiveTitle: `Penerapan Metode & Pengolahan Data Empiris (${cpmkId}: ${descShort})`,
        assessmentMethod: "Praktik Lapangan / Analisis Data & Simulasi Komputasi",
        targetBloomLevel: "C3-Penerapan",
        criteria: [
          {
            id: `crit-${cpmkId}-1`,
            name: "Ketepatan Penggunaan Metode & Prosedur Analisis",
            indicator: "Kesesuaian langkah kerja, formula, dan instrumen pengumpulan/pengolahan data",
            weightPercent: 40,
            levels: {
              sangatBaik: "Prosedur metodologis sangat akurat, taat asas, dan menggunakan instrumen mutakhir (Nilai: 85 - 100)",
              baik: "Menguasai metode dengan baik dengan tahapan operasional yang tepat (Nilai: 70 - 84.99)",
              cukup: "Terdapat beberapa kekeliruan prosedur yang tidak fatal (Nilai: 55 - 69.99)",
              kurang: "Metode yang digunakan salah dan tidak sesuai standar operasional (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-2`,
            name: "Validitas Interpretasi Data & Penyajian Grafik",
            indicator: "Kejelasan tabel, diagram, dan ketajaman interpretasi hasil perhitungan",
            weightPercent: 35,
            levels: {
              sangatBaik: "Visualisasi data informatif dan interpretasi mendalam mengungkapkan tren/makna data (Nilai: 85 - 100)",
              baik: "Tabel dan grafik rapi, interpretasi data akurat dan jelas (Nilai: 70 - 84.99)",
              cukup: "Penyajian data kurang rapi, interpretasi bersifat membaca angka semata (Nilai: 55 - 69.99)",
              kurang: "Data salah diinterpretasikan atau visualisasi membingungkan (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-3`,
            name: "Ketuntasan Laporan Teknis & Dokumentasi Bukti",
            indicator: "Kelengkapan berkas logbook, lampiran data mentah, dan ketepatan waktu pengumpulan",
            weightPercent: 25,
            levels: {
              sangatBaik: "Laporan sangat lengkap, dokumentasi otentik komprehensif, diserahkan tepat waktu (Nilai: 85 - 100)",
              baik: "Laporan lengkap dan rapi sesuai format standar panduan (Nilai: 70 - 84.99)",
              cukup: "Beberapa lampiran penting belum disertakan (Nilai: 55 - 69.99)",
              kurang: "Laporan tidak lengkap atau terlambat diserahkan tanpa alasan (Nilai: < 55)",
            },
          },
        ],
      });
    } else if (idx === 3) {
      // CPMK 4: Hasil Proyek Kolaboratif & Desain Inovasi (PjBL)
      rubrics.push({
        id: `rubric-${cpmkId.toLowerCase().replace(/[^a-z0-9]/g, "-")}-4`,
        objectiveType: "CPMK",
        objectiveRef: cpmkId,
        objectiveTitle: `Hasil Proyek & Studi Kasus Kolaboratif (${cpmkId}: ${descShort})`,
        assessmentMethod: "Hasil Proyek / Studi Kasus (Project-Based Learning)",
        targetBloomLevel: "C6-Kreasi",
        criteria: [
          {
            id: `crit-${cpmkId}-1`,
            name: "Kedalaman Analisis & Kontekstualitas Masalah",
            indicator: "Ketajaman identifikasi masalah riil di kepulauan dan keterkaitan teori",
            weightPercent: 30,
            levels: {
              sangatBaik: "Analisis sangat tajam, komprehensif, berbasis data sahih & mengintegrasikan kearifan lokal Maluku (Nilai: 85 - 100)",
              baik: "Analisis jelas dan tepat, data relevan, namun pembahasan konteks kepulauan masih umum (Nilai: 70 - 84.99)",
              cukup: "Analisis bersifat deskriptif tanpa eksplorasi akar masalah mendalam (Nilai: 55 - 69.99)",
              kurang: "Analisis dangkal, data tidak valid atau tidak relevan dengan topik (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-2`,
            name: "Inovasi Solusi & Keselarasan SDGs / PIP-Bina Mulia Ke Lautan",
            indicator: "Keaslian ide rekomendasi dan kesesuaian target pembangunan berkelanjutan",
            weightPercent: 40,
            levels: {
              sangatBaik: "Rekomendasi sangat inovatif, aplikatif, terukur, dan selaras penuh dengan target SDGs & PIP (Nilai: 85 - 100)",
              baik: "Solusi realistis dan relevan dengan target SDGs namun inovasi bersifat standar (Nilai: 70 - 84.99)",
              cukup: "Solusi kurang aplikatif untuk wilayah pulau-pulau kecil (Nilai: 55 - 69.99)",
              kurang: "Tidak ada rumusan solusi yang konkret atau keluar dari konteks (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-3`,
            name: "Kualitas Laporan & Presentasi Saintifik",
            indicator: "Sistematika penulisan format ilmiah APA 7th dan kemampuan argumentasi",
            weightPercent: 30,
            levels: {
              sangatBaik: "Sistematika penulisan sempurna, sitasi mutakhir bereputasi, visualisasi data menarik dan artikulatif (Nilai: 85 - 100)",
              baik: "Penulisan rapi, sitasi sesuai, presentasi komunikatif (Nilai: 70 - 84.99)",
              cukup: "Terdapat inkonsistensi sitasi atau tata tulis akademik (Nilai: 55 - 69.99)",
              kurang: "Laporan tidak rapi dan presentasi tidak menguasai materi (Nilai: < 55)",
            },
          },
        ],
      });
    } else {
      // CPMK 5 atau CPMK seterusnya: Evaluasi Kebijakan & Portofolio Akhir
      rubrics.push({
        id: `rubric-${cpmkId.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${idx + 1}`,
        objectiveType: "CPMK",
        objectiveRef: cpmkId,
        objectiveTitle: `Evaluasi Kebijakan, Rekomendasi & Portofolio Akhir (${cpmkId}: ${descShort})`,
        assessmentMethod: "Portofolio Akhir / Evaluasi Rekomendasi Kebijakan",
        targetBloomLevel: "C5-Evaluasi",
        criteria: [
          {
            id: `crit-${cpmkId}-1`,
            name: "Ketajaman Evaluasi Kritis Kebijakan & Efektivitas",
            indicator: "Evaluasi multi-sudut pandang terhadap dampak, hambatan implementasi, dan efektivitas intervensi",
            weightPercent: 40,
            levels: {
              sangatBaik: "Evaluasi sangat mendalam, objektif, didukung data komparatif dan pertimbangan etika (Nilai: 85 - 100)",
              baik: "Mampu mengevaluasi dengan jelas kendala dan capaian program (Nilai: 70 - 84.99)",
              cukup: "Evaluasi normatif dan belum melihat dampak jangka panjang (Nilai: 55 - 69.99)",
              kurang: "Evaluasi bias, tanpa argumen pendukung, atau tidak menyelesaikan sasaran (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-2`,
            name: "Kelayakan Strategi Implementasi & Keberlanjutan",
            indicator: "Rekomendasi yang dapat ditindaklanjuti secara nyata oleh masyarakat atau instansi terkait",
            weightPercent: 35,
            levels: {
              sangatBaik: "Strategi sangat terukur, memitigasi risiko, dan menjamin keberlanjutan pasca-proyek (Nilai: 85 - 100)",
              baik: "Strategi realistis dan dapat diterapkan pada tingkat kelembagaan lokal (Nilai: 70 - 84.99)",
              cukup: "Strategi sulit diimplementasikan karena keterbatasan sumber daya yang tidak diantisipasi (Nilai: 55 - 69.99)",
              kurang: "Strategi tidak realistis dan berpotensi memunculkan masalah baru (Nilai: < 55)",
            },
          },
          {
            id: `crit-${cpmkId}-3`,
            name: "Refleksi Pembelajaran & Komitmen Etika Profesi",
            indicator: "Kejujuran saintifik, refleksi diri terhadap capaian CPL, dan kepatuhan anti-plagiarisme",
            weightPercent: 25,
            levels: {
              sangatBaik: "Menunjukkan integritas akademik prima, orisinalitas tinggi, dan kedewasaan profesional (Nilai: 85 - 100)",
              baik: "Menjunjung etika akademik dengan tata sitasi yang tertib (Nilai: 70 - 84.99)",
              cukup: "Refleksi diri minim, tata sitasi cukup memadai (Nilai: 55 - 69.99)",
              kurang: "Terdapat indikasi pelanggaran etika penulisan atau plagiasi (Nilai: < 55)",
            },
          },
        ],
      });
    }
  });

  return rubrics;
}

function generateDefaultSyllabus(mk: string, subCpmkList: SubCpmkItem[]): SyllabusWeek[] {
  const weeks: SyllabusWeek[] = [];
  const subs = subCpmkList.length > 0 ? subCpmkList : [
    { id: "Sub-CPMK 1", cpmkRef: "CPMK 1", bloom: "C2", desc: `Konsep dasar ${mk}` }
  ];

  for (let w = 1; w <= 16; w++) {
    if (w === 8) {
      weeks.push({
        week: "8",
        sub: "Evaluasi Tengah Semester",
        materi: "UJIAN TENGAH SEMESTER (UTS) - Ujian Terjadwal & Evaluasi Capaian Pembelajaran",
        metode: "Tes Tertulis / Studi Kasus Analitik [BT: 2x(2x50''); PT: 2x(2x60'')]",
        asesmen: "Ujian UTS Tertulis / Analisis Kasus",
        indikator: "Ketepatan penguasaan materi konseptual dan analitis minggu 1 s.d. 7",
        bobot: "15",
        isExam: true,
      });
    } else if (w === 16) {
      weeks.push({
        week: "16",
        sub: "Evaluasi Akhir Semester",
        materi: "UJIAN AKHIR SEMESTER (UAS) - Presentasi & Penilaian Akhir Proyek OBE",
        metode: "Gelar Karya / Presentasi Laporan Proyek Akhir [BT: 2x(2x50''); PT: 2x(2x60'')]",
        asesmen: "Penilaian Laporan & Presentasi Proyek Akhir (Rubrik Holistik)",
        indikator: "Komprehensivitas laporan akhir, keaslian solusi, dan kemampuan argumentasi saintifik",
        bobot: "15",
        isExam: true,
      });
    } else {
      const subIdx = (w < 8 ? (w - 1) : (w - 2)) % subs.length;
      const subItem = subs[subIdx];
      const isProjectWeek = w >= 11 && w <= 15;

      weeks.push({
        week: String(w),
        sub: subItem.id,
        materi: `Kajian ${mk}: Topik Minggu ${w} (${subItem.desc.slice(0, 50)}...)`,
        metode: isProjectWeek
          ? "Project-Based Learning (PjBL) & Diskusi Kelompok [BT: 2x50''; PT: 2x60''; BM: 2x60'']"
          : "Case Method / Kuliah Interaktif & Praktik Terstruktur [BT: 2x50''; PT: 2x60''; BM: 2x60'']",
        asesmen: isProjectWeek
          ? "Penilaian Kinerja Proyek / Rubrik Analitik"
          : "Kuis / Resume Kritis / Partisipasi Kelas",
        indikator: `Kesesuaian capaian kompetensi ${subItem.id} [${subItem.bloom}]`,
        bobot: w === 7 || w === 15 ? "10" : "5",
        isExam: false,
      });
    }
  }

  return weeks;
}
