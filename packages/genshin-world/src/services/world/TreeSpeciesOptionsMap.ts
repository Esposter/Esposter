import type { TreeOptions } from "genshin-engine";

import oak from "#src/data/windrise/oak.json";
import { TreeSpecies } from "#src/models/world/TreeSpecies";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Each species as the tree kit's parameters. Windrise's great oak's leaf clusters, the leaf each holds and its trunk
// Taper are read off its export's leaf and bark meshes (`data/windrise/oak.json`), its branches still provisional. Its
// Cards keep three times the leaf its export's cut cards keep: solid pointed ovals draw the crown as opaque as the
// Export's at about twice it, and its shape pass's envelope reads nearest the export's at three times (`Oak.reference`)
const [oakTrunkFoot, oakTrunkNext, ...oakTrunkRest] = oak.trunk;
if (!oakTrunkFoot || !oakTrunkNext)
  throw new InvalidOperationError(Operation.Read, "windrise/oak.json", "has fewer than two trunk stations");

export const TreeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions> = {
  [TreeSpecies.GreatOak]: {
    branchLength: 11,
    cardSize: 2.5,
    clusters: oak.clusters,
    leafAreaScale: 3,
    mainBranchCount: 7,
    normalField: oak.normalField,
    seed: 0,
    trunk: [oakTrunkFoot, oakTrunkNext, ...oakTrunkRest],
  },
};
