import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { RpsData } from "../types/rps";
import {
  convertOklchStringToRgb,
  preprocessElementForPdf,
  sanitizeDocumentForHtml2Canvas,
} from "./oklchColorConverter";
import { UnpattiKopConfig, getDefaultKopConfig } from "../components/UnpattiPdfHeaderFooterModal";

/**
 * Utilitas pemicu download Blob dengan timing aman
 * (Mencegah ERR_FILE_NOT_FOUND akibat pemutusan URL sebelum stream dibaca browser)
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();

  // Berikan waktu kepada engine browser untuk menyelesaikan buffering stream file
  setTimeout(() => {
    try {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch {
      // Abaikan jika sudah dibersihkan
    }
  }, 60000);
}

/**
 * Ekspor Dokumen RPS ke format PDF Resmi (Ukuran Legal Portrait 21.6 x 35.6 cm)
 * Menggunakan jsPDF + html2canvas dengan pemecahan halaman cerdas berbasis baris (Smart Row-Aware Slicing)
 * serta kustomisasi kop surat resmi dinamis & running header-footer standar UNPATTI.
 */
export async function exportRpsToPdf(
  element: HTMLElement,
  rpsData: RpsData,
  onProgress?: (message: string) => void,
  kopConfig?: UnpattiKopConfig
): Promise<boolean> {
  const activeKop = kopConfig || getDefaultKopConfig(rpsData);
  const prodiSlug = (rpsData.namaProdi || activeKop.prodi || "PRODI")
    .replace(/^PROGRAM\s+STUDI\s+(S1|S2|S3|D3|D4)?\s*/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .trim() || "OBE";
  const cleanName = (rpsData.namaMK || "RPS").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `RPS_OBE_${prodiSlug}_${cleanName}_UNPATTI_PORTRAIT.pdf`;

  if (onProgress) onProgress("Memindai dan mengonversi warna dokumen (OKLCH -> RGB)...");

  // 1. Pre-processing elemen asli sebelum kloning
  preprocessElementForPdf(element);

  // 2. Proteksi global: bungkus getPropertyValue pada window.getComputedStyle selama proses html2canvas
  const origGlobalGetComputedStyle = window.getComputedStyle.bind(window);

  try {
    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
      const style = origGlobalGetComputedStyle(elt, pseudoElt);
      try {
        const origGetProp = style.getPropertyValue.bind(style);
        style.getPropertyValue = function (prop: string) {
          const val = origGetProp(prop);
          if (val && typeof val === "string" && val.includes("oklch")) {
            return convertOklchStringToRgb(val);
          }
          return val;
        };
      } catch {
        // Abaikan jika properti read-only
      }
      return style;
    };

    if (onProgress) onProgress("Merender tata letak dokumen RPS optimal & tajam...");

    // 4. Render kanvas via html2canvas
    const scaleFactor = 1.25;
    let capturedRowBounds: { top: number; bottom: number }[] = [];

    const canvas = await html2canvas(element, {
      scale: scaleFactor,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: 1024,
      imageTimeout: 15000,
      ignoreElements: (el) => el.classList?.contains("no-print"),
      onclone: (clonedDoc, clonedEl) => {
        if (clonedEl) {
          clonedEl.style.width = "820px";
          clonedEl.style.maxWidth = "820px";
          clonedEl.style.backgroundColor = "#ffffff";
          clonedEl.style.margin = "0 auto";
          clonedEl.style.padding = "0px";
          clonedEl.style.boxSizing = "border-box";
        }
        // Pastikan font tajam, border tipis, dan posisi teks di dalam shape rapi dan berada tepat di tengah
        const ultraCrispStyle = clonedDoc.createElement("style");
        ultraCrispStyle.textContent = `
          * {
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: geometricPrecision !important;
          }
          table, th, td, .table-rps, .table-rps th, .table-rps td {
            border-color: #94a3b8 !important;
            border-width: 0.75px !important;
          }
          /* Perbaikan posisi teks dalam seluruh shape, badge, dan pill */
          .cpmk-pill, .subcpmk-pill, .bloom-pill, .cpl-badge, .sdg-pill, .pip-pill, .kkni-pill, .kkni-level-badge,
          [class*="pill"], [class*="badge"], span[style*="border-radius"], span[style*="borderRadius"] {
            display: inline-block !important;
            vertical-align: middle !important;
            text-align: center !important;
            line-height: 1.25 !important;
            padding: 2.5px 7px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .sdg-num, .pip-code, .kkni-code {
            display: inline-block !important;
            vertical-align: middle !important;
            text-align: center !important;
            line-height: 1.1 !important;
            padding: 1px 4.5px !important;
            box-sizing: border-box !important;
          }
        `;
        clonedDoc.head?.appendChild(ultraCrispStyle);

        sanitizeDocumentForHtml2Canvas(clonedDoc, clonedEl);

        // Ukur posisi vertikal eksak seluruh baris tabel (tr) individual pada DOM kloningan
        if (clonedEl) {
          const parentRect = clonedEl.getBoundingClientRect();
          const breakableElements = Array.from(
            clonedEl.querySelectorAll("tr, .rubric-criterion-row, .rubric-block-item, .cqi-item-row")
          );

          capturedRowBounds = breakableElements
            .map((node) => {
              const r = node.getBoundingClientRect();
              return {
                top: Math.round((r.top - parentRect.top) * scaleFactor),
                bottom: Math.round((r.bottom - parentRect.top) * scaleFactor),
              };
            })
            .filter((b) => b.bottom > b.top)
            .sort((a, b) => a.top - b.top);
        }
      },
    });

    if (onProgress) onProgress("Menyusun halaman PDF Legal Portrait proporsional & terkompresi...");

    // 5. Inisialisasi dokumen jsPDF (Legal: 215.9 mm x 355.6 mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [215.9, 355.6], // Standar kertas Legal Indonesia / F4-Legal
      compress: true,
    });

    const pdfWidth = 215.9;
    const pdfHeight = 355.6;
    const margin = 8;
    const contentWidth = pdfWidth - margin * 2; // 199.9 mm
    const contentHeight = pdfHeight - margin * 2; // 339.6 mm

    // Skala konversi pixel kanvas ke mm konten PDF
    const pxToMm = contentWidth / canvas.width;
    const maxPageHeightPx = Math.floor(contentHeight / pxToMm);

    // Algoritma pemecahan halaman cerdas (Smart Row-Aware Slicing)
    // Menjamin tidak ada teks atau baris tabel yang terbelah di tengah halaman
    const pageSlices: { startY: number; endY: number }[] = [];
    let currentY = 0;

    while (currentY < canvas.height) {
      let idealEndY = currentY + maxPageHeightPx;

      if (idealEndY >= canvas.height) {
        pageSlices.push({ startY: currentY, endY: canvas.height });
        break;
      }

      // Cari elemen baris tabel / blok yang memotong idealEndY
      let safeSplitY = idealEndY;
      for (const b of capturedRowBounds) {
        if (idealEndY > b.top && idealEndY < b.bottom) {
          // idealEndY memotong baris b: potong SEBELUM baris ini dimulai (dengan margin aman 2px)
          const candidateSplit = Math.max(currentY + 50, b.top - 2);
          if (candidateSplit > currentY + maxPageHeightPx * 0.25) {
            safeSplitY = candidateSplit;
          }
          break;
        }
      }

      // Hindari loop tak berujung jika baris tunggal sangat tinggi
      if (safeSplitY <= currentY) {
        safeSplitY = idealEndY;
      }

      pageSlices.push({ startY: currentY, endY: safeSplitY });
      currentY = safeSplitY;
    }

    // Render setiap potongan halaman ke lembar jsPDF
    for (let i = 0; i < pageSlices.length; i++) {
      const slice = pageSlices[i];
      const sliceHeightPx = slice.endY - slice.startY;
      if (sliceHeightPx <= 0) continue;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext("2d");

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          slice.startY,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );
      }

      // Gunakan kompresi JPEG kualitas optimal (0.72) agar teks tajam bebas blur namun ukuran file sangat kecil (< 2 MB)
      const imgData = pageCanvas.toDataURL("image/jpeg", 0.72);
      const sliceHeightMm = sliceHeightPx * pxToMm;

      if (i > 0) {
        pdf.addPage([215.9, 355.6], "portrait");
      }

      const topOffset = activeKop.tampilkanRunningHeader && i > 0 ? margin + 2 : margin;
      pdf.addImage(imgData, "JPEG", margin, topOffset, contentWidth, sliceHeightMm, undefined, "MEDIUM");

      // 1. Gambar Running Header pada halaman lanjutan (Halaman 2 ke atas)
      if (activeKop.tampilkanRunningHeader && i > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(30, 41, 59);
        const headerTitle = activeKop.runningHeaderText || `UNIVERSITAS PATTIMURA • ${activeKop.fakultas}`;
        pdf.text(headerTitle, margin, 5.5);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`No. Dokumen: ${rpsData.kodeDokumen || "-"}`, pdfWidth - margin, 5.5, { align: "right" });

        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.25);
        pdf.line(margin, 6.5, pdfWidth - margin, 6.5);
      }

      // 2. Gambar Running Footer resmi UNPATTI pada seluruh halaman
      if (activeKop.tampilkanFooter) {
        const footerY = pdfHeight - 4.5;
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.25);
        pdf.line(margin, footerY - 2.5, pdfWidth - margin, footerY - 2.5);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(6.8);
        pdf.setTextColor(100, 116, 139);
        const footerLeft = activeKop.footerLeftText || `Dokumen SPMI UNPATTI • ${activeKop.fakultas}`;
        pdf.text(footerLeft, margin, footerY);

        if (activeKop.tampilkanKodeDokumen) {
          pdf.setFontSize(6.5);
          pdf.setTextColor(148, 163, 184);
          pdf.text(
            `Dok: ${rpsData.kodeDokumen || "-"} (Rev. ${rpsData.revisiKe || "00"})`,
            pdfWidth / 2,
            footerY,
            { align: "center" }
          );
        }

        // Nomor halaman dinamis
        let pageStr = `Halaman ${i + 1} dari ${pageSlices.length}`;
        if (activeKop.pageNumberFormat === "hal_x_y") {
          pageStr = `Hal. ${i + 1} / ${pageSlices.length}`;
        } else if (activeKop.pageNumberFormat === "angka_saja") {
          pageStr = `- ${i + 1} -`;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(51, 65, 85);
        pdf.text(pageStr, pdfWidth - margin, footerY, { align: "right" });
      }
    }

    if (onProgress) onProgress("Menyimpan berkas PDF Legal ke perangkat Anda...");

    // 6. Unduh Blob secara aman
    const blob = pdf.output("blob");
    const fileSizeMb = (blob.size / (1024 * 1024)).toFixed(2);
    if (onProgress) onProgress(`PDF siap! Ukuran berkas teroptimasi: ${fileSizeMb} MB`);
    triggerFileDownload(blob, filename);

    return true;
  } catch (error) {
    console.error("Gagal export PDF via html2canvas standar:", error);

    // Metode Alternatif Cadangan: html2pdf.js dengan sanitizer OKLCH dan kompresi tinggi
    try {
      if (onProgress) onProgress("Mencoba metode alternatif pembuatan PDF terkompresi...");
      // @ts-ignore
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default || html2pdfModule;

      const opt: any = {
        margin: [8, 8, 8, 8],
        filename,
        image: { type: "jpeg", quality: 0.72 },
        html2canvas: {
          scale: 1.2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
            sanitizeDocumentForHtml2Canvas(clonedDoc, clonedEl);
          },
        },
        jsPDF: { unit: "mm", format: [215.9, 355.6], orientation: "portrait", compress: true },
        pagebreak: { mode: ["css", "legacy", "avoid-all"], avoid: ["tr", "table"] },
      };

      await html2pdf().set(opt).from(element).save();
      return true;
    } catch (fallbackError) {
      console.error("Gagal export PDF metode alternatif:", fallbackError);
      throw fallbackError;
    }
  } finally {
    // Selalu pulihkan window.getComputedStyle asli
    window.getComputedStyle = origGlobalGetComputedStyle;
  }
}
