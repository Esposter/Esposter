import { MissingReferenceInputKind } from "#src/models/genshinParity/reference/MissingReferenceInputKind";

// The inputs a reference's comparison reads from disk that are not there yet, each with its path.
// They are its reference image, and its plate when its entry names a plate source.
// For a reference judged by a component's witness, they also include that witness's layout.
// Pure over the paths, with `exists` telling whether one is on disk.
// That lets `compare --all` report a reference it cannot measure yet before opening a page
export interface MissingReferenceInput {
  kind: MissingReferenceInputKind;
  path: string;
}

export const getMissingReferenceInputs = (
  referencePath: string,
  platePath: string | undefined,
  witnessLayoutPath: string | undefined,
  exists: (path: string) => boolean,
): MissingReferenceInput[] => {
  const missing: MissingReferenceInput[] = [];
  if (!exists(referencePath)) missing.push({ kind: MissingReferenceInputKind.ReferenceImage, path: referencePath });
  if (platePath !== undefined && !exists(platePath))
    missing.push({ kind: MissingReferenceInputKind.Plate, path: platePath });
  if (witnessLayoutPath !== undefined && !exists(witnessLayoutPath))
    missing.push({ kind: MissingReferenceInputKind.WitnessLayout, path: witnessLayoutPath });
  return missing;
};
