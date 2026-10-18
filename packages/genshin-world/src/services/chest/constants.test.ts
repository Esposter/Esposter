import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";

import { describe } from "vitest";

// The drop tables of a chest that holds no artifact set, for the openings that drop none
export const NO_ARTIFACT_DROP_TABLES: ArtifactDropTables = {
  artifactMainAffixPools: [],
  artifactRarityDataMap: new Map(),
  reliquarySets: [],
};

describe.todo("constants");
