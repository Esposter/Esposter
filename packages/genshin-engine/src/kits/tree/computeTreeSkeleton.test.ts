import type { TreeOptions } from "#src/models/kits/tree/TreeOptions";

import { computeTreeSkeleton } from "#src/kits/tree/computeTreeSkeleton";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeTreeSkeleton, () => {
  const treeOptions: Pick<TreeOptions, "branchLength" | "mainBranchCount" | "seed" | "trunk"> = {
    branchLength: 1,
    mainBranchCount: 1,
    seed: 0,
    trunk: [
      { height: 0, radius: 2 },
      { height: 1, radius: 1 },
    ],
  };

  test("grows the same tree from the same options", () => {
    expect.hasAssertions();

    expect(computeTreeSkeleton(treeOptions)).toStrictEqual(computeTreeSkeleton(treeOptions));
  });

  test("steps the trunk up its profile from the origin, then forks each main branch in two", () => {
    expect.hasAssertions();

    const branchSegments = computeTreeSkeleton(treeOptions);

    expect(branchSegments[0]).toStrictEqual({
      end: new Vector3(0, 1, 0),
      endRadius: 1,
      start: new Vector3(),
      startRadius: 2,
    });
    expect(branchSegments).toHaveLength(4);
  });
});
