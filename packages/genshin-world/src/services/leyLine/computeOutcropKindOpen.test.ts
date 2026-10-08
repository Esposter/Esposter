import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { computeOutcropKindOpen } from "#src/services/leyLine/computeOutcropKindOpen";
import { describe, expect, test } from "vitest";

describe(computeOutcropKindOpen, () => {
  const CITY_ID = 3;
  const PLAYER_LEVEL = 18;

  test("a kind opens at its Adventure Rank and no lower", () => {
    expect.hasAssertions();

    const rule = { kind: OutcropKind.Wealth, playerLevel: PLAYER_LEVEL, unlockCityIds: [] };

    expect(computeOutcropKindOpen(rule, PLAYER_LEVEL - 1, [])).toBe(false);
    expect(computeOutcropKindOpen(rule, PLAYER_LEVEL, [])).toBe(true);
  });

  test("a kind that needs a nation's area unlocked stays shut until that nation's area is unlocked", () => {
    expect.hasAssertions();

    const rule = { kind: OutcropKind.Revelation, playerLevel: PLAYER_LEVEL, unlockCityIds: [CITY_ID] };

    expect(computeOutcropKindOpen(rule, PLAYER_LEVEL, [])).toBe(false);
    expect(computeOutcropKindOpen(rule, PLAYER_LEVEL, [CITY_ID])).toBe(true);
  });
});
