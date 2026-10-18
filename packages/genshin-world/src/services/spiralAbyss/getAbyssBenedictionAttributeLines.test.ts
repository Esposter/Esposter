import { Attribute } from "#src/models/character/Attribute";
import { getAbyssBenedictionAttributeLines } from "#src/services/spiralAbyss/getAbyssBenedictionAttributeLines";
import { describe, expect, test } from "vitest";

describe(getAbyssBenedictionAttributeLines, () => {
  test("a Benediction that gives one party-wide stat gives its attribute line", () => {
    expect.hasAssertions();

    expect(getAbyssBenedictionAttributeLines(1)).toStrictEqual([{ attribute: Attribute.AttackPercent, value: 0.2 }]);
  });

  test("a Benediction that gives two stats gives both lines", () => {
    expect.hasAssertions();

    expect(getAbyssBenedictionAttributeLines(2)).toStrictEqual([
      { attribute: Attribute.CriticalRate, value: 0.08 },
      { attribute: Attribute.CriticalDamage, value: 0.15 },
    ]);
  });

  test("a Benediction that resists one element gives that element's resistance", () => {
    expect.hasAssertions();

    expect(getAbyssBenedictionAttributeLines(8)).toStrictEqual([{ attribute: Attribute.PyroResistance, value: 0.35 }]);
  });
});
