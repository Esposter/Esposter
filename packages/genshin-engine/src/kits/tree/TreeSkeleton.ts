import type { BranchSegment } from "#src/kits/tree/BranchSegment";
import type { Vector3 } from "three";

export interface TreeSkeleton {
  branchSegments: BranchSegment[];
  clusterCenters: Vector3[];
}
