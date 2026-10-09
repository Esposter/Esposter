import type { ForgeResult } from "#src/models/forging/ForgeResult";

import { drawForgeResult } from "#src/services/forging/drawForgeResult";
import { describe, expect, test } from "vitest";

describe(drawForgeResult, () => {
  const ORE_ID = 104_013;
  const EXP_ID = 102;
  const results: ForgeResult[] = [
    { count: 6, itemId: ORE_ID, weight: 1 },
    { count: 100, itemId: EXP_ID, weight: 3 },
  ];

  test("should draw each result in proportion to its weight", () => {
    expect.hasAssertions();

    expect(drawForgeResult(results, 0.2).itemId).toBe(ORE_ID);
    expect(drawForgeResult(results, 0.3).itemId).toBe(EXP_ID);
  });

  test("should yield the only result whatever the roll", () => {
    expect.hasAssertions();

    expect(drawForgeResult(results.slice(0, 1), 0.99).itemId).toBe(ORE_ID);
  });
});
