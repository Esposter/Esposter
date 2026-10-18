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
// The grid under a point is the nearest registered root above the element the point hits, so an inner grid takes a drop over an outer one
export const findGridAt = (point: GridPoint): MountedGrid | undefined => {
  let element: Element | null = window.document.elementFromPoint(point.x, point.y);
  while (element && !mountedGrids.has(element)) element = element.parentElement;
  return element ? mountedGrids.get(element) : undefined;
};
