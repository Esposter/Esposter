import type { Outline } from "#src/models/genshinAssets/fit/Outline";

// The cross product of the vectors from `origin` to `first` and to `second`, whose sign gives the turn between them
export const computeCrossProduct = (
  [originX, originZ]: Outline,
  [firstX, firstZ]: Outline,
  [secondX, secondZ]: Outline,
): number => (firstX - originX) * (secondZ - originZ) - (firstZ - originZ) * (secondX - originX);
