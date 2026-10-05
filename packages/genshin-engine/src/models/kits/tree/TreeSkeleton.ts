import type { BranchSegment } from "#src/models/kits/tree/BranchSegment";
import type { Vector3 } from "three";

export interface TreeSkeleton {
  branchSegments: BranchSegment[];
  clusterCenters: Vector3[];
}
