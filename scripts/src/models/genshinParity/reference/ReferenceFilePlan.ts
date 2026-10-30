import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

// One reference the map names and the committed file it is read from: the id, the map's entry and the file's path.
// The path is in the repository, beside its fixture variant's snapshot or flat in the references folder.
export interface ReferenceFilePlan {
  id: string;
  path: string;
  reference: ParityReference;
}
