import type { TerrainTile } from "#src/terrain/TerrainTile";

import { BufferAttribute, BufferGeometry } from "three";

// A tile's arrays wrapped for the GPU over the index every tile shares, with its bounds for frustum culling
export const createTerrainTileGeometry = (
  { coarsePositions, colors, normals, positions }: TerrainTile,
  index: BufferAttribute,
): BufferGeometry => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.setAttribute("coarsePosition", new BufferAttribute(coarsePositions, 4));
  geometry.setIndex(index);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};
