import type { TreeOptions } from "genshin-engine";

import oak from "#src/data/windrise/oak.json";
import { TreeSpecies } from "#src/models/world/TreeSpecies";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Each species as the tree kit's parameters. Windrise's great oak's leaf clusters and trunk taper are read off its
// Export's leaf and bark meshes (`data/windrise/oak.json`), its branches still provisional
const [oakTrunkFoot, oakTrunkNext, ...oakTrunkRest] = oak.trunk;
if (!oakTrunkFoot || !oakTrunkNext)
  throw new InvalidOperationError(Operation.Read, "windrise/oak.json", "has fewer than two trunk stations");

export const TreeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions> = {
  [TreeSpecies.GreatOak]: {
    branchLength: 11,
    cardSize: 2.5,
    cardsPerCluster: 800,
    clusters: oak.clusters,
    mainBranchCount: 7,
    seed: 0,
    trunk: [oakTrunkFoot, oakTrunkNext, ...oakTrunkRest],
  },
};
