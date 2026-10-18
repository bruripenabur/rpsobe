/**
 * Utilitas Pre-Processing Warna OKLCH -> RGB / HEX untuk html2canvas & jsPDF
 * Mengonversi seluruh sintaks warna modern (oklch, oklab, lab, color) menjadi
 * format RGB/RGBA standar yang didukung penuh oleh parser html2canvas.
 */

// Singleton Canvas 2D context untuk akselerasi konversi warna bawaan browser
let helperCanvas: HTMLCanvasElement | null = null;
let helperCtx: CanvasRenderingContext2D | null = null;

function getHelperContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!helperCanvas) {
    helperCanvas = document.createElement("canvas");
    helperCanvas.width = 1;
    helperCanvas.height = 1;
  }
  if (!helperCtx && helperCanvas) {
    try {
      helperCtx = helperCanvas.getContext("2d", { willReadFrequently: true });
    } catch {
      helperCtx = null;
    }
  }
  return helperCtx;
}

/**
 * Konversi matematis eksak OKLCH ke sRGB
 * Digunakan jika engine browser belum mengonversi kanvas atau sebagai fallback deterministik
 */
export function oklchToRgbMath(
  L: number,
  C: number,
  H: number,
  alpha: number = 1
): string {
  // 1. OKLCH -> OKLab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // 2. OKLab -> Cone responses (LMS)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // 3. LMS -> Linear sRGB
  const rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // 4. Linear sRGB -> Gamma-corrected sRGB [0..255]
  const toSRGB = (c: number): number => {
    const clamped = Math.max(0, Math.min(1, c));
    return clamped <= 0.0031308
      ? Math.round(clamped * 12.92 * 255)
      : Math.round((1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255);
  };

  const r = toSRGB(rLinear);
  const g = toSRGB(gLinear);
  const bVal = toSRGB(bLinear);

  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${bVal}, ${Number(alpha.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
}

/**
 * Memindai dan mengubah string warna tunggal atau string yang mengandung oklch(...)
 * menjadi format rgb(...) / rgba(...) / hex
 */
export function convertOklchStringToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== "string") return colorStr;
  if (
    !colorStr.includes("oklch") &&
    !colorStr.includes("oklab") &&
    !colorStr.includes("lab(") &&
    !colorStr.includes("color(")
  ) {
    return colorStr;
  }

  // 1. Coba konversi via Browser Canvas context jika string berupa fungsi warna utuh
  const ctx = getHelperContext();
  if (ctx && (colorStr.trim().startsWith("oklch") || colorStr.trim().startsWith("oklab"))) {
    try {
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillStyle = colorStr.trim();
      const canvasColor = ctx.fillStyle;
      if (
        canvasColor &&
        canvasColor !== "rgba(0, 0, 0, 0)" &&
        !canvasColor.includes("oklch")
      ) {
        return canvasColor;
      }
    } catch {
      // Abaikan jika browser melemparkan sintaks error pada canvas
    }
  }

  // 2. Regex Parser untuk OKLCH: oklch(L C H [/ A])
  const oklchPattern =
    /oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+(?:deg|rad|turn)?)(?:\s*(?:\/|\s)\s*([\d.]+%?))?\s*\)/gi;

  const converted = colorStr.replace(
    oklchPattern,
    (_match, lStr, cStr, hStr, aStr) => {
      try {
        let L = lStr.endsWith("%")
          ? parseFloat(lStr) / 100
          : parseFloat(lStr);
        let C = cStr.endsWith("%")
          ? (parseFloat(cStr) / 100) * 0.4
          : parseFloat(cStr);
        let H = parseFloat(hStr);

        if (hStr && typeof hStr === "string") {
          if (hStr.endsWith("rad")) H = (parseFloat(hStr) * 180) / Math.PI;
          else if (hStr.endsWith("turn")) H = parseFloat(hStr) * 360;
        }

        let alpha = 1;
        if (aStr) {
          alpha = aStr.endsWith("%")
            ? parseFloat(aStr) / 100
            : parseFloat(aStr);
        }

        return oklchToRgbMath(L, C, H, alpha);
      } catch {
        return "rgb(255, 255, 255)";
      }
    }
  );

  // 3. Fallback pembersihan untuk fungsi warna modern lainnya (oklab, lab, color-p3)
  return converted
    .replace(/oklab\([^)]+\)/gi, "rgb(255, 255, 255)")
    .replace(/lab\([^)]+\)/gi, "rgb(255, 255, 255)")
    .replace(/color\([^)]+\)/gi, "rgb(255, 255, 255)");
}

