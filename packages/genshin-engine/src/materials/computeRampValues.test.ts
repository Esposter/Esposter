import { computeRampValues } from "#src/materials/computeRampValues";
import { describe, expect, test } from "vitest";

describe(computeRampValues, () => {
  test("is dark before the step, lit past it, and smooth across it", () => {
    expect.hasAssertions();

    expect(computeRampValues({ resolution: 4, softness: 0.5, terminator: 0.5 })).toStrictEqual(
      Uint8Array.from([0, 40, 215, 255]),
    );
  });
});
