import { checkIsMiningOutcropOpen } from "#src/services/leyLine/checkIsMiningOutcropOpen";
import { MINING_OUTCROP_ADVENTURE_RANK } from "#src/services/leyLine/constants";
import { describe, expect, test } from "vitest";

describe(checkIsMiningOutcropOpen, () => {
  test("mining outcrops are drawn from the Adventure Rank that opens them", () => {
    expect.hasAssertions();
    expect(checkIsMiningOutcropOpen(MINING_OUTCROP_ADVENTURE_RANK - 1)).toBe(false);
    expect(checkIsMiningOutcropOpen(MINING_OUTCROP_ADVENTURE_RANK)).toBe(true);
  });
});
