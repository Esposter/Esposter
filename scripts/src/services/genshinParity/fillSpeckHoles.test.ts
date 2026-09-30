import { fillSpeckHoles } from "#src/services/genshinParity/fillSpeckHoles";
import { describe, expect, test } from "vitest";

describe(fillSpeckHoles, () => {
  test("fills an enclosed hole under a speck's area, and leaves a larger hole and the open paper", () => {
    expect.hasAssertions();

    // Two rings of ink on paper, one round a hole of one pixel and one round a hole of two
    const isInk = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ]);
    fillSpeckHoles(isInk, 9, 5, 2);

    expect(isInk[20]).toBe(1);
    expect([isInk[24], isInk[25], isInk[0]]).toStrictEqual([0, 0, 0]);
  });
});
