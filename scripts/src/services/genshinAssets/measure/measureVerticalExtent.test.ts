import { measureVerticalExtent } from "#src/services/genshinAssets/measure/measureVerticalExtent";
import { describe, expect, test } from "vitest";

describe(measureVerticalExtent, () => {
  test("spans the highest point to the lowest across every array given", () => {
    expect.hasAssertions();

    const first = new Float32Array([0, 0.25, 0, 1, 1.75, -1]);
    const second = new Float32Array([0.5, -0.5, 0.5]);

    expect(measureVerticalExtent([first, second])).toBe(1.75 - -0.5);
  });
});
