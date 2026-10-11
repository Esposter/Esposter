import type { LeafCards } from "#src/models/kits/tree/LeafCards";

import { BufferAttribute, BufferGeometry } from "three";

// A generator's typed arrays wrapped as one indexed geometry, with its bounding sphere measured
export const createIndexedGeometry = ({ indices, normals, positions, uvs }: LeafCards): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(indices, 1));
  geometry.computeBoundingSphere();
  return geometry;
};
