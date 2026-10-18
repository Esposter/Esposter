import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { toStatueRegionProgress, toStatueRegionProgressSave } from "#src/services/statue/statueRegionProgress";
import { describe, expect, test } from "vitest";

describe(toStatueRegionProgress, () => {
  const OCULUS_ITEM_ID = 1001;
  const levels: StatueLevel[] = [
    { items: [], level: 1, rewards: [], staminaShare: 0 },
    { items: [{ itemCount: 1, itemId: OCULUS_ITEM_ID }], level: 2, rewards: [], staminaShare: 0 },
  ];

  test("a region's saved Oculi are held against the one Oculus its levels take, and saved back as the count held", () => {
    expect.hasAssertions();
    const saved = { heldCount: 3, level: 1 };
    const progress = toStatueRegionProgress(saved, levels);

    expect(progress).toStrictEqual({ heldCounts: { [OCULUS_ITEM_ID]: 3 }, level: 1, levels });
    expect(toStatueRegionProgressSave(progress)).toStrictEqual(saved);
  });

  test("a region with no Oculi held starts with none held, so the save's count is never a zero entry", () => {
    expect.hasAssertions();

    expect(toStatueRegionProgress({ heldCount: 0, level: 0 }, levels)).toStrictEqual({
      heldCounts: {},
      level: 0,
      levels,
    });
  });
});
