import { dropUnplacedSpawns } from "#src/services/genshinAssets/scene/dropUnplacedSpawns";
import { createSceneObject } from "#src/services/genshinAssets/shared/createSceneObject.test";
import { describe, expect, test } from "vitest";

describe(dropUnplacedSpawns, () => {
  const UNPLACED_ROOT = createSceneObject("1", "0", { childIds: ["2"] });
  const UNPLACED_CHILD = createSceneObject("2", "1");
  const PLACED_ROOT = createSceneObject("3", "0", { childIds: ["4"], position: [1, 0, 0] });
  const PLACED_CHILD = createSceneObject("4", "3");

  test("drops a root whose subtree stands at the origin, and keeps a root placed off it with its subtree", () => {
    expect.hasAssertions();

    const objects = [UNPLACED_ROOT, UNPLACED_CHILD, PLACED_ROOT, PLACED_CHILD];

    expect(dropUnplacedSpawns(objects, new Map())).toStrictEqual([PLACED_ROOT, PLACED_CHILD]);
  });
});
