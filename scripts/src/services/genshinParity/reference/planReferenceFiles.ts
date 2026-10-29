import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { COMPONENTS_DIRECTORY, REFERENCE_IMAGE_SUFFIX } from "#src/services/genshinParity/fixtures/constants";
import { getFixtureImageName } from "#src/services/genshinParity/fixtures/getFixtureImageName";
import { REFERENCE_FILE_EXTENSION } from "#src/services/genshinParity/reference/constants";
import { getFlatReferenceFilePath } from "#src/services/genshinParity/shared/getFlatReferenceFilePath";
import { ID_SEPARATOR } from "@esposter/shared";
import { join } from "node:path";

// Where each reference the map names is committed. A whole-screen reference that is the only one its fixture variant has
// sits beside that variant's snapshot, as `Index.reference.webp` or `Index-<variant>.reference.webp`. Every other reference,
// a region of a screen or one of several whole-screen references a variant holds, is flat in the references folder under its id
export const planReferenceFiles = (
  referenceMap: Record<string, ParityReference>,
  fixtureRows: FixtureScreenRow[],
): ReferenceFilePlan[] => {
  const entries = Object.entries(referenceMap).filter(([, { pending }]) => pending === undefined);
  const variantKey = (screen: string, variant: string): string => `${screen}${ID_SEPARATOR}${variant}`;
  const wholeCounts = new Map<string, number>();
  for (const [, { region, screen, variant = "" }] of entries)
    if (region === undefined)
      wholeCounts.set(variantKey(screen, variant), (wholeCounts.get(variantKey(screen, variant)) ?? 0) + 1);
  return entries.map(([id, reference]) => {
    const { region, screen, variant = "" } = reference;
    const fixtureRow = fixtureRows.find((row) => row.name === screen && row.variant === variant);
    const isBeside =
      region === undefined && fixtureRow !== undefined && wholeCounts.get(variantKey(screen, variant)) === 1;
    const path =
      isBeside && fixtureRow !== undefined
        ? join(
            COMPONENTS_DIRECTORY,
            fixtureRow.directory,
            `${getFixtureImageName(variant)}${REFERENCE_IMAGE_SUFFIX}.${REFERENCE_FILE_EXTENSION}`,
          )
        : getFlatReferenceFilePath(id);
    return { id, path, reference };
  });
};
