import { findProfileMinima } from "#src/services/genshinAssets/findProfileMinima";
import { describe, expect, test } from "vitest";

describe(findProfileMinima, () => {
  const options = { prominence: 5, radius: 2, sideRange: [3, 5] } as const;

  test("finds a narrow dark line and leaves a wide shallow stain", () => {
    expect.hasAssertions();

    const profile = Array.from({ length: 40 }, (_, index) =>
      index === 10 ? 80 : index >= 25 && index <= 35 ? 96 : 100,
    );

    expect(findProfileMinima(profile, options)).toStrictEqual([10]);
  });

  test("finds a line at the profile's end, wrapping round as a tiled texture does", () => {
    expect.hasAssertions();

    const profile = Array.from({ length: 20 }, (_, index) => (index === 0 ? 80 : 100));

    expect(findProfileMinima(profile, options)).toStrictEqual([0]);
  });
});
