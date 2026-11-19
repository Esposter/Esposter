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

  test.each([
    [1, 0.2],
    [21, 0.4],
    [81, 0.9],
  ])("a level %i character has a %f bonus chance", (avatarLevel, probability) => {
    expect.hasAssertions();

    expect(computeExpeditionBonusChance(avatarLevel, BONUSES)).toBe(probability);
  });
});
