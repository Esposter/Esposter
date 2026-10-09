import type { BranchSegment } from "#src/models/kits/tree/BranchSegment";
import type { TreeOptions } from "#src/models/kits/tree/TreeOptions";

import { createSeededRandom } from "#src/random/createSeededRandom";
import { Vector3 } from "three";

const FORKS_PER_BRANCH = 2;
// A tree's wood as tapered segments: its trunk stepped up the profile it is given, and main branches spread evenly
// Round the top of the trunk with a seeded jitter, each forking twice outward and up. The same options give the same tree
export const computeTreeSkeleton = ({
  branchLength,
  mainBranchCount,
  seed,
  trunk,
}: Pick<TreeOptions, "branchLength" | "mainBranchCount" | "seed" | "trunk">): BranchSegment[] => {
  const random = createSeededRandom(seed);
  const branchSegments: BranchSegment[] = [];
  const trunkTop = trunk.reduce((bottom, top) => {
    branchSegments.push({
      end: new Vector3(0, top.height, 0),
      endRadius: top.radius,
      start: new Vector3(0, bottom.height, 0),
      startRadius: bottom.radius,
    });
    return top;
  });
  for (let branchIndex = 0; branchIndex < mainBranchCount; branchIndex++) {
    const angle = (branchIndex / mainBranchCount) * Math.PI * 2 + (random() - 0.5);
    const start = new Vector3(0, trunkTop.height * (0.75 + random() * 0.25), 0);
    const direction = new Vector3(Math.cos(angle), 0.45 + random() * 0.4, Math.sin(angle)).normalize();
    const end = start.clone().addScaledVector(direction, branchLength * (0.75 + random() * 0.25));
    branchSegments.push({ end, endRadius: trunkTop.radius * 0.18, start, startRadius: trunkTop.radius * 0.45 });
    for (let forkIndex = 0; forkIndex < FORKS_PER_BRANCH; forkIndex++) {
      const forkAngle = angle + (forkIndex - 0.5) * 0.9 + (random() - 0.5) * 0.3;
      const forkDirection = new Vector3(Math.cos(forkAngle), 0.6 + random() * 0.4, Math.sin(forkAngle)).normalize();
      const forkEnd = end.clone().addScaledVector(forkDirection, branchLength * (0.45 + random() * 0.2));
      branchSegments.push({
        end: forkEnd,
        endRadius: trunkTop.radius * 0.05,
        start: end,
        startRadius: trunkTop.radius * 0.18,
      });
    }
  }
  return branchSegments;
};
