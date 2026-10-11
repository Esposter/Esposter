import type { TreeGeometry } from "#src/models/kits/tree/TreeGeometry";
import type { TreeOptions } from "#src/models/kits/tree/TreeOptions";

import { createIndexedGeometry } from "#src/kits/createIndexedGeometry";
import { computeLeafCards } from "#src/kits/tree/computeLeafCards";
import { computeTreeTubes } from "#src/kits/tree/computeTreeTubes";

// A tree as two geometries, one per material: its wood, its trunk, limbs and surface roots each a swept tube in one
// Mesh, and its leaves, every card in one mesh, so a tree is two draws and a forest of one species is two instanced
// Draws
export const createTreeGeometry = ({ limbs, roots, ...treeOptions }: TreeOptions): TreeGeometry => ({
  branchGeometry: createIndexedGeometry(computeTreeTubes([...limbs, ...roots])),
  leafGeometry: createIndexedGeometry(computeLeafCards(treeOptions.clusters, treeOptions)),
});
