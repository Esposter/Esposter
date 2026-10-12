import type { KitValueSource } from "#src/models/genshinAssets/kits/KitValueSource";

// Whether a candidate's provenance is the cited file and line, the file relative to its character's folder
export const checkIsCitedBy = (provenance: KitValueSource, citation: { file: string; line: number }): boolean =>
  "file" in provenance && provenance.file.endsWith(`/${citation.file}`) && provenance.line === citation.line;
