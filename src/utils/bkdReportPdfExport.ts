import { jsPDF } from "jspdf";
import { UNPATTI_LOGO_DATA_URL } from "../data/unpattiLogo";

export interface BkdLecturerItem {
  dosen: string;
  totalSks: number;
  status: "IDEAL" | "RINGAN" | "OVERLOAD";
  teamTeachingCount: number;
  mandiriCount: number;
  courses: {
    id: string;
    kodeMK: string;
    namaMK: string;
    semester: number | string;
    sks: number;
    sksShare: number;
    teamSize: number;
    teamMembers?: string[];
    isTeamTeaching: boolean;
  }[];
}

export interface BkdExportOptions {
  namaProdi: string;
  namaFakultas?: string;
  semesterLabel?: string;
  tahunAkademik?: string;
  kaprodiName?: string;
  kaprodiNip?: string;
  gjmName?: string;
  gjmNip?: string;
}

/**
 * Utilitas untuk mengunduh laporan PDF BKD Bidang Pendidikan
 */
export async function exportBkdSummaryToPdf(
  lecturers: BkdLecturerItem[],
  options: BkdExportOptions,
  onProgress?: (msg: string) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress("Menyiapkan dokumen PDF Laporan BKD...");

    // Format A4 Portrait: 210 x 297 mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182 mm

    const prodi = options.namaProdi || "Program Studi";
    const fakultas = options.namaFakultas || "Fakultas Pertanian";
    const semester = options.semesterLabel || "Semester Berjalan (Semua Semester)";
    const tahunAkademik = options.tahunAkademik || "TA 2026/2027";
    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Statistik KPI
    const totalDosen = lecturers.length;
    const totalSks = Number(lecturers.reduce((acc, l) => acc + l.totalSks, 0).toFixed(1));
    const avgSks = totalDosen > 0 ? (totalSks / totalDosen).toFixed(1) : "0";
    const idealDosen = lecturers.filter((l) => l.status === "IDEAL").length;
    const underloadDosen = lecturers.filter((l) => l.status === "RINGAN").length;
    const overloadDosen = lecturers.filter((l) => l.status === "OVERLOAD").length;
    const idealPercent = totalDosen > 0 ? Math.round((idealDosen / totalDosen) * 100) : 0;

    let currentY = margin;

    // Helper untuk menggambar Kop Surat Resmi UNPATTI
    const drawKopSurat = () => {
      // Logo UNPATTI
      try {
        doc.addImage(UNPATTI_LOGO_DATA_URL, "PNG", margin, currentY - 2, 22, 22);
      } catch (e) {
        console.warn("Logo unpatti gagal dimuat pada PDF BKD:", e);
      }

      const textLeft = margin + 25;
      const textWidth = contentWidth - 25;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI", textLeft + textWidth / 2, currentY + 1, { align: "center" });

      doc.setFontSize(11);
      doc.text("UNIVERSITAS PATTIMURA", textLeft + textWidth / 2, currentY + 5.5, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(fakultas.toUpperCase(), textLeft + textWidth / 2, currentY + 10, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(217, 119, 6); // Amber UNPATTI
      doc.text(`PROGRAM STUDI ${prodi.toUpperCase().replace(/^PROGRAM\s+STUDI\s*/i, "")}`, textLeft + textWidth / 2, currentY + 14.5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Jl. Ir. M. Putuhena, Kampus Poka, Ambon, Maluku - 97233 | Laman: https://unpatti.ac.id", textLeft + textWidth / 2, currentY + 18, { align: "center" });

      // Garis pemisah ganda kop surat
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.8);
      doc.line(margin, currentY + 21, pageWidth - margin, currentY + 21);
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY + 22, pageWidth - margin, currentY + 22);

      currentY += 27;
    };

    // Helper untuk menggambar Header Halaman Selanjutnya (Running Header)
    const drawRunningHeader = (pageNum: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`UNIVERSITAS PATTIMURA - ${fakultas.toUpperCase()} | PRODI ${prodi.toUpperCase()}`, margin, 9);
      doc.setFont("helvetica", "normal");
      doc.text(`Laporan BKD Bidang Pendidikan | ${tahunAkademik}`, pageWidth - margin, 9, { align: "right" });

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, 11, pageWidth - margin, 11);
    };

    // Helper untuk menggambar Footer Halaman
    const drawFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 8;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dokumen Resmi Sistem Penjaminan Mutu Akademik (SPMA) Universitas Pattimura - Dicetak pada ${tanggalCetak}`, margin, footerY);

      doc.setFont("helvetica", "bold");
      doc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
    };

    // 1. Gambar Kop Surat Halaman Pertama
    drawKopSurat();

    // 2. Judul Dokumen & Metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("LAPORAN MONITORING & EVALUASI BEBAN KERJA DOSEN (BKD)", pageWidth / 2, currentY, { align: "center" });

    currentY += 4.5;
    doc.setFontSize(9.5);
    doc.setTextColor(217, 119, 6);
    doc.text("BIDANG PENDIDIKAN DAN PENGAJARAN (STANDAR 3 - 9 SKS)", pageWidth / 2, currentY, { align: "center" });

    currentY += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Semester: ${semester}  |  Tahun Akademik: ${tahunAkademik}`, pageWidth / 2, currentY, { align: "center" });

    currentY += 6;

    // 3. Dasar Hukum & Pedoman BKD Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(180, 83, 9);
    doc.text("DASAR REGULASI & STANDAR BEBAN PENGAJARAN BKD:", margin + 3, currentY + 3.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(51, 65, 85);
    const regText = "Sesuai Pedoman Operasional BKD Dikti, Permendiktisaintek No. 39 Tahun 2025 (Pasal 16), dan Peraturan Rektor Universitas Pattimura No. 12 Tahun 2026: Unsur Pendidikan (Mengajar) minimal 3 SKS, unsur Pendidikan + Penelitian minimal 9 SKS, dan total beban keseluruhan Tridharma 12 - 16 SKS. Batas wajar mengajar di Program Studi ditetapkan 3 s.d. 9 SKS agar tersedia ruang waktu pelaksanaan penelitian dan pengabdian kepada masyarakat.";
    const splitReg = doc.splitTextToSize(regText, contentWidth - 6);
    doc.text(splitReg, margin + 3, currentY + 7);

    currentY += 15;

    // 4. Ringkasan Eksekutif KPI (4 Kartu Mini)
    const cardWidth = (contentWidth - 6) / 4;
    const cardHeight = 13;

    // Card 1: Total Dosen
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, currentY, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL DOSEN PENGAMPU", margin + 3, currentY + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalDosen} Orang`, margin + 3, currentY + 9.5);

    // Card 2: Rata-Rata SKS
    const c2X = margin + cardWidth + 2;
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(c2X, currentY, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(30, 64, 175);
    doc.text("RATA-RATA SKS MENGAJAR", c2X + 3, currentY + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(29, 78, 216);
    doc.text(`${avgSks} SKS / Dosen`, c2X + 3, currentY + 9.5);

    // Card 3: Memenuhi Standar (3-9 SKS)
    const c3X = c2X + cardWidth + 2;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(c3X, currentY, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(21, 128, 61);
    doc.text("MEMENUHI STANDAR (3-9 SKS)", c3X + 3, currentY + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(22, 101, 52);
    doc.text(`${idealDosen} (${idealPercent}%)`, c3X + 3, currentY + 9.5);

    // Card 4: Anomali (Kurang / Lebih)
    const c4X = c3X + cardWidth + 2;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(c4X, currentY, cardWidth, cardHeight, 1.5, 1.5, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(185, 28, 28);
    doc.text("ANOMALI BEBAN", c4X + 3, currentY + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(153, 27, 27);
    doc.text(`Kurang: ${underloadDosen} | Lebih: ${overloadDosen}`, c4X + 3, currentY + 9.5);

    currentY += 17;

    // 5. Tabel Distribusi Beban Dosen
    const colWidths = {
      no: 8,
      dosen: 48,
      mkList: 68,
      totalSks: 24,
      status: 34,
    };

    const drawTableHeader = (y: number) => {
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, contentWidth, 7, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);

      let x = margin + 1;
      doc.text("NO", x + 1, y + 4.8);
      x += colWidths.no;
      doc.text("NAMA DOSEN PENGAMPU", x + 1, y + 4.8);
      x += colWidths.dosen;
      doc.text("MATA KULIAH DIAMPU (SKS & TEAM TEACHING)", x + 1, y + 4.8);
      x += colWidths.mkList;
      doc.text("TOTAL BEBAN", x + 1, y + 4.8);
      x += colWidths.totalSks;
      doc.text("STATUS BKD PENGAJARAN", x + 1, y + 4.8);
    };

    drawTableHeader(currentY);
    currentY += 7;

    // Render Baris-Baris Dosen
    for (let i = 0; i < lecturers.length; i++) {
      const lec = lecturers[i];

      // Format string daftar MK
      const courseLines: string[] = [];
      lec.courses.forEach((c) => {
        const shareStr = c.sksShare % 1 === 0 ? String(c.sksShare) : c.sksShare.toFixed(1);
        const ttTag = c.isTeamTeaching ? ` [TT ${c.teamSize} Dosen: ${c.sks}/${c.teamSize}]` : " [Mandiri]";
        courseLines.push(`• ${c.kodeMK} - ${c.namaMK} (${shareStr} SKS)${ttTag}`);
      });

      // Hitung tinggi yang dibutuhkan untuk baris ini
      const maxCourseLinesCount = Math.max(courseLines.length, 1);
      const rowHeight = Math.max(10, maxCourseLinesCount * 3.8 + 3.5);

      // Cek apakah halaman masih muat (sisakan 35mm untuk footer & tanda tangan)
      if (currentY + rowHeight > pageHeight - 32) {
        doc.addPage("a4", "portrait");
        currentY = 16;
        drawRunningHeader(doc.getNumberOfPages());
        drawTableHeader(currentY);
        currentY += 7;
      }

      // Warna background zebra
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, contentWidth, rowHeight, "F");
      }

      // Garis horizontal bawah baris
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

      let x = margin + 1;

      // Kolom 1: No
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(String(i + 1), x + 1, currentY + 5);
      x += colWidths.no;

      // Kolom 2: Nama Dosen
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      const splitDosen = doc.splitTextToSize(lec.dosen, colWidths.dosen - 2);
      doc.text(splitDosen, x + 1, currentY + 4.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`${lec.courses.length} MK (${lec.teamTeachingCount} TT, ${lec.mandiriCount} Mandiri)`, x + 1, currentY + 8.5);
      x += colWidths.dosen;

      // Kolom 3: Rincian Mata Kuliah
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      let mkY = currentY + 3.8;
      courseLines.forEach((cline) => {
        const splitText = doc.splitTextToSize(cline, colWidths.mkList - 2);
        doc.text(splitText, x + 1, mkY);
        mkY += 3.5;
      });
      x += colWidths.mkList;

      // Kolom 4: Total SKS Riil
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${lec.totalSks.toFixed(1)} SKS`, x + 1, currentY + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text("proporsional", x + 1, currentY + 8.5);
      x += colWidths.totalSks;

      // Kolom 5: Status BKD
      if (lec.status === "IDEAL") {
        doc.setFillColor(220, 252, 231);
        doc.roundedRect(x + 1, currentY + 2.5, colWidths.status - 4, 6, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.8);
        doc.setTextColor(22, 101, 52);
        doc.text("IDEAL (3 - 9 SKS)", x + 3, currentY + 6.8);
      } else if (lec.status === "OVERLOAD") {
        doc.setFillColor(254, 226, 226);
        doc.roundedRect(x + 1, currentY + 2.5, colWidths.status - 4, 6, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.8);
        doc.setTextColor(153, 27, 27);
        doc.text("OVERLOAD (> 9 SKS)", x + 3, currentY + 6.8);
      } else {
        doc.setFillColor(254, 243, 199);
        doc.roundedRect(x + 1, currentY + 2.5, colWidths.status - 4, 6, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.8);
        doc.setTextColor(180, 83, 9);
        doc.text("KURANG (< 3 SKS)", x + 3, currentY + 6.8);
      }

      currentY += rowHeight;
    }

    currentY += 6;

    // Cek apakah kolom tanda tangan muat di halaman saat ini
    if (currentY + 38 > pageHeight - 20) {
      doc.addPage("a4", "portrait");
      currentY = 16;
      drawRunningHeader(doc.getNumberOfPages());
    }

    // 6. Kolom Tanda Tangan Pengesahan Resmi
    const ttdY = currentY;
    const ttdWidth = (contentWidth - 20) / 2;

    // Kolom Kiri: GJM / Dekan
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Mengetahui & Menyetujui,", margin + 5, ttdY);
    doc.setFont("helvetica", "bold");
    doc.text("Gugus Jaminan Mutu (GJM) / Dekanat,", margin + 5, ttdY + 4);

    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin + 5, ttdY + 22, margin + 5 + ttdWidth - 10, ttdY + 22);
    doc.setLineDashPattern([], 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(options.gjmName || "Dr. H. Tuanakotta, M.Si", margin + 5, ttdY + 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`NIP. ${options.gjmNip || "197506222003121001"}`, margin + 5, ttdY + 29.5);

    // Kolom Kanan: Kaprodi
    const ttdRightX = margin + contentWidth - ttdWidth;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Ambon, ${tanggalCetak}`, ttdRightX, ttdY);
    doc.setFont("helvetica", "bold");
    doc.text(`Ketua Program Studi ${prodi},`, ttdRightX, ttdY + 4);

    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(ttdRightX, ttdY + 22, ttdRightX + ttdWidth - 5, ttdY + 22);
    doc.setLineDashPattern([], 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(options.kaprodiName || "Dr. Bruri Penabur, M.Si", ttdRightX, ttdY + 26);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`NIP. ${options.kaprodiNip || "197808142005011002"}`, ttdRightX, ttdY + 29.5);

    // 7. Gambar Footer pada seluruh halaman
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawFooter(p, totalPages);
    }

    // Unduh File
    const cleanProdi = prodi.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `Laporan_BKD_Pendidikan_${cleanProdi}_UNPATTI.pdf`;
    doc.save(filename);

    if (onProgress) onProgress("Laporan PDF BKD berhasil diunduh.");
    return true;
  } catch (error) {
    console.error("Gagal mengekspor laporan PDF BKD:", error);
    return false;
  }
}
