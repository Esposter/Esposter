import type { PmxModel } from "#src/models/character/PmxModel";
import type { BufferGeometry } from "three";

import { createBlinkMorphAttribute } from "#src/character/face/createBlinkMorphAttribute";
import { createIndexedGeometry } from "#src/kits/createIndexedGeometry";
import { BufferAttribute } from "three";

// A PMX model's vertices and triangles as one skinned geometry, a group for each material's run of triangles in the
// File's order, the order MMD draws them in. Its blink, when the pack names one, is a morph target of the geometry
export const createPmxGeometry = ({
  indices,
  materials,
  morphs,
  vertices: { normals, positions, skinIndices, skinWeights, subUvs, uvs },
}: Pick<PmxModel, "indices" | "materials" | "morphs" | "vertices">): BufferGeometry => {
  const geometry = createIndexedGeometry({ indices, normals, positions, uvs });
  geometry.setAttribute("skinIndex", new BufferAttribute(skinIndices, 4));
  geometry.setAttribute("skinWeight", new BufferAttribute(skinWeights, 4));
  geometry.setAttribute("subUv", new BufferAttribute(subUvs, 2));
  const blink = createBlinkMorphAttribute(morphs, positions.length / 3);
  if (blink) {
    geometry.morphAttributes.position = [blink];
    geometry.morphTargetsRelative = true;
  }

  let start = 0;
  for (const [materialIndex, { indexCount }] of materials.entries()) {
    geometry.addGroup(start, indexCount, materialIndex);
    start += indexCount;
  }

  return geometry;
};
