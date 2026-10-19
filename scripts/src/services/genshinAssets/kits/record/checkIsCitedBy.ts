import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

// Whether a candidate's provenance is the cited file and line, the file relative to its character's folder, or the
// Cited page and row of a wiki talent page
export const checkIsCitedBy = (
  provenance: KitValueSource,
  citation: { file: string; line: number } | { page: string; row: number },
): boolean => {
  if ("file" in citation)
    return "file" in provenance && provenance.file.endsWith(`/${citation.file}`) && provenance.line === citation.line;
  return "page" in provenance && provenance.page === citation.page && provenance.row === citation.row;
};
