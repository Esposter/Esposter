import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { COMPONENTS_DIRECTORY } from "#src/services/genshinParity/fixtures/constants";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { planReferenceFiles } from "#src/services/genshinParity/reference/planReferenceFiles";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

const planFromFixtureFolders = async (): Promise<ReferenceFilePlan[]> =>
  planReferenceFiles(
    ParityReferenceMap,
    await listFixtureScreens(COMPONENTS_DIRECTORY, ParityReferenceMap, new Map()),
    COMPONENTS_DIRECTORY,
  );

let referenceFiles: Promise<ReferenceFilePlan[]> | undefined;

// The committed file of every reference the map names, planned from the fixture folders and the map.
// The plan is read once per process, since neither changes during a command and every reference's lookup reads it.
// The components tree is walked once, not per reference.
export const readReferenceFiles = (): Promise<ReferenceFilePlan[]> => {
  referenceFiles ??= planFromFixtureFolders();
  return referenceFiles;
};
