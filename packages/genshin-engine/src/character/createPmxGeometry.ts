import type { PmxModel } from "#src/models/character/PmxModel";
import type { BufferGeometry } from "three";

import { createIndexedGeometry } from "#src/kits/createIndexedGeometry";
import { BufferAttribute } from "three";

// A PMX model's vertices and triangles as one skinned geometry, a group for each material's run of triangles in the
// File's order, the order MMD draws them in
export const createPmxGeometry = ({
  indices,
  materials,
  vertices: { normals, positions, skinIndices, skinWeights, uvs },
}: Pick<PmxModel, "indices" | "materials" | "vertices">): BufferGeometry => {
  const geometry = createIndexedGeometry({ indices, normals, positions, uvs });
  geometry.setAttribute("skinIndex", new BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new BufferAttribute(skinWeights, 4));
  let start = 0;
  for (const [materialIndex, { indexCount }] of materials.entries()) {
    geometry.addGroup(start, indexCount, materialIndex);
    start += indexCount;
  }

  return geometry;
};
