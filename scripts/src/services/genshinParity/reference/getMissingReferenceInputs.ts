import { MissingReferenceInputKind } from "#src/models/genshinParity/reference/MissingReferenceInputKind";

// The inputs a reference's comparison reads from disk that are not there yet, each with its path: its reference
// Image and, for a reference judged by a component's witness, that witness's layout. Pure over the paths, `exists`
// Telling whether one is on disk, so `compare --all` reports a reference it cannot measure yet before opening a page
export interface MissingReferenceInput {
  kind: MissingReferenceInputKind;
  path: string;
}

export const getMissingReferenceInputs = (
  referencePath: string,
  witnessLayoutPath: string | undefined,
  exists: (path: string) => boolean,
): MissingReferenceInput[] => {
  const missing: MissingReferenceInput[] = [];
  if (!exists(referencePath)) missing.push({ kind: MissingReferenceInputKind.ReferenceImage, path: referencePath });
  if (witnessLayoutPath !== undefined && !exists(witnessLayoutPath))
    missing.push({ kind: MissingReferenceInputKind.WitnessLayout, path: witnessLayoutPath });
  return missing;
};
