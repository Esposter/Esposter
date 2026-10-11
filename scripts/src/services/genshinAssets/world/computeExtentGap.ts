import type { CityAreaExtent } from "#src/models/genshinAssets/world/CityAreaExtent";

// How far apart two extents in the game's axes stand, none where they overlap: a place is an extent of no size
export const computeExtentGap = (first: CityAreaExtent, second: CityAreaExtent): number =>
  Math.hypot(
    Math.max(first.minX - second.maxX, 0, second.minX - first.maxX),
    Math.max(first.minZ - second.maxZ, 0, second.minZ - first.maxZ),
  );
