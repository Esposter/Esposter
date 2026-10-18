import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";

import { computeOfferedViewpoints } from "#src/services/archive/computeOfferedViewpoints";
import { describe, expect, test } from "vitest";

// Made-up viewpoints with made-up ids, so the test reads no game data
const PLACED_VIEWPOINT: ArchiveViewpoint = { configId: 90_011, groupId: 90_010, id: 90_021, nameTextId: "90031" };
const UNPLACED_VIEWPOINT: ArchiveViewpoint = { configId: 90_012, groupId: 90_010, id: 90_022, nameTextId: "90032" };

describe(computeOfferedViewpoints, () => {
  test("a viewpoint with no known place is not offered", () => {
    expect.hasAssertions();

    expect(
      computeOfferedViewpoints([PLACED_VIEWPOINT, UNPLACED_VIEWPOINT], new Set([PLACED_VIEWPOINT.id])),
    ).toStrictEqual([PLACED_VIEWPOINT]);
  });
});
