import { readCookingZones } from "#src/services/cooking/readCookingZones";
import { describe, expect, test } from "vitest";

describe(readCookingZones, () => {
  test("two recipes with different zone parameters lay out different zones", () => {
    expect.hasAssertions();

    const first = readCookingZones([0.5, 0.5]);
    const second = readCookingZones([0.25, 0.5]);

    expect(first.regular).toStrictEqual([0.25, 0.75]);
    expect(second.regular).toStrictEqual([0, 0.5]);
    expect(first).not.toStrictEqual(second);
  });
});
