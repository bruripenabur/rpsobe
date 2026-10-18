import { ReferenceItem, SourceType } from "../types/reference";
import { generateApaCitation } from "./referenceDatabase";

export interface OnlineSearchResult {
  items: ReferenceItem[];
  sourceName: string;
  totalFound: number;
}

/**
 * Cari literatur ilmiah dari CrossRef REST API
 * (Mencakup jutaan jurnal nasional SINTA/internasional bereputasi Scopus/WoS dan buku ber-DOI)
 */
export async function searchCrossRef(query: string, bidangMK = "Umum"): Promise<OnlineSearchResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { items: [], sourceName: "CrossRef API", totalFound: 0 };

  const url = `https://api.crossref.org/works?query=${encodeURIComponent(
    cleanQuery
  )}&rows=15&mailto=unpatti-rps-obe@unpatti.ac.id`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CrossRef API HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const items = data?.message?.items || [];

    const mappedItems: ReferenceItem[] = items.map((item: any, idx: number) => {
      const title = Array.isArray(item.title) ? item.title[0] : item.title || "Tanpa Judul";

      // Penulis
      let authors = "Anonim";
      if (Array.isArray(item.author) && item.author.length > 0) {
        authors = item.author
          .slice(0, 4)
          .map((a: any) => {
            if (a.family && a.given) {
              const initials = a.given
                .split(" ")
                .map((n: string) => n[0] + ".")
                .join(" ");
              return `${a.family}, ${initials}`;
            }
            return a.name || a.family || a.given || "";
          })
          .filter(Boolean)
          .join(", ");

        if (item.author.length > 4) {
          authors += ", et al.";
        }
      }

      // Tahun terbit
      const year =
        item.issued?.["date-parts"]?.[0]?.[0] ||
        item["published-print"]?.["date-parts"]?.[0]?.[0] ||
        item["published-online"]?.["date-parts"]?.[0]?.[0] ||
        new Date().getFullYear();

      // Sumber / Jurnal / Penerbit
      const journal =
        Array.isArray(item["container-title"]) && item["container-title"].length > 0
          ? item["container-title"][0]
          : item.publisher || "Penerbit Ilmiah";

      const doi = item.DOI ? `https://doi.org/${item.DOI}` : undefined;
      const urlTarget = item.URL || doi || "";

      let sourceType: SourceType = "jurnal";
      if (item.type?.includes("book")) sourceType = "buku";
      else if (item.type?.includes("proceedings")) sourceType = "prosiding";

      const refPartial: Partial<ReferenceItem> = {
        title,
        authors,
        year,
        publisherOrJournal: journal,
        cityOrUrl: urlTarget,
        doi: item.DOI,
      };

      const formattedCitation = generateApaCitation(refPartial);

      return {
        id: `crossref-${item.DOI ? item.DOI.replace(/[^a-zA-Z0-9]/g, "-") : idx}-${Date.now()}`,
        title,
        authors,
        year,
        sourceType,
        publisherOrJournal: journal,
        cityOrUrl: urlTarget,
        doi: item.DOI,
        kategoriPustaka: "utama",
        bidangMataKuliah: bidangMK,
        formattedCitation,
        tags: ["CrossRef", item.type || "article"],
        isCustom: true,
      };
    });

    return {
      items: mappedItems,
      sourceName: "CrossRef (Jurnal & Buku Ber-DOI)",
      totalFound: data?.message?.["total-results"] || mappedItems.length,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn("Pencarian CrossRef terhambat:", err.message);
    throw err;
  }
}

/**
 * Cari literatur ilmiah dari OpenAlex REST API (Free Academic Graph)
 */
