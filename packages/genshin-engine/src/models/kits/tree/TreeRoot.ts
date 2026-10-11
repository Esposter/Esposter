import type { TreeRootPoint } from "#src/models/kits/tree/TreeRootPoint";

// A surface root as the points its spline runs through, from where it leaves the trunk or the root it forks from to its
// Tip. Two at least, one span
export type TreeRoot = readonly [TreeRootPoint, TreeRootPoint, ...TreeRootPoint[]];
