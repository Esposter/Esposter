import type { TreeOptions } from "genshin-engine";

import { TreeSpecies } from "#src/models/world/TreeSpecies";

// Each species as the tree kit's parameters. Windrise's great oak is the first: a broad trunk and seven boughs under a
// Crown of large clusters, as its reference screenshots show it. Provisional: each is fitted to its species' own export,
// Its outline and depth in the shape pass
export const TreeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions> = {
  [TreeSpecies.GreatOak]: {
    branchLength: 11,
    cardSize: 1.3,
    cardsPerCluster: 220,
    clusterRadius: 5.5,
    mainBranchCount: 7,
    seed: 0,
    trunkHeight: 12,
    trunkRadius: 1.9,
  },
};