/**
 * Daftar properti CSS yang sering mengandung fungsi warna
 */
const COLOR_PROPERTIES: readonly string[] = [
  "color",
  "background-color",
  "backgroundColor",
  "border-color",
  "borderColor",
  "border-top-color",
  "borderTopColor",
  "border-right-color",
  "borderRightColor",
  "border-bottom-color",
  "borderBottomColor",
  "border-left-color",
  "borderLeftColor",
  "outline-color",
  "outlineColor",
  "box-shadow",
  "boxShadow",
  "text-shadow",
  "textShadow",
  "fill",
  "stroke",
  "caret-color",
  "accent-color",
];

/**
 * Memindai (parse) seluruh inline style dan CSS variabel pada elemen HTML dan seluruh anaknya,
 * lalu mengonversi setiap nilai warna oklch(...) menjadi rgb(...) secara otomatis.
 */
export function preprocessElementForPdf(container: HTMLElement): void {
  if (!container) return;

  const win = container.ownerDocument.defaultView || window;

  const processNode = (node: HTMLElement) => {
    // 1. Periksa dan ganti inline styles
    if (node.style) {
      // Periksa style properti inline bawaan
      for (let i = 0; i < node.style.length; i++) {
        const propName = node.style[i];
        if (propName) {
          const val = node.style.getPropertyValue(propName);
          if (val && val.includes("oklch")) {
            const safeVal = convertOklchStringToRgb(val);
            node.style.setProperty(
              propName,
              safeVal,
              node.style.getPropertyPriority(propName)
            );
          }
        }
      }

      // Periksa variabel CSS kustom (--*) pada inline style
      const cssText = node.style.cssText;
      if (cssText && cssText.includes("oklch")) {
        node.style.cssText = convertOklchStringToRgb(cssText);
      }
    }

    // 2. Baca computed style dari browser untuk properti warna krusial
    // Jika computed style mengandung oklch dari class Tailwind, tetapkan inline style eksplisit
    try {
      const computed = win.getComputedStyle(node);
      for (const prop of COLOR_PROPERTIES) {
        const computedVal = computed.getPropertyValue(prop);
        if (computedVal && computedVal.includes("oklch")) {
          const safeVal = convertOklchStringToRgb(computedVal);
          node.style.setProperty(prop, safeVal);
        }
      }
    } catch {
      // Abaikan jika getComputedStyle gagal pada node tertentu
    }
  };

  // Proses elemen container utama
  processNode(container);

  // Proses semua turunan elemen
  const descendants = container.querySelectorAll<HTMLElement>("*");
  descendants.forEach((child) => {
    processNode(child);
  });
}

/**
 * Memindai dan mengonversi seluruh tag <style> di dalam dokumen (head & body)
 * agar tidak ada deklarasi rule CSS berbasis oklch yang terbaca oleh html2canvas.
 */
export function convertAllStylesheetsOklch(doc: Document): void {
  try {
    const styleTags = doc.querySelectorAll<HTMLStyleElement>("style");
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent && styleTag.textContent.includes("oklch")) {
        styleTag.textContent = convertOklchStringToRgb(styleTag.textContent);
      }
    });
  } catch {
    // Abaikan jika tidak dapat mengakses stylesheet
  }
}

/**
 * Handler pembersihan menyeluruh untuk dokumen clone yang disediakan html2canvas (onclone)
 */
export function sanitizeDocumentForHtml2Canvas(
  clonedDoc: Document,
  clonedEl: HTMLElement
): void {
  // 1. Pastikan latar belakang dokumen utama dan body adalah putih solid (bukan oklch)
  if (clonedDoc.documentElement) {
    clonedDoc.documentElement.style.backgroundColor = "#ffffff";
    clonedDoc.documentElement.style.color = "#000000";
  }
  if (clonedDoc.body) {
    clonedDoc.body.style.backgroundColor = "#ffffff";
    clonedDoc.body.style.color = "#000000";
  }

  // 2. Bersihkan stylesheet dari oklch
  convertAllStylesheetsOklch(clonedDoc);

  // 3. Pre-process seluruh elemen di dalam clonedEl
  preprocessElementForPdf(clonedEl);
  if (clonedDoc.body) {
    preprocessElementForPdf(clonedDoc.body);
  }

  // 4. Wrap getComputedStyle pada defaultView dokumen clone secara aman
  const win = clonedDoc.defaultView || window;
  if (win && win.getComputedStyle) {
    const origGetComputedStyle = win.getComputedStyle.bind(win);
    win.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
      const style = origGetComputedStyle(elt, pseudoElt);
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
  }
}
