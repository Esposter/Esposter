import { computeTreeSkeleton } from "#src/kits/tree/computeTreeSkeleton";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeTreeSkeleton, () => {
  const treeOptions = { branchLength: 1, mainBranchCount: 1, seed: 0, trunkHeight: 1, trunkRadius: 1 };

  test("grows the same tree from the same options", () => {
    expect.hasAssertions();

    expect(computeTreeSkeleton(treeOptions)).toStrictEqual(computeTreeSkeleton(treeOptions));
  });

  test("roots the trunk at the origin, forks each main branch in two, and tops every fork with a cluster", () => {
    expect.hasAssertions();

    const { branchSegments, clusterCenters } = computeTreeSkeleton(treeOptions);

    expect(branchSegments[0]?.start).toStrictEqual(new Vector3());
    expect(branchSegments).toHaveLength(4);
    expect(clusterCenters).toStrictEqual([
      branchSegments[0]?.end.clone().setY((branchSegments[0]?.end.y ?? 0) + treeOptions.branchLength * 0.6),
      branchSegments[2]?.end,
      branchSegments[3]?.end,
    ]);
  });
});
