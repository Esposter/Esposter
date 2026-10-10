import type { LeafCards } from "#src/models/kits/tree/LeafCards";
import type { TreeGeometry } from "#src/models/kits/tree/TreeGeometry";
import type { TreeOptions } from "#src/models/kits/tree/TreeOptions";
import type { TreeTubes } from "#src/models/kits/tree/TreeTubes";

import { computeLeafCards } from "#src/kits/tree/computeLeafCards";
import { computeTreeTubes } from "#src/kits/tree/computeTreeTubes";
import { BufferAttribute, BufferGeometry } from "three";

// A generator's typed arrays wrapped as one indexed geometry
const createIndexedGeometry = ({ indices, normals, positions, uvs }: LeafCards | TreeTubes): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
};
// A tree as two geometries, one per material: its wood, its trunk, limbs and surface roots each a swept tube in one
// Mesh, and its leaves, every card in one mesh, so a tree is two draws and a forest of one species is two instanced
// Draws
export const createTreeGeometry = ({ limbs, roots, ...treeOptions }: TreeOptions): TreeGeometry => ({
  branchGeometry: createIndexedGeometry(computeTreeTubes([...limbs, ...roots])),
  leafGeometry: createIndexedGeometry(computeLeafCards(treeOptions.clusters, treeOptions)),
});
