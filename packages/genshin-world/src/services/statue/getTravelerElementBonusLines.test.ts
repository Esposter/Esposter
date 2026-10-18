import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { getTravelerElementBonusLines } from "#src/services/statue/getTravelerElementBonusLines";
import { describe, expect, test } from "vitest";

describe(getTravelerElementBonusLines, () => {
  test("each element resonated with adds a bonus", () => {
    expect.hasAssertions();
    expect(getTravelerElementBonusLines([Element.Geo, Element.Dendro])).toStrictEqual([
      { attribute: Attribute.DefensePercent, value: 0.2 },
      { attribute: Attribute.ElementalMastery, value: 60 },
    ]);
  });
});
