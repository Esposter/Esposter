import { getMaterialExperience } from "#src/services/artifact/getMaterialExperience";
import { describe, expect, test } from "vitest";

describe(getMaterialExperience, () => {
  test("sums each enhancement material's EXP, Sanctifying Unction at 2,500 and Sanctifying Essence at 10,000, times its count", () => {
    expect.hasAssertions();

    expect(
      getMaterialExperience([
        { count: 2, id: 105_002 },
        { count: 1, id: 105_003 },
      ]),
    ).toBe(15_000);
  });
});
