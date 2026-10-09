import type { CityArea } from "#src/models/genshinAssets/world/CityArea";
import type { CityAreaExtent } from "#src/models/genshinAssets/world/CityAreaExtent";
import type { WorldPlacement } from "#src/models/genshinAssets/world/WorldPlacement";

// A city area's extent and centroid from the placements its blob holds, in the game's axes, or nothing where it holds none
export const toCityArea = (code: string, placements: readonly WorldPlacement[]): CityArea | undefined => {
  if (placements.length === 0) return undefined;
  const extent = placements.reduce<CityAreaExtent>(
    (box, { position: [x, , z] }) => ({
      maxX: Math.max(box.maxX, x),
      maxZ: Math.max(box.maxZ, z),
      minX: Math.min(box.minX, x),
      minZ: Math.min(box.minZ, z),
    }),
    { maxX: -Infinity, maxZ: -Infinity, minX: Infinity, minZ: Infinity },
  );
  const sum = placements.reduce((total, { position: [x, , z] }) => ({ x: total.x + x, z: total.z + z }), {
    x: 0,
    z: 0,
  });
  return {
    centroid: { x: sum.x / placements.length, z: sum.z / placements.length },
    code,
    extent,
    placementCount: placements.length,
  };
};
