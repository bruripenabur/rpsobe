import { RpsData } from "../types/rps";
import { exportRpsToPdf } from "./pdfExport";

/**
 * Mencetak dokumen RPS dengan format Legal Portrait (21.6 x 35.6 cm).
 * Menggunakan pendekatan multi-layer:
 * 1. Menyiapkan isolated print iframe berdimensi Legal dengan gaya penuh & gambar siap.
 * 2. Memanggil dialog printer sistem (browser print dialog).
 * 3. Jika izin dialog cetak browser diblokir oleh sandbox/iframe, otomatis dialihkan
 *    ke generator PDF Legal Portrait resmi agar dokumen tetap dapat dicetak pengguna.
 */
export async function printRpsDocument(
  element: HTMLElement,
  rpsData: RpsData,
  onStatus?: (msg: string) => void
): Promise<boolean> {
  if (!element) {
    throw new Error("Elemen dokumen cetak tidak ditemukan.");
  }

  if (onStatus) onStatus("Menyiapkan tata letak cetak dokumen RPS (Legal Portrait)...");

  // Salin style tags yang ada di halaman utama untuk menjaga akurasi warna dan font
  const existingStyles = Array.from(
    document.querySelectorAll("style, link[rel='stylesheet']")
  )
    .map((el) => el.outerHTML)
    .join("\n");

  let printedSuccessfully = false;

  // METODE 1: Cetak menggunakan Dedicated Off-screen IFrame
  try {
    const iframe = document.createElement("iframe");
    iframe.id = "rps-print-frame";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "216mm";
    iframe.style.height = "356mm";
    iframe.style.border = "none";
    iframe.style.zIndex = "-999";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Cetak RPS - ${rpsData.kodeMK || "OBE"} - ${rpsData.namaMK || "Kurikulum UNPATTI"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  ${existingStyles}
  <style>
    @page {
      size: 216mm 356mm portrait;
      margin: 10mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      font-size: 9.5pt;
      line-height: 1.35;
      width: 100% !important;
    }
    .no-print {
      display: none !important;
    }
    .table-rps {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-bottom: 8px !important;
      page-break-inside: auto !important;
    }
    .table-rps thead {
      display: table-header-group !important;
    }
    .table-rps tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .table-rps th, .table-rps td {
      border: 0.75pt solid #94a3b8;
      padding: 4px 6px;
      font-size: 8.5pt;
      line-height: 1.3;
    }
    .table-rps th {
      background-color: #f1f5f9;
      font-weight: 800;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 100%; margin: 0 auto; background: #ffffff;">
    ${element.innerHTML}
  </div>
</body>
</html>`);
      iframeDoc.close();

      // Tunggu hingga gambar selesai dimuat (khususnya logo UNPATTI)
      const images = Array.from(iframeDoc.getElementsByTagName("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.onload = () => res(null);
            img.onerror = () => res(null);
          });
        })
      );

      // Jeda singkat rendering style & layout
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (onStatus) onStatus("Membuka dialog pencetakan printer...");

      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        printedSuccessfully = true;
      }
    }
  } catch (err: any) {
    console.warn("Iframe print gagal atau terblokir:", err);
  } finally {
    // Bersihkan iframe setelah beberapa detik agar proses print selesai
    setTimeout(() => {
      const existing = document.getElementById("rps-print-frame");
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }, 5000);
  }

  if (printedSuccessfully) {
    if (onStatus) onStatus("Dialog cetak printer berhasil diaktifkan!");
    return true;
  }

  // METODE 2: Coba window.print() langsung dengan stylesheet global
  try {
    if (onStatus) onStatus("Membuka dialog cetak sistem (window.print)...");
    window.focus();
    window.print();
    if (onStatus) onStatus("Perintah cetak browser dikirim.");
    return true;
  } catch (err: any) {
    console.warn("window.print() gagal dipanggil:", err);
  }

  // METODE 3: Alternatif aman jika dialog cetak modal diblokir oleh lingkungan iframe
  if (onStatus) {
    onStatus(
      "Dialog cetak printer dicegah oleh pembatasan iframe browser. Menghasilkan berkas PDF Legal Portrait siap cetak..."
    );
  }
  await exportRpsToPdf(element, rpsData, onStatus);
  if (onStatus) onStatus("Berkas PDF Legal Portrait berhasil diunduh dan siap dicetak!");
  return true;
}
