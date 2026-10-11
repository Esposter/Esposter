import { flattenKitValues } from "#src/services/genshinAssets/kits/record/flattenKitValues";
import { unflattenKitValues } from "#src/services/genshinAssets/kits/record/unflattenKitValues";
import { describe, expect, test } from "vitest";

describe(unflattenKitValues, () => {
  test("builds back the record its values were flattened from, an area and a parameter whole", () => {
    expect.hasAssertions();

    const record = {
      normalAttacks: [
        {
          hits: [
            { area: { angle: 90, height: 2, radius: 3 }, multiplier: { index: 0, proudSkillGroupId: 3231 } },
            { area: { angle: 90, height: 2, radius: 3 }, multiplier: { index: 1, proudSkillGroupId: 3231 } },
          ],
          seconds: 0.33,
        },
      ],
      skillHolds: [],
    };

    expect(unflattenKitValues(flattenKitValues(record))).toStrictEqual(record);
  });

  test("leaves out a value past its array's length or in an array no length is given for", () => {
    expect.hasAssertions();

    expect(
      unflattenKitValues(
        new Map<string, unknown>([
          ["normalAttacks.0.seconds", 0.33],
          ["normalAttacks.1.seconds", 0.28],
          ["normalAttacks.length", 1],
          ["skillHolds.0.minimumHeldSeconds", 1],
        ]),
      ),
    ).toStrictEqual({ normalAttacks: [{ seconds: 0.33 }] });
  });
});
