import type { StatueLevel } from "#src/models/statue/StatueLevel";

import { computeMaximumStamina } from "#src/services/statue/computeMaximumStamina";
import { MAXIMUM_STAMINA_CAP } from "#src/services/statue/constants";
import { STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(computeMaximumStamina, () => {
  const levels: StatueLevel[] = [
    { itemCount: 0, itemId: 0, level: 1, rewards: [], staminaShare: 0 },
    { itemCount: 1, itemId: 107_001, level: 2, rewards: [], staminaShare: 7 },
    { itemCount: 2, itemId: 107_001, level: 3, rewards: [], staminaShare: 8 },
  ];

  test("the controller's start, raised by the levels each region has reached", () => {
    expect.hasAssertions();

    expect(computeMaximumStamina([{ heldCount: 0, level: 3, levels }])).toBe(STAMINA_MAX + 15);
  });

  test("a level not yet reached adds nothing", () => {
    expect.hasAssertions();

    expect(computeMaximumStamina([{ heldCount: 0, level: 1, levels }])).toBe(STAMINA_MAX);
  });

  test("the maximum never passes the cap, whatever the regions reach", () => {
    expect.hasAssertions();

    const cappingLevel: StatueLevel = {
      itemCount: 2,
      itemId: 107_001,
      level: 3,
      rewards: [],
      staminaShare: MAXIMUM_STAMINA_CAP,
    };
    const regions = [{ heldCount: 0, level: 3, levels: [cappingLevel] }];

    expect(computeMaximumStamina(regions)).toBe(MAXIMUM_STAMINA_CAP);
  });
});
