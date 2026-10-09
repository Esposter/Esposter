import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";

import { toArchiveEntries } from "#src/services/genshinAssets/archive/toArchiveEntries";
import { describe, expect, test } from "vitest";

describe(toArchiveEntries, () => {
  const englishTextMap = new Map([
    ["1", "Sword"],
    ["3", "Bow"],
  ]);

  test("keeps the candidates whose English name is held, in the codex's order", () => {
    expect.hasAssertions();

    const candidates: ArchiveCandidate[] = [
      { id: 20, nameTextMapHash: 3, sortOrder: 2 },
      { id: 10, nameTextMapHash: 2, sortOrder: 1 },
      { id: 30, nameTextMapHash: 1, sortOrder: 1 },
    ];

    expect(toArchiveEntries(candidates, englishTextMap)).toStrictEqual([
      { id: 30, nameTextId: "1" },
      { id: 20, nameTextId: "3" },
    ]);
  });
});
