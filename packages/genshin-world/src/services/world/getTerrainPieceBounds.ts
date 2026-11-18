import type { TerrainPieceDomain } from "#src/models/world/TerrainPieceDomain";
import type { TerrainBounds } from "genshin-engine";

// The rectangle a piece's surface can differ from the base within: its outline's bounding box grown by the blend band
// Either side of the outline, past which the piece's share is none
export const getTerrainPieceBounds = ({ outline }: TerrainPieceDomain, blendWidth: number): TerrainBounds => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const { x, z } of outline) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return { maxX: maxX + blendWidth, maxZ: maxZ + blendWidth, minX: minX - blendWidth, minZ: minZ - blendWidth };
};