export async function searchOpenAlex(query: string, bidangMK = "Umum"): Promise<OnlineSearchResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { items: [], sourceName: "OpenAlex API", totalFound: 0 };

  const url = `https://api.openalex.org/works?search=${encodeURIComponent(
    cleanQuery
  )}&per_page=15&mailto=unpatti-rps-obe@unpatti.ac.id`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OpenAlex API HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const results = data?.results || [];

    const mappedItems: ReferenceItem[] = results.map((work: any, idx: number) => {
      const title = work.title || "Tanpa Judul";

      // Authors
      let authors = "Anonim";
      if (Array.isArray(work.authorships) && work.authorships.length > 0) {
        authors = work.authorships
          .slice(0, 4)
          .map((a: any) => a.author?.display_name)
          .filter(Boolean)
          .join(", ");
        if (work.authorships.length > 4) {
          authors += ", et al.";
        }
      }

      const year = work.publication_year || new Date().getFullYear();
      const journal = work.primary_location?.source?.display_name || "Jurnal Ilmiah Internasional";
      const doi = work.doi || "";
      const urlTarget = work.primary_location?.landing_page_url || doi;

      const refPartial: Partial<ReferenceItem> = {
        title,
        authors,
        year,
        publisherOrJournal: journal,
        cityOrUrl: urlTarget,
        doi: doi.replace("https://doi.org/", ""),
      };

      const formattedCitation = generateApaCitation(refPartial);

      return {
        id: `openalex-${work.id?.split("/")?.pop() || idx}-${Date.now()}`,
        title,
        authors,
        year,
        sourceType: "jurnal",
        publisherOrJournal: journal,
        cityOrUrl: urlTarget,
        doi,
        kategoriPustaka: "utama",
        bidangMataKuliah: bidangMK,
        formattedCitation,
        tags: ["OpenAlex", work.type || "article"],
        isCustom: true,
      };
    });

    return {
      items: mappedItems,
      sourceName: "OpenAlex (Global Scholarly Index)",
      totalFound: data?.meta?.count || mappedItems.length,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn("Pencarian OpenAlex terhambat:", err.message);
    throw err;
  }
}

/**
 * Cari buku teks dari Open Library Search API
 */
export async function searchOpenLibrary(query: string, bidangMK = "Umum"): Promise<OnlineSearchResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { items: [], sourceName: "Open Library", totalFound: 0 };

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQuery)}&limit=15`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Open Library API HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const docs = data?.docs || [];

    const mappedItems: ReferenceItem[] = docs.map((doc: any, idx: number) => {
      const title = doc.title || "Tanpa Judul Buku";
      const authors = Array.isArray(doc.author_name)
        ? doc.author_name.slice(0, 3).join(", ")
        : doc.author_name || "Anonim";
      const year = doc.first_publish_year || new Date().getFullYear();
      const publisher = Array.isArray(doc.publisher) ? doc.publisher[0] : doc.publisher || "Penerbit Buku";
      const urlTarget = doc.key ? `https://openlibrary.org${doc.key}` : "";

      const refPartial: Partial<ReferenceItem> = {
        title,
        authors,
        year,
        publisherOrJournal: publisher,
        cityOrUrl: urlTarget,
      };

      const formattedCitation = generateApaCitation(refPartial);

      return {
        id: `openlib-${doc.cover_edition_key || idx}-${Date.now()}`,
        title,
        authors,
        year,
        sourceType: "buku",
        publisherOrJournal: publisher,
        cityOrUrl: urlTarget,
        kategoriPustaka: "pendukung",
        bidangMataKuliah: bidangMK,
        formattedCitation,
        tags: ["Buku Teks", "Open Library"],
        isCustom: true,
      };
    });

    return {
      items: mappedItems,
      sourceName: "Open Library (Buku Teks & Monograf)",
      totalFound: data?.numFound || mappedItems.length,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn("Pencarian Open Library terhambat:", err.message);
    throw err;
  }
}

/**
 * Master dispatcher pencarian pustaka eksternal multi-sumber dengan fallback cerdas
 */
export async function searchOnlineLibrary(
  query: string,
  source: "crossref" | "openalex" | "openlibrary" = "crossref",
  bidangMK = "Umum"
): Promise<OnlineSearchResult> {
  try {
    if (source === "openalex") {
      return await searchOpenAlex(query, bidangMK);
    } else if (source === "openlibrary") {
      return await searchOpenLibrary(query, bidangMK);
    } else {
      // Default: CrossRef
      return await searchCrossRef(query, bidangMK);
    }
  } catch (primaryErr) {
    // Jika provider utama gagal (timeout/jaringan), otomatis alihkan ke OpenAlex
    if (source !== "openalex") {
      try {
        console.info("Mencoba fallback otomatis ke OpenAlex...");
        return await searchOpenAlex(query, bidangMK);
      } catch (fallbackErr) {
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
}
