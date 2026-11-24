import type { MountedGrid } from "#src/internal/models/MountedGrid";
import type { GridPoint } from "#src/models/GridPoint";

import { findGridRoot } from "#src/internal/services/findGridRoot";
import { mountedGrids } from "#src/internal/services/mountedGrids";

// The grid under a point is the one whose root is nearest the first element the point hits outside the given element,
// So an inner grid takes a drop over an outer one, and the element being dragged, which is drawn under the pointer,
// Never does
export const findGridAt = (point: GridPoint, element: Element): MountedGrid | undefined => {
  const hit = window.document.elementsFromPoint(point.x, point.y).find((candidate) => !element.contains(candidate));
  const root = findGridRoot(hit ?? null);
  return root ? mountedGrids.get(root) : undefined;
};
