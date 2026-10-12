import { computeRampValues } from "#src/materials/computeRampValues";
import { describe, expect, test } from "vitest";

describe(computeRampValues, () => {
  test("is dark before the step, lit past it, and smooth across it", () => {
    expect.hasAssertions();

    expect(computeRampValues({ resolution: 4, shade: 0, softness: 0.5, terminator: 0.5 })).toStrictEqual(
      Uint8Array.from([0, 40, 215, 255]),
    );
  });

  test("keeps its shade on the dark side rather than going to none", () => {
    expect.hasAssertions();

    expect(computeRampValues({ resolution: 4, shade: 0.5, softness: 0.5, terminator: 0.5 })).toStrictEqual(
      Uint8Array.from([128, 147, 235, 255]),
    );
  });
});
