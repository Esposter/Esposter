import type { TreeCluster } from "#src/models/kits/tree/TreeCluster";
import type { TreeNormalField } from "#src/models/kits/tree/TreeNormalField";
import type { TreeTube } from "#src/models/kits/tree/TreeTube";

export interface TreeOptions {
  // Half a leaf card's side, in metres
  cardSize: number;
  // The leaf clusters, each a centre, how far its cards reach from it and the leaf it holds, in metres from the trunk's foot
  clusters: readonly TreeCluster[];
  // How many times its clusters' leaf area the cards keep between them, each card the share of its square its leaf
  // Shape keeps
  leafAreaScale: number;
  // The trunk from its foot and the limbs it parts into, each swept as a tube along its spline, a limb starting inside
  // The trunk or the limb it grows from
  limbs: readonly TreeTube[];
  // The leaves' normals as a field over the crown, where each card vertex takes its normal from; without one, from its cluster's centre
  normalField?: TreeNormalField;
  // The surface roots spreading over the ground from the trunk's foot, each swept as a tube along its spline
  roots: readonly TreeTube[];
  seed: number;
}
