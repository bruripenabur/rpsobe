import { getFacultyStatutaColor, FacultyStatutaColor, UNPATTI_FACULTY_STATUTA } from "../data/unpattiProdiDatabase";

export { getFacultyStatutaColor, UNPATTI_FACULTY_STATUTA };
export type { FacultyStatutaColor };

/**
 * Mengembalikan styling CSS untuk banner KOP "RENCANA PEMBELAJARAN SEMESTER (RPS) BERBASIS OBE"
 * berdasarkan statuta resmi Fakultas UNPATTI dengan warna teks kontras tajam.
 */
export function getFacultyBannerStyle(namaFakultas: string): React.CSSProperties {
  const statuta = getFacultyStatutaColor(namaFakultas);
  return {
    backgroundColor: statuta.hexFill,
    color: statuta.hexText,
    border: statuta.border || "1px solid #1e293b",
    padding: "6pt 10pt",
    textAlign: "center",
    verticalAlign: "middle",
  };
}
