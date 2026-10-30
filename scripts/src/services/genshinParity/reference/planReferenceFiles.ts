import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { getPrimaryReferenceId } from "#src/services/genshinParity/reference/getPrimaryReferenceId";
import { getVariantEntries } from "#src/services/genshinParity/reference/getVariantEntries";
import { getFixtureReferenceFilePath } from "#src/services/genshinParity/shared/getFixtureReferenceFilePath";
import { getFlatReferenceFilePath } from "#src/services/genshinParity/shared/getFlatReferenceFilePath";
import { join } from "node:path";

// Where each reference the map names is committed.
// Each fixture variant with a reference has its primary one beside its snapshot.
// That file is named `Index.reference.webp` or `Index-<variant>.reference.webp`.
// Every other reference, and every reference whose screen has no fixture, is flat in the references folder under its id.
// The fixture rows were read from `componentsDirectory`.
export const planReferenceFiles = (
  referenceMap: Record<string, ParityReference>,
  fixtureRows: FixtureScreenRow[],
  componentsDirectory: string,
): ReferenceFilePlan[] => {
  const entries = Object.entries(referenceMap).filter(([, { pending }]) => pending === undefined);
  return entries.map(([id, reference]) => {
    const { screen, variant = "" } = reference;
    const fixtureRow = fixtureRows.find((row) => row.name === screen && row.variant === variant);
    const path =
      fixtureRow !== undefined && getPrimaryReferenceId(getVariantEntries(referenceMap, screen, variant)) === id
        ? getFixtureReferenceFilePath(join(componentsDirectory, fixtureRow.directory), variant)
        : getFlatReferenceFilePath(id);
    return { id, path, reference };
  });
};
