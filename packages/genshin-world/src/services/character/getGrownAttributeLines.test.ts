import { Attribute } from "#src/models/character/Attribute";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";
import { describe, expect, test } from "vitest";

describe(getGrownAttributeLines, () => {
  const CURVE = "curve";
  const grownData = {
    ascensionPhases: [
      { attributeLines: [], maxLevel: 20 },
      { attributeLines: [{ attribute: Attribute.BaseAttack, value: 1 }], maxLevel: 40 },
    ],
    growAttributes: [{ attribute: Attribute.BaseAttack, base: 2, curve: CURVE }],
  };
  // A multiplier of the level itself at every level
  const growCurveMap = new Map([[CURVE, Array.from({ length: 40 }, (_value, index) => index + 1)]]);

  test("multiplies each base by its curve at the level and adds the phase's attributes", () => {
    expect.hasAssertions();

    expect(getGrownAttributeLines(grownData, growCurveMap, 20, 1)).toStrictEqual([
      { attribute: Attribute.BaseAttack, value: 40 },
      { attribute: Attribute.BaseAttack, value: 1 },
    ]);
  });

  test("refuses a level past its phase's cap", () => {
    expect.hasAssertions();

    expect(() => getGrownAttributeLines(grownData, growCurveMap, 21, 0)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getGrownAttributeLines, level 21 is not in ascension phase 0]`,
    );
  });
});
