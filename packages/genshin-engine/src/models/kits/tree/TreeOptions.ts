import type { TreeCluster } from "#src/models/kits/tree/TreeCluster";
import type { TreeNormalField } from "#src/models/kits/tree/TreeNormalField";
import type { TreeTrunkPoint } from "#src/models/kits/tree/TreeTrunkPoint";

export interface TreeOptions {
  // How long a main branch is, in metres, before it forks
  branchLength: number;
  // Half a leaf card's side, in metres
  cardSize: number;
  // The leaf clusters, each a centre, how far its cards reach from it and the leaf it holds, in metres from the trunk's foot
  clusters: readonly TreeCluster[];
  // How many times its clusters' leaf area the cards keep between them, each card the share of its square its leaf
  // Shape keeps
  leafAreaScale: number;
  // Main branches spreading from the top of the trunk; each forks in two
  mainBranchCount: number;
  // The leaves' normals as a field over the crown, where each card vertex takes its normal from; without one, from its cluster's centre
  normalField?: TreeNormalField;
  seed: number;
  // The trunk's radius at each height, from its foot up, so its last point is its top. Two at least, one segment
  trunk: readonly [TreeTrunkPoint, TreeTrunkPoint, ...TreeTrunkPoint[]];
}
