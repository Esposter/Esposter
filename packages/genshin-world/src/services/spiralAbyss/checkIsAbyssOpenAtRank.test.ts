import { checkIsAbyssOpenAtRank } from "#src/services/spiralAbyss/checkIsAbyssOpenAtRank";
import { ABYSS_OPEN_ADVENTURE_RANK } from "#src/services/spiralAbyss/constants";
import { describe, expect, test } from "vitest";

describe(checkIsAbyssOpenAtRank, () => {
  test("should open the Abyss at its rank and not one below", () => {
    expect.hasAssertions();

    expect(checkIsAbyssOpenAtRank(ABYSS_OPEN_ADVENTURE_RANK - 1)).toBe(false);
    expect(checkIsAbyssOpenAtRank(ABYSS_OPEN_ADVENTURE_RANK)).toBe(true);
  });
});
