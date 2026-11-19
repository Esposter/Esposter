import { resampleNearest } from "#src/services/genshinParity/radiance/resampleNearest";
import { describe, expect, test } from "vitest";

describe(resampleNearest, () => {
  test("gives each target pixel its nearest source pixel's value, without filtering between them", () => {
    expect.hasAssertions();

    // Two source pixels stretched over four: each source value holds across the two target pixels beside it
    const resampled = resampleNearest([0.25, 0.75], 2, 1, 4, 1);

    expect([...resampled]).toStrictEqual([0.25, 0.25, 0.75, 0.75]);
  });
});
