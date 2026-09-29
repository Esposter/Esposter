import type { BranchSegment } from "#src/kits/tree/BranchSegment";
import type { TreeOptions } from "#src/kits/tree/TreeOptions";
import type { TreeSkeleton } from "#src/kits/tree/TreeSkeleton";

import { createSeededRandom } from "#src/random/createSeededRandom";
import { Vector3 } from "three";

const TRUNK_LEAN = 0.08;
const FORKS_PER_BRANCH = 2;
// A tree's wood as tapered segments and the centres its leaf clusters sit on: a leaning trunk, main branches spread
// Evenly around it with a seeded jitter, and each forking twice outward and up. The same options give the same tree
export const computeTreeSkeleton = ({
  branchLength,
  mainBranchCount,
  seed,
  trunkHeight,
  trunkRadius,
}: Pick<TreeOptions, "branchLength" | "mainBranchCount" | "seed" | "trunkHeight" | "trunkRadius">): TreeSkeleton => {
  const random = createSeededRandom(seed);
  const trunkTop = new Vector3(
    (random() - 0.5) * TRUNK_LEAN * trunkHeight,
    trunkHeight,
    (random() - 0.5) * TRUNK_LEAN * trunkHeight,
  );
  const branchSegments: BranchSegment[] = [
    { end: trunkTop, endRadius: trunkRadius * 0.6, start: new Vector3(), startRadius: trunkRadius },
  ];
  const clusterCenters: Vector3[] = [trunkTop.clone().setY(trunkTop.y + branchLength * 0.6)];
  for (let branchIndex = 0; branchIndex < mainBranchCount; branchIndex++) {
    const angle = (branchIndex / mainBranchCount) * Math.PI * 2 + (random() - 0.5);
    const start = new Vector3().lerpVectors(new Vector3(), trunkTop, 0.75 + random() * 0.25);
    const direction = new Vector3(Math.cos(angle), 0.45 + random() * 0.4, Math.sin(angle)).normalize();
    const end = start.clone().addScaledVector(direction, branchLength * (0.75 + random() * 0.25));
    branchSegments.push({ end, endRadius: trunkRadius * 0.18, start, startRadius: trunkRadius * 0.45 });
    for (let forkIndex = 0; forkIndex < FORKS_PER_BRANCH; forkIndex++) {
      const forkAngle = angle + (forkIndex - 0.5) * 0.9 + (random() - 0.5) * 0.3;
      const forkDirection = new Vector3(Math.cos(forkAngle), 0.6 + random() * 0.4, Math.sin(forkAngle)).normalize();
      const forkEnd = end.clone().addScaledVector(forkDirection, branchLength * (0.45 + random() * 0.2));
      branchSegments.push({ end: forkEnd, endRadius: trunkRadius * 0.05, start: end, startRadius: trunkRadius * 0.18 });
      clusterCenters.push(forkEnd);
    }
  }
  return { branchSegments, clusterCenters };
};
