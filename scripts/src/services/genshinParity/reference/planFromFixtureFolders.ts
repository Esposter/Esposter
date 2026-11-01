import type { ReferenceFilePlan } from "#src/models/genshinParity/reference/ReferenceFilePlan";

import { COMPONENTS_DIRECTORY } from "#src/services/genshinParity/fixtures/constants";
import { listFixtureScreens } from "#src/services/genshinParity/fixtures/listFixtureScreens";
import { planReferenceFiles } from "#src/services/genshinParity/reference/planReferenceFiles";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";

export const planFromFixtureFolders = async (): Promise<ReferenceFilePlan[]> =>
  planReferenceFiles(
    ParityReferenceMap,
    await listFixtureScreens(COMPONENTS_DIRECTORY, ParityReferenceMap, new Map()),
    COMPONENTS_DIRECTORY,
  );
