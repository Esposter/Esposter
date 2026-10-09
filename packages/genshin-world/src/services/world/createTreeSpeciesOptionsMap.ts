import type { WindriseOak } from "#src/models/windrise/WindriseOak";
import type { TreeOptions } from "genshin-engine";

import { TreeSpecies } from "#src/models/world/TreeSpecies";

// Each species as the tree kit's parameters. Windrise's great oak's leaf clusters, the leaf each holds, its trunk taper
// And its surface roots are read off its export's leaf and bark meshes (the `windrise/oak` record), its branches still
// Provisional. Its cards keep three times the leaf its export's cut cards keep: solid pointed ovals draw the crown as
// Opaque as the export's at about twice it, and its shape pass's envelope reads nearest the export's at three times
// (`Oak.reference`)
export const createTreeSpeciesOptionsMap = ({
  clusters,
  normalField,
  roots,
  trunk,
}: WindriseOak): Record<TreeSpecies, TreeOptions> => ({
  [TreeSpecies.GreatOak]: {
    branchLength: 11,
    cardSize: 2.5,
    clusters,
    leafAreaScale: 3,
    mainBranchCount: 7,
    normalField,
    roots,
    seed: 0,
    trunk,
  },
});
