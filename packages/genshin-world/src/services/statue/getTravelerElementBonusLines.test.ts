import { Attribute } from "#src/models/character/Attribute";
import { getTravelerElementBonusLines } from "#src/services/statue/getTravelerElementBonusLines";
import { describe, expect, test } from "vitest";

describe(getTravelerElementBonusLines, () => {
  test("each element resonated with adds a bonus", () => {
    expect.hasAssertions();
    expect(getTravelerElementBonusLines(["liyue", "sumeru"], true)).toStrictEqual([
      { attribute: Attribute.CriticalRate, value: 0.1 },
      { attribute: Attribute.AttackPercent, value: 0.2 },
      { attribute: Attribute.DefensePercent, value: 0.2 },
      { attribute: Attribute.ElementalMastery, value: 60 },
    ]);
  });

  test("no element bonus is given before welkin moon's homecoming is done", () => {
    expect.hasAssertions();
    expect(getTravelerElementBonusLines(["liyue"], false)).toStrictEqual([]);
  });
});
