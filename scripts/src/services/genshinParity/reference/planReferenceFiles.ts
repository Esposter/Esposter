import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { COMPONENTS_DIRECTORY, REFERENCE_IMAGE_SUFFIX } from "#src/services/genshinParity/fixtures/constants";
import { getFixtureImageName } from "#src/services/genshinParity/fixtures/getFixtureImageName";
import { REFERENCE_FILE_EXTENSION } from "#src/services/genshinParity/reference/constants";
import { getPrimaryReferenceId } from "#src/services/genshinParity/reference/getPrimaryReferenceId";
import { getVariantEntries } from "#src/services/genshinParity/reference/getVariantEntries";
import { getFlatReferenceFilePath } from "#src/services/genshinParity/shared/getFlatReferenceFilePath";
import { join } from "node:path";

// Where each reference the map names is committed. Each fixture variant with a reference has its primary one beside its
// snapshot, as `Index.reference.webp` or `Index-<variant>.reference.webp`. Every other reference, and every reference whose
// screen has no fixture, is flat in the references folder under its id
export const planReferenceFiles = (
  referenceMap: Record<string, ParityReference>,
  fixtureRows: FixtureScreenRow[],
): ReferenceFilePlan[] => {
  const entries = Object.entries(referenceMap).filter(([, { pending }]) => pending === undefined);
  return entries.map(([id, reference]) => {
    const { screen, variant = "" } = reference;
    const fixtureRow = fixtureRows.find((row) => row.name === screen && row.variant === variant);
    const path =
      fixtureRow !== undefined && getPrimaryReferenceId(getVariantEntries(referenceMap, screen, variant)) === id
        ? join(
            COMPONENTS_DIRECTORY,
            fixtureRow.directory,
            `${getFixtureImageName(variant)}${REFERENCE_IMAGE_SUFFIX}.${REFERENCE_FILE_EXTENSION}`,
          )
        : getFlatReferenceFilePath(id);
    return { id, path, reference };
  });
};
