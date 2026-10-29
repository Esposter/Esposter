import type { FixtureScreenRow } from "#src/models/genshinParity/fixtures/FixtureScreenRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { COMPONENTS_DIRECTORY, REFERENCE_IMAGE_SUFFIX } from "#src/services/genshinParity/fixtures/constants";
import { getFixtureImageName } from "#src/services/genshinParity/fixtures/getFixtureImageName";
import { REFERENCE_FILE_EXTENSION } from "#src/services/genshinParity/reference/constants";
import { getFlatReferenceFilePath } from "#src/services/genshinParity/shared/getFlatReferenceFilePath";
import { ID_SEPARATOR } from "@esposter/shared";
import { join } from "node:path";

// Where each reference the map names is committed. Each fixture variant with a reference has one of them beside its snapshot,
// as `Index.reference.webp` or `Index-<variant>.reference.webp`: its first whole-screen reference in map order, or its first
// reference when it holds none whole-screen. A region only says what is scored, so it never decides the place. Every other
// reference, and every reference whose screen has no fixture, is flat in the references folder under its id
export const planReferenceFiles = (
  referenceMap: Record<string, ParityReference>,
  fixtureRows: FixtureScreenRow[],
): ReferenceFilePlan[] => {
  const entries = Object.entries(referenceMap).filter(([, { pending }]) => pending === undefined);
  const wholeScreenEntries = entries.filter(([, { region }]) => region === undefined);
  const besideIds = new Map<string, string>();
  for (const [id, { screen, variant = "" }] of [...wholeScreenEntries, ...entries]) {
    const variantKey = `${screen}${ID_SEPARATOR}${variant}`;
    if (!besideIds.has(variantKey)) besideIds.set(variantKey, id);
  }
  return entries.map(([id, reference]) => {
    const { screen, variant = "" } = reference;
    const fixtureRow = fixtureRows.find((row) => row.name === screen && row.variant === variant);
    const path =
      fixtureRow !== undefined && besideIds.get(`${screen}${ID_SEPARATOR}${variant}`) === id
        ? join(
            COMPONENTS_DIRECTORY,
            fixtureRow.directory,
            `${getFixtureImageName(variant)}${REFERENCE_IMAGE_SUFFIX}.${REFERENCE_FILE_EXTENSION}`,
          )
        : getFlatReferenceFilePath(id);
    return { id, path, reference };
  });
};
