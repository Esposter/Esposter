import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

// What the manifest disagrees with the map on, one line each, checked without the network: a row for an id the map does
// not name, and a plate the map does not name a source for or a missing one. A committed file's own hash is checked by the
// committed references test, since it is read from the tree
export const getReferenceManifestProblems = (
  rows: ParityReferenceManifestRow[],
  references: Record<string, ParityReference>,
): string[] =>
  rows.flatMap((row) => {
    const reference = references[row.id];
    if (reference === undefined) return [`${row.id} is in the manifest but not in the map`];
    if ((row.plate === undefined) === (reference.plateSource !== undefined))
      return [
        row.plate === undefined
          ? `${row.id} names a plate source but has no plate`
          : `${row.id} has a plate its entry names no source for`,
      ];
    return [];
  });
