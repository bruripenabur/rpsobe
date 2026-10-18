import { JenjangPendidikan } from "../data/unpattiProdiDatabase";

export type UserRole = "dosen" | "kaprodi" | "gjm";

export interface UserSession {
  role: UserRole;
  nama: string;
  kodeProdi: string;
  namaProdi: string;
  namaFakultas: string;
  jenjang: JenjangPendidikan;
  isLoggedIn: boolean;
}
