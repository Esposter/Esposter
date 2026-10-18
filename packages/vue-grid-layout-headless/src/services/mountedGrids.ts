import type { GridPoint } from "#src/models/GridPoint";
import type { MountedGrid } from "#src/models/MountedGrid";

// The grids on the page keyed by their roots, so the element under a pointer finds the grid it is over
const mountedGrids = new Map<Element, MountedGrid>();

export const registerGrid = (root: Element, grid: MountedGrid): void => {
  mountedGrids.set(root, grid);
};
export const unregisterGrid = (root: Element): void => {
  mountedGrids.delete(root);
};
// The root of the nearest registered grid at or above an element, so an inner grid's root is found before an outer one's
export const findGridRoot = (element: Element | null): Element | undefined => {
  let current = element;
  while (current && !mountedGrids.has(current)) current = current.parentElement;
  return current ?? undefined;
};
// The grid under a point is the one whose root is nearest the element the point hits, so an inner grid takes a drop over an outer one
export const findGridAt = (point: GridPoint): MountedGrid | undefined => {
  const hit = window.document.elementFromPoint(point.x, point.y);
  const root = findGridRoot(hit);
  return root ? mountedGrids.get(root) : undefined;
};
