import type { MountedGrid } from "#src/models/MountedGrid";

// The grids on the page keyed by their roots, so the element under a pointer finds the grid it is over
export const mountedGrids: Map<Element, MountedGrid> = new Map<Element, MountedGrid>();
