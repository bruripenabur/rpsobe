import { PipUnpattiItem } from "../types/rps";

/**
 * Pola Ilmiah Pokok (PIP) Universitas Pattimura: "Bina Mulia Ke Lautan"
 * Berdasarkan Surat Keputusan Rektor Unpatti No. 20/1977 & No. 16/SK/1988,
 * serta Dokumen Rekonstruksi PIP Unpatti & Rencana Induk Riset LPPM UNPATTI.
 * 
 * PIP Bina Mulia Ke Lautan mengarahkan seluruh kurikulum dan aktivitas Tri Dharma
 * ke arah pemahaman, pelestarian, dan pemanfaatan sumberdaya berbasis kelautan-kepulauan (laut-pulau).
 */
export const PIP_UNPATTI_LIST: PipUnpattiItem[] = [
  {
    id: "BMK-01",
    code: "BMK-01",
    title: "Agroekosistem Kepulauan & Pertanian Lahan Kering",
    category: "Agrokompleks Kepulauan",
    focusArea: "Budidaya Pangan Lokal & Lahan Kering Pesisir",
    description:
      "Pengembangan budidaya tanaman pangan dan perkebunan lokal (sagu, pala Banda, cengkih, umbi-umbian/hotong), adaptasi pertanian lahan kering berbatu, dan resiliensi agroforestri (dusung) pulau-pulau kecil.",
    keywords: ["agroekosistem", "dusung", "pala", "cengkih", "sagu", "lahan kering", "pulau kecil"],
  },
  {
    id: "BMK-02",
    code: "BMK-02",
    title: "Kearifan Lokal Sasi & Pranata Adat Maluku",
    category: "Sosial Budaya & Kearifan Lokal",
    focusArea: "Konservasi Berbasis Budaya & Modal Sosial",
    description:
      "Integrasi kearifan tradisional Sasi Laut & Sasi Darat, pranata Pela Gandong, kelembagaan adat Negeri (Saniri & Raja), serta modal sosial komunitas Maluku dalam konservasi dan tata kelola sumber daya alam.",
    keywords: ["sasi laut", "pela gandong", "kelembagaan adat", "modal sosial", "negeri", "hukum adat"],
  },
  {
    id: "BMK-03",
    code: "BMK-03",
    title: "Perikanan Berkelanjutan & Marikultur Ramah Lingkungan",
    category: "Perikanan & Marikultur",
    focusArea: "Eksplorasi & Pengelolaan Stok Ikan Kepulauan",
    description:
      "Pengelolaan perikanan tangkap skala kecil (small-scale fisheries), marikultur ramah lingkungan (rumput laut, kerapu, mutiara, teripang), selektivitas alat tangkap, dan perlindungan stok ikan di perairan Maluku (WPP-NRI 714, 715, 718).",
    keywords: ["perikanan tangkap", "marikultur", "rumput laut", "stok ikan", "wpp-nri", "nelayan"],
  },
  {
    id: "BMK-04",
    code: "BMK-04",
    title: "Ekonomi Biru (Blue Economy) & Agribisnis Kepulauan",
    category: "Ekonomi Biru & Logistik",
    focusArea: "Hilirisasi, Rantai Nilai & Pengentasan Kemiskinan",
    description:
      "Optimalisasi rantai nilai ekonomi biru, hilirisasi pascapanen komoditas perikanan dan agro-pesisir, logistik dingin laut, pengentasan kemiskinan masyarakat pesisir, dan penguatan kelembagaan agribisnis kepulauan.",
    keywords: ["ekonomi biru", "blue economy", "hilirisasi", "logistik antarpulau", "kemiskinan pesisir", "agribisnis"],
  },
  {
    id: "BMK-05",
    code: "BMK-05",
    title: "Hukum Laut Adat, Hak Petuanan & Tata Kelola Pesisir",
    category: "Hukum & Tata Kelola Maritim",
    focusArea: "Yurisdiksi Daerah Kepulauan & Hak Ulayat Laut",
    description:
      "Perlindungan hak ulayat laut (petuanan laut), pengakuan hukum masyarakat hukum adat pesisir, tata ruang laut daerah kepulauan (RZWP3K), dan advokasi regulasi otonomi daerah provinsi kepulauan.",
    keywords: ["petuanan laut", "hak ulayat", "hukum adat", "rzwp3k", "provinsi kepulauan", "zonasi"],
  },
  {
    id: "BMK-06",
    code: "BMK-06",
    title: "Konservasi Ekosistem Pesisir & Pulau-Pulau Kecil",
    category: "Konservasi & Ekologi Bahari",
    focusArea: "Biodiversitas Karang, Lamun, Mangrove & PPKT",
    description:
      "Perlindungan keanekaragaman hayati terumbu karang segitiga karang (Coral Triangle), padang lamun, hutan mangrove pesisir, rehabilitasi habitat kritis, serta pengelolaan pulau-pulau kecil terluar (PPKT).",
    keywords: ["terumbu karang", "coral triangle", "mangrove", "padang lamun", "ppkt", "konservasi laut"],
  },
  {
    id: "BMK-07",
    code: "BMK-07",
    title: "Sains Oseanografi & Instrumentasi Kelautan",
    category: "Sains & Keteknikan Bahari",
    focusArea: "Dinamika Arus Laut Dalam & Teknologi Maritim",
    description:
      "Eksplorasi oseanografi massa air laut dalam (Laut Banda, Seram, Arafura), dinamika upwelling, arus lintas Indonesia (ARLINDO), batimetri kepulauan, dan instrumentasi monitoring oseanografi digital.",
    keywords: ["oseanografi", "laut banda", "upwelling", "arlindo", "instrumentasi", "batimetri"],
  },
  {
    id: "BMK-08",
    code: "BMK-08",
    title: "Biofarmaka Biota Laut & Bioteknologi Pesisir",
    category: "Biofarmaka & Bioteknologi",
    focusArea: "Senyawa Bioaktif Biota Laut & Herbal Kepulauan",
    description:
      "Eksplorasi metabolit sekunder biota laut (spons, alga, teripang, moluska), bioprospeksi senyawa bioaktif untuk nutrasetikal dan farmasi, pemanfaatan tanaman herbal pulau, dan inovasi bioteknologi kelautan.",
    keywords: ["biofarmaka", "bioteknologi", "spons", "senyawa bioaktif", "herbal kepulauan", "bioprospeksi"],
  },
  {
    id: "BMK-09",
    code: "BMK-09",
    title: "Mitigasi Bencana Pesisir, Gempa-Tsunami & Resiliensi Iklim",
    category: "Kebencanaan & Resiliensi Iklim",
    focusArea: "Kesiapsiagaan Bencana Laut & Adaptasi Cuaca Ekstrem",
    description:
      "Kesiapsiagaan menghadapi tsunami tektonik sesar aktif Maluku, abrasi pantai, kenaikan muka air laut, cuaca ekstrem gelombang pasang, dan adaptasi resiliensi ekologis masyarakat pulau terhadap perubahan iklim global.",
    keywords: ["tsunami", "abrasi", "sesar aktif maluku", "resiliensi iklim", "mitigasi bencana", "cuaca ekstrem"],
  },
  {
    id: "BMK-10",
    code: "BMK-10",
    title: "Energi Terbarukan Bahari & Konektivitas Antar-Pulau",
    category: "Energi & Infrastruktur Maritim",
    focusArea: "Potensi Arus Laut, Selat Sempit & Transportasi Laut",
    description:
      "Pemanfaatan energi baru terbarukan arus selat sempit Maluku, energi gelombang, sistem PLTS mikrogrid pulau terpencil, serta rekayasa konektivitas dan sistem armada perkapalan perintis antarpulau.",
    keywords: ["energi arus laut", "selat sempit", "mikrogrid surya", "transportasi laut", "kapal perintis"],
  },
  {
    id: "BMK-11",
    code: "BMK-11",
    title: "Kesehatan Komunitas Pesisir & Sanitasi Pulau Terpencil",
    category: "Kesehatan Masyarakat Kepulauan",
    focusArea: "Resiliensi Medis, Gizi Bahari & Air Bersih",
    description:
      "Aksesibilitas layanan medis pulau terpencil melalui perahu klinik (floating clinic), telemedicine maritim, penanggulangan stunting berbasis gizi protein ikan laut, serta teknologi desalinasi air bersih pulau karang.",
    keywords: ["kesehatan kepulauan", "floating clinic", "stunting", "protein ikan", "sanitasi pesisir", "desalinasi"],
  },
  {
    id: "BMK-12",
    code: "BMK-12",
    title: "Kedaulatan & Ketahanan Pangan Bahari-Kepulauan",
    category: "Ketahanan Pangan Kepulauan",
    focusArea: "Kemandirian Pangan Lokal & Diversifikasi Laut-Darat",
    description:
      "Penguatan ketahanan dan kedaulatan pangan berbasis komoditas endemik laut-pulau (ikan, sagu, sukun, enbal), diversifikasi pangan alternatif, pengolahan tradisional (ikan asar), dan lumbung pangan darurat pulau kecil.",
    keywords: ["kedaulatan pangan", "sagu", "ikan asar", "enbal", "pangan lokal", "lumbung pulau"],
  },
];

export const PIP_CATEGORIES = [
  "Semua Kategori",
  "Agrokompleks Kepulauan",
  "Sosial Budaya & Kearifan Lokal",
  "Perikanan & Marikultur",
  "Ekonomi Biru & Logistik",
  "Hukum & Tata Kelola Maritim",
  "Konservasi & Ekologi Bahari",
  "Sains & Keteknikan Bahari",
  "Biofarmaka & Bioteknologi",
  "Kebencanaan & Resiliensi Iklim",
  "Energi & Infrastruktur Maritim",
  "Kesehatan Masyarakat Kepulauan",
  "Ketahanan Pangan Kepulauan",
];
