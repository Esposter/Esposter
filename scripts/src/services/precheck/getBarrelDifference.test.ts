import { getBarrelDifference } from "#src/services/precheck/getBarrelDifference";
import { describe, expect, test } from "vitest";

describe(getBarrelDifference, () => {
  test("names the lines the expected barrel has that the committed one lacks, and the reverse", () => {
    expect.hasAssertions();

    expect(
      getBarrelDifference(
        [`export * from "./a.ts";`, `export * from "./b.ts";`],
        [`export * from "./b.ts";`, `export * from "./c.ts";`],
      ),
    ).toStrictEqual({ extra: [`export * from "./c.ts";`], missing: [`export * from "./a.ts";`] });
  });

  test("is empty when the barrels agree", () => {
    expect.hasAssertions();

    expect(getBarrelDifference([`export * from "./a.ts";`], [`export * from "./a.ts";`])).toStrictEqual({
      extra: [],
      missing: [],
    });
  });
});
