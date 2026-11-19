import { computeFamilyShape } from "#src/services/fishing/computeFamilyShape";
import { describe, expect, test } from "vitest";

describe(computeFamilyShape, () => {
  const STAND_IN = { bodyDepth: 0.1, bodyLength: 1, tailSpread: 0.2 };

  test("a family asset without fitted parameters is drawn as its stand-in", () => {
    expect.hasAssertions();

    expect(computeFamilyShape(undefined, STAND_IN)).toStrictEqual(STAND_IN);
  });
});
