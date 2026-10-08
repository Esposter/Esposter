import type { TreeOptions } from "genshin-engine";

import oak from "#src/data/windrise/oak.json";
import { TreeSpecies } from "#src/models/world/TreeSpecies";

// Each species as the tree kit's parameters. Windrise's great oak's leaf clusters and trunk taper are read off its
// Export's leaf and bark meshes (`data/windrise/oak.json`), its branches still provisional
export const TreeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions> = {
  [TreeSpecies.GreatOak]: {
    branchLength: 11,
    cardSize: 2.5,
    cardsPerCluster: 400,
    clusters: oak.clusters,
    mainBranchCount: 7,
    seed: 0,
    trunk: oak.trunk,
  },
};
