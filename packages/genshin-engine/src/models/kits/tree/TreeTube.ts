import type { TreeTubePoint } from "#src/models/kits/tree/TreeTubePoint";

// A tube of a tree's wood as the points its spline runs through: the trunk from its foot, or a limb or a surface root
// From where it leaves the trunk or the limb or root it grows from, to its tip. Two at least, one span
export type TreeTube = readonly [TreeTubePoint, TreeTubePoint, ...TreeTubePoint[]];
