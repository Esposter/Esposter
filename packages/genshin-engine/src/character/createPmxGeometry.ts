import type { PmxModel } from "#src/models/character/PmxModel";

import { BufferAttribute, BufferGeometry } from "three";

// A PMX model's vertices and triangles as one skinned geometry, a group for each material's run of triangles in the
// File's order, the order MMD draws them in
export const createPmxGeometry = ({
  indices,
  materials,
  vertices: { normals, positions, skinIndices, skinWeights, uvs },
}: Pick<PmxModel, "indices" | "materials" | "vertices">): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setAttribute("skinIndex", new BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new BufferAttribute(skinWeights, 4));
  geometry.setIndex(new BufferAttribute(indices, 1));
  let start = 0;
  for (const [materialIndex, { indexCount }] of materials.entries()) {
    geometry.addGroup(start, indexCount, materialIndex);
    start += indexCount;
  }

  return geometry;
};
