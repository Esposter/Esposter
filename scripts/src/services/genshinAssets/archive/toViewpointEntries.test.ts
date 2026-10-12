import type { ViewpointCandidate } from "#src/models/genshinAssets/archive/ViewpointCandidate";

import { toViewpointEntries } from "#src/services/genshinAssets/archive/toViewpointEntries";
import { describe, expect, test } from "vitest";

describe(toViewpointEntries, () => {
  const englishTextMap = new Map([
    ["1", "Cliff"],
    ["3", "Bridge"],
  ]);

  test("keeps the viewpoints whose English name is held, in the codex's order, with their group and config id", () => {
    expect.hasAssertions();

    const candidates: ViewpointCandidate[] = [
      { configId: 2, groupId: 200, id: 20, nameTextMapHash: 3, sortOrder: 2 },
      { configId: 1, groupId: 100, id: 10, nameTextMapHash: 2, sortOrder: 1 },
      { configId: 3, groupId: 300, id: 30, nameTextMapHash: 1, sortOrder: 1 },
    ];

    expect(toViewpointEntries(candidates, englishTextMap)).toStrictEqual([
      { configId: 3, groupId: 300, id: 30, nameTextId: "1" },
      { configId: 2, groupId: 200, id: 20, nameTextId: "3" },
    ]);
  });
});
