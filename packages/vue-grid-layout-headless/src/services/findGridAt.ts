import type { GridPoint } from "#src/models/GridPoint";
import type { MountedGrid } from "#src/models/MountedGrid";

import { findGridRoot } from "#src/services/findGridRoot";
import { mountedGrids } from "#src/services/mountedGrids";

// The grid under a point is the one whose root is nearest the element the point hits, so an inner grid takes a drop over an outer one
export const findGridAt = (point: GridPoint): MountedGrid | undefined => {
  const hit = window.document.elementFromPoint(point.x, point.y);
  const root = findGridRoot(hit);
  return root ? mountedGrids.get(root) : undefined;
};
