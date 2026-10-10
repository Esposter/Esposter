import type { WindriseOak } from "#src/models/windrise/WindriseOak";
import type { TreeOptions } from "genshin-engine";

import { TreeSpecies } from "#src/models/world/TreeSpecies";

// Each species as the tree kit's parameters. Windrise's great oak's leaf clusters, the leaf each holds, its trunk and
// Limbs and its surface roots are read off its export's leaf and bark meshes (the `windrise/oak` record). Its cards keep
// Three times the leaf its export's cut cards keep: solid pointed ovals draw the crown as opaque as the export's at about
// Twice it, and its shape pass's envelope reads nearest the export's at three times (`Oak.reference`)
export const createTreeSpeciesOptionsMap = ({
  clusters,
  limbs,
  normalField,
  roots,
}: WindriseOak): Record<TreeSpecies, TreeOptions> => ({
  [TreeSpecies.GreatOak]: { cardSize: 2.5, clusters, leafAreaScale: 3, limbs, normalField, roots, seed: 0 },
});
