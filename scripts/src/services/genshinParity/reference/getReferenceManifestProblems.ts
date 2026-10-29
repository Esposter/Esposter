import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { getCleanPlateDigest } from "#src/services/genshinParity/reference/getCleanPlateDigest";
import { getCleanPlateRegions } from "#src/services/genshinParity/reference/getCleanPlateRegions";

// What the manifest disagrees with the map on, one line each, checked without the network: a row for an id the map does
// not name, a plate the map does not name a source for or a missing one, and a clean plate the map draws none for or one
// filled from other bytes or regions than the map's. The stored bytes' own hashes are checked when they are fetched
export const getReferenceManifestProblems = (
  rows: ParityReferenceManifestRow[],
  references: Record<string, ParityReference>,
): string[] =>
  rows.flatMap((row) => {
    const reference = references[row.id];
    if (reference === undefined) return [`${row.id} is in the manifest but not in the map`];
    const problems: string[] = [];
    if ((row.plate === undefined) === (reference.plateSource !== undefined))
      problems.push(
        row.plate === undefined
          ? `${row.id} names a plate source but has no plate`
          : `${row.id} has a plate its entry names no source for`,
      );
    const regions = getCleanPlateRegions(reference, { height: row.height, width: row.width });
    if (regions === undefined) {
      if (row.cleanPlate !== undefined) problems.push(`${row.id} has a clean plate its entry draws none for`);
      return problems;
    }
    const inputSha256 = row.plate?.sha256 ?? row.sha256;
    const digest = getCleanPlateDigest(inputSha256, regions);
    if (row.cleanPlate?.digest !== digest)
      problems.push(`${row.id} has a clean plate filled from other bytes or regions than its entry names`);
    return problems;
  });
