import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { COMPONENTS_DIRECTORY } from "#src/services/genshinParity/fixtures/constants";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { planReferenceFiles } from "#src/services/genshinParity/reference/planReferenceFiles";
import { readCommittedBeside } from "#src/services/genshinParity/reference/readCommittedBeside";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

export const planFromFixtureFolders = async (): Promise<ReferenceFilePlan[]> => {
  const fixtureRows = await listFixtureScreens(COMPONENTS_DIRECTORY, ParityReferenceMap, new Map());
  return planReferenceFiles(
    ParityReferenceMap,
    fixtureRows,
    COMPONENTS_DIRECTORY,
    await readCommittedBeside(COMPONENTS_DIRECTORY, fixtureRows),
  );
};
