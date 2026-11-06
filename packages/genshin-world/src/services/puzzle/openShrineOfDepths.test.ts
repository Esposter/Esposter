import type { ShrineOfDepths } from "#src/models/puzzle/ShrineOfDepths";

import { openShrineOfDepths } from "#src/services/puzzle/openShrineOfDepths";
import { describe, expect, test } from "vitest";

describe(openShrineOfDepths, () => {
  const SHRINE_REGION = "north";
  const OTHER_REGION = "south";

  const createShrine = (): ShrineOfDepths => ({ isOpen: false, region: SHRINE_REGION });

  test("a shrine opens with its region's key", () => {
    expect.hasAssertions();

    const shrine = createShrine();
    openShrineOfDepths(shrine, SHRINE_REGION);

    expect(shrine.isOpen).toBe(true);
  });

  test("a key from another region is refused", () => {
    expect.hasAssertions();

    const shrine = createShrine();
    openShrineOfDepths(shrine, OTHER_REGION);

    expect(shrine.isOpen).toBe(false);
  });
});
