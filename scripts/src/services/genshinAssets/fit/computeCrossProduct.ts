import type { OutlinePoint } from "#src/models/genshinAssets/fit/OutlinePoint";

// The cross product of the vectors from `origin` to `first` and to `second`, whose sign gives the turn between them
export const computeCrossProduct = (
  [originX, originZ]: OutlinePoint,
  [firstX, firstZ]: OutlinePoint,
  [secondX, secondZ]: OutlinePoint,
): number => (firstX - originX) * (secondZ - originZ) - (firstZ - originZ) * (secondX - originX);
