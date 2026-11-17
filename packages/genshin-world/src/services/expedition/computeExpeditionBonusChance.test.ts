import type { ExpeditionBonus } from "#src/models/expedition/ExpeditionBonus";

import { computeExpeditionBonusChance } from "#src/services/expedition/computeExpeditionBonusChance";
import { describe, expect, test } from "vitest";

describe(computeExpeditionBonusChance, () => {
  // A made-up table: a chance from each of three levels, as the table names them
  const BONUSES: ExpeditionBonus[] = [
    { avatarLevel: 1, probability: 0.2 },
    { avatarLevel: 21, probability: 0.4 },
    { avatarLevel: 81, probability: 0.9 },
  ];

  test("a level 1 character has a 20 percent bonus chance", () => {
    expect.hasAssertions();

    expect(computeExpeditionBonusChance(1, BONUSES)).toBe(0.2);
  });

  test("a level 21 character has a 40 percent bonus chance", () => {
    expect.hasAssertions();

    expect(computeExpeditionBonusChance(21, BONUSES)).toBe(0.4);
  });

  test("a level 81 character has a 90 percent bonus chance", () => {
    expect.hasAssertions();

    expect(computeExpeditionBonusChance(81, BONUSES)).toBe(0.9);
  });
});
