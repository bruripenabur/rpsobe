import JSZip from "jszip";
import { RpsData } from "../types/rps";
import { UNPATTI_LOGO_DATA_URL } from "../data/unpattiLogo";

/**
 * Memproses dan menyelaraskan struktur HTML dokumen RPS agar terbaca sempurna di Microsoft Word.
 * 1. Menginjeksikan atribut bgcolor dan mso-shading pada setiap sel tabel (td/th).
 * 2. Mengonversi pill badge (CPMK, Sub-CPMK, Taksonomi Bloom, SDGs, PIP, KKNI) menjadi format MSO dengan border dan spasi aman.
 * 3. Menghubungkan logo resmi UNPATTI ke berkas media OpenXML paket .docx.
 * 4. Menjaga proporsi kolom tabel agar tidak terjadi penyempitan atau patah kata janggal.
 */
function prepareHtmlForWord(rawHtml: string): string {
  if (typeof document === "undefined") return rawHtml;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // 1. Ganti referensi gambar logo dengan media OpenXML lokal (media/image1.png)
    const images = doc.querySelectorAll("img");
    images.forEach((img) => {
      img.setAttribute("src", "media/image1.png");
      img.setAttribute("width", "95");
      img.setAttribute("height", "95");
      img.style.width = "2.4cm";
      img.style.height = "2.4cm";
      img.style.maxWidth = "2.4cm";
      img.style.maxHeight = "2.4cm";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.style.margin = "0 auto";
    });

    // 2. Selaraskan seluruh tabel
    const tables = doc.querySelectorAll("table");
    tables.forEach((table) => {
      table.setAttribute("border", "1");
      table.setAttribute("cellspacing", "0");
      table.setAttribute("cellpadding", "4");
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";
      table.style.marginBottom = "6pt";
      table.style.setProperty("mso-table-lspace", "0pt");
      table.style.setProperty("mso-table-rspace", "0pt");
      table.style.setProperty("mso-table-anchor-vertical", "paragraph");
    });

    // 2b. Mencegah baris tabel terpotong canggung di batas halaman Word (cantSplit & avoid break)
    const rows = doc.querySelectorAll("tr");
    rows.forEach((tr) => {
      const el = tr as HTMLElement;
      el.style.setProperty("page-break-inside", "avoid");
      el.style.setProperty("mso-break-inside", "avoid");
      el.setAttribute("valign", "top");
    });

    // 3. Selaraskan seluruh sel tabel (th & td) dengan mso-shading, bgcolor, dan border
    const cells = doc.querySelectorAll("th, td");
    cells.forEach((cell) => {
      const el = cell as HTMLElement;
      let bg = el.style.backgroundColor || el.getAttribute("bgcolor");

      // Cek kelas penanda warna bawaan jika inline style kosong
      if (!bg || bg === "transparent" || bg === "inherit") {
        if (el.classList.contains("bg-emerald-100") || el.classList.contains("bg-emerald-50")) bg = "#dcfce7";
        else if (el.classList.contains("bg-blue-100") || el.classList.contains("bg-blue-50")) bg = "#dbeafe";
        else if (el.classList.contains("bg-amber-100") || el.classList.contains("bg-amber-50")) bg = "#fef3c7";
        else if (el.classList.contains("bg-slate-100")) bg = "#f1f5f9";
        else if (el.classList.contains("bg-slate-200")) bg = "#e2e8f0";
        else if (el.classList.contains("bg-slate-50")) bg = "#f8fafc";
      }

      if (bg && bg !== "transparent" && bg !== "inherit") {
        el.setAttribute("bgcolor", bg);
        el.style.setProperty("mso-shading", bg);
        el.style.backgroundColor = bg;
      }

      // Pastikan warna teks header hijau UNPATTI terbaca jelas putih
      if (bg === "#14532d" || bg === "rgb(20, 83, 45)") {
        el.style.color = "#ffffff";
        el.setAttribute("bgcolor", "#14532d");
        el.style.setProperty("mso-shading", "#14532d");
      }

      el.style.border = "0.5pt solid #94a3b8";
      el.style.setProperty("mso-border-alt", "solid #94a3b8 0.5pt");
      el.style.padding = "4pt 5pt";
      el.style.verticalAlign = "top";
    });

    // 4. Selaraskan badge dan pill (CPMK, Sub-CPMK, Bloom, CPL, SDGs, PIP, KKNI) agar posisi teks di tengah shape rapi
    const spans = doc.querySelectorAll("span");
    spans.forEach((span) => {
      const el = span as HTMLElement;
      const bg = el.style.backgroundColor;
      const borderColor = el.style.borderColor || "#60a5fa";

      if (bg && bg !== "transparent" && bg !== "inherit") {
        el.style.display = "inline-block";
        el.style.padding = "2pt 6pt";
        el.style.fontWeight = "bold";
        el.style.verticalAlign = "middle";
        el.style.textAlign = "center";
        el.style.lineHeight = "normal";
        el.style.whiteSpace = "nowrap";
        el.style.setProperty("mso-line-height-rule", "exactly");
        el.style.setProperty("mso-text-raise", "0pt");
        el.setAttribute("bgcolor", bg);
        el.style.setProperty("mso-shading", bg);
        el.style.setProperty("mso-border-alt", `solid ${borderColor} 0.75pt`);

        // Sisipkan spasi aman jika diikuti teks agar tidak menyatu
        const next = el.nextSibling;
        if (next && next.nodeType === Node.TEXT_NODE) {
          const textVal = next.nodeValue || "";
          if (textVal && !textVal.startsWith(" ") && !textVal.startsWith("\u00A0")) {
            next.nodeValue = " " + textVal;
          }
        }
      }
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.warn("prepareHtmlForWord parsing fallback:", err);
    return rawHtml;
  }
}

export async function exportRpsToDocx(rpsData: RpsData, htmlContent: string) {
  const cleanName = (rpsData.namaMK || "RPS_OBE").replace(/[^a-zA-Z0-9_-]/g, "_");
  const processedHtml = prepareHtmlForWord(htmlContent);

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns:v='urn:schemas-microsoft-com:vml' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>RPS OBE - ${rpsData.namaMK}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 { 
          size: 215.9mm 355.6mm; 
          mso-page-orientation: portrait; 
          margin: 10.0mm 12.0mm 10.0mm 12.0mm; 
        }
        div.Section1 { page: Section1; }
        body { 
          font-family: Arial, Helvetica, sans-serif; 
          font-size: 8.5pt; 
          color: #0f172a; 
          line-height: 1.35; 
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin-bottom: 6pt; 
          table-layout: auto; 
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        tr {
          page-break-inside: avoid !important;
          mso-break-inside: avoid !important;
        }
        thead {
          display: table-header-group !important;
        }
        th, td { 
          border: 0.5pt solid #94a3b8; 
          mso-border-alt: solid #94a3b8 0.5pt;
          padding: 4pt 5pt; 
          font-size: 8pt; 
          vertical-align: top; 
        }
        th { 
          background-color: #e2e8f0; 
          mso-shading: #e2e8f0;
          font-weight: bold; 
          text-align: center; 
          color: #0f172a; 
        }
        .cpmk-pill {
          display: inline-block !important;
          background-color: #eff6ff !important;
          mso-shading: #eff6ff !important;
          color: #1d4ed8 !important;
          border: 1pt solid #60a5fa !important;
          mso-border-alt: solid #60a5fa 1pt !important;
          padding: 2.5pt 8pt !important;
          border-radius: 12pt !important;
          font-weight: bold !important;
          font-size: 8.5pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 12pt !important;
          mso-line-height-rule: exactly !important;
        }
        .subcpmk-pill {
          display: inline-block !important;
          background-color: #fffbeb !important;
          mso-shading: #fffbeb !important;
          color: #b45309 !important;
          border: 1.5pt solid #f59e0b !important;
          mso-border-alt: solid #f59e0b 1.5pt !important;
          padding: 2.5pt 7pt !important;
          border-radius: 10pt !important;
          font-weight: bold !important;
          font-size: 8.5pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 12pt !important;
          mso-line-height-rule: exactly !important;
        }
        .bloom-pill {
          display: inline-block !important;
          background-color: #fef3c7 !important;
          mso-shading: #fef3c7 !important;
          color: #b45309 !important;
          border: 1.5pt solid #f59e0b !important;
          mso-border-alt: solid #f59e0b 1.5pt !important;
          padding: 2.5pt 7pt !important;
          border-radius: 6pt !important;
          font-weight: bold !important;
          font-size: 8.5pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 12pt !important;
          margin-right: 6pt !important;
          mso-line-height-rule: exactly !important;
        }
        .cpl-badge {
          display: inline-block !important;
          background-color: #dcfce7 !important;
          mso-shading: #dcfce7 !important;
          color: #15803d !important;
          border: 1pt solid #22c55e !important;
          mso-border-alt: solid #22c55e 1pt !important;
          padding: 2.5pt 7pt !important;
          border-radius: 10pt !important;
          font-weight: bold !important;
          font-size: 8.5pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 12pt !important;
          mso-line-height-rule: exactly !important;
        }
        .sdg-pill {
          display: inline-block !important;
          background-color: #f0fdf4 !important;
          mso-shading: #f0fdf4 !important;
          color: #15803d !important;
          border: 1pt solid #22c55e !important;
          mso-border-alt: solid #22c55e 1pt !important;
          padding: 2.5pt 7pt !important;
          border-radius: 12pt !important;
          font-size: 8.5pt !important;
          font-weight: bold !important;
          margin: 2pt 3pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 12pt !important;
          mso-line-height-rule: exactly !important;
        }
        .sdg-num {
          display: inline-block !important;
          background-color: #16a34a !important;
          mso-shading: #16a34a !important;
          color: #ffffff !important;
          border-radius: 50% !important;
          padding: 1pt 5pt !important;
          font-size: 7.5pt !important;
          font-weight: 900 !important;
          font-family: Arial, Helvetica, sans-serif !important;
          margin-right: 4pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 10pt !important;
          mso-line-height-rule: exactly !important;
        }
        .pip-pill {
          display: inline-block !important;
          background-color: #ecfeff !important;
          mso-shading: #ecfeff !important;
          color: #0e7490 !important;
          border: 1pt solid #06b6d4 !important;
          mso-border-alt: solid #06b6d4 1pt !important;
          padding: 2.5pt 7pt !important;
          border-radius: 12pt !important;
          font-size: 8.5pt !important;
          font-weight: bold !important;
          margin: 2pt 3pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 12pt !important;
          mso-line-height-rule: exactly !important;
        }
        .pip-code {
          display: inline-block !important;
          background-color: #0891b2 !important;
          mso-shading: #0891b2 !important;
          color: #ffffff !important;
          border-radius: 3pt !important;
          padding: 1pt 4pt !important;
          font-size: 7.5pt !important;
          font-weight: 900 !important;
          font-family: Arial, Helvetica, sans-serif !important;
          margin-right: 4pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 10pt !important;
          mso-line-height-rule: exactly !important;
        }
        .kkni-level-badge {
          display: inline-block !important;
          background-color: #e0e7ff !important;
          mso-shading: #e0e7ff !important;
          color: #3730a3 !important;
          border: 1pt solid #a5b4fc !important;
          mso-border-alt: solid #a5b4fc 1pt !important;
          border-radius: 3pt !important;
          padding: 1.5pt 5pt !important;
          font-size: 8pt !important;
          font-weight: 800 !important;
          margin-right: 4pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 11pt !important;
          mso-line-height-rule: exactly !important;
        }
        .kkni-pill {
          display: inline-block !important;
          background-color: #f5f3ff !important;
          mso-shading: #f5f3ff !important;
          color: #4338ca !important;
          border: 1pt solid #c7d2fe !important;
          mso-border-alt: solid #c7d2fe 1pt !important;
          padding: 2.5pt 7pt !important;
          border-radius: 12pt !important;
          font-size: 8.5pt !important;
          font-weight: bold !important;
          margin: 2pt 3pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 12pt !important;
          mso-line-height-rule: exactly !important;
        }
        .kkni-code {
          display: inline-block !important;
          background-color: #4f46e5 !important;
          mso-shading: #4f46e5 !important;
          color: #ffffff !important;
          border-radius: 3pt !important;
          padding: 1pt 4pt !important;
          font-size: 7.5pt !important;
          font-weight: 900 !important;
          font-family: Arial, Helvetica, sans-serif !important;
          margin-right: 4pt !important;
          vertical-align: middle !important;
          text-align: center !important;
          line-height: 10pt !important;
          mso-line-height-rule: exactly !important;
        }
      </style>
    </head>
    <body>
      <div class="Section1">${processedHtml}</div>
    </body>
    </html>
  `;

  try {
    const zip = new JSZip();

    // 1. Types
    zip.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="html" ContentType="text/html"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
    );

    // 2. Package relationships
    zip.folder("_rels")?.file(
      ".rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
    );

    // 3. Word document relationships
    zip.folder("word")?.folder("_rels")?.file(
      "document.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdHtml1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk" Target="afchunk.html"/>
  <Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`
    );

    // 4. Afchunk relationships
    zip.folder("word")?.folder("_rels")?.file(
      "afchunk.html.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`
    );

    // 5. Binary logo file
    const logoBase64 = UNPATTI_LOGO_DATA_URL.replace(/^data:image\/[a-z]+;base64,/, "");
    zip.folder("word")?.folder("media")?.file("image1.png", logoBase64, { base64: true });

    // 6. Main document XML with Legal page settings
    zip.folder("word")?.file(
      "document.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:altChunk r:id="rIdHtml1"/>
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="20160" w:orient="portrait"/>
      <w:pgMar w:top="567" w:right="680" w:bottom="567" w:left="680" w:header="567" w:footer="567" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`
    );

    // 7. HTML chunk with UTF-8 BOM
    zip.folder("word")?.file("afchunk.html", "\ufeff" + wordHtml);

    const blob = await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const prodiSlug = (rpsData.namaProdi || "PRODI")
      .replace(/^PROGRAM\s+STUDI\s+(S1|S2|S3|D3|D4)?\s*/i, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .trim() || "OBE";
    const filename = `RPS_OBE_${prodiSlug}_${cleanName}_UNPATTI.docx`;
    triggerFileDownload(blob, filename);
    return true;
  } catch (error) {
    console.error("Word .docx generation error:", error);
    // Fallback: direct docx mime document
    const fallbackBlob = new Blob(["\ufeff" + wordHtml], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const prodiSlug = (rpsData.namaProdi || "PRODI")
      .replace(/^PROGRAM\s+STUDI\s+(S1|S2|S3|D3|D4)?\s*/i, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .trim() || "OBE";
    const filename = `RPS_OBE_${prodiSlug}_${cleanName}_UNPATTI.docx`;
    triggerFileDownload(fallbackBlob, filename);
    return true;
  }
}

/**
 * Utilitas pemicu unduh file dengan penundaan pembersihan object URL
 */
function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();

  // Berikan waktu kepada browser untuk mengalirkan file sebelum URL dicabut
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
