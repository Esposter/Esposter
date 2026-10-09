import type { TerrainTileArrays } from "#src/models/terrain/TerrainTileArrays";
import type { Box3 } from "three";

import { BufferAttribute, BufferGeometry, Sphere } from "three";

// A tile's arrays wrapped for the GPU over the index every tile shares, bounded for frustum culling by the box given and
// The sphere round it, so the frame that first culls it never computes the bounds over its vertices
export const createTerrainTileGeometry = (
  { coarseColors, coarseNormals, coarsePositions, colors, normals, positions }: TerrainTileArrays,
  index: BufferAttribute,
  boundingBox: Box3,
): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setAttribute("coarsePosition", new BufferAttribute(coarsePositions, 4));
  geometry.setAttribute("coarseNormal", new BufferAttribute(coarseNormals, 3));
  geometry.setAttribute("coarseColor", new BufferAttribute(coarseColors, 3));
  geometry.setIndex(index);
  geometry.boundingBox = boundingBox;
  geometry.boundingSphere = boundingBox.getBoundingSphere(new Sphere());
  return geometry;
};
