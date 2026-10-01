import { removeMaskSpecks } from "#src/services/genshinParity/removeMaskSpecks";
import { describe, expect, test } from "vitest";

describe(removeMaskSpecks, () => {
  test("fills a hole and clears an island under a speck's area, and keeps larger runs and the open paper", () => {
    expect.hasAssertions();

    // A ring round a hole of one pixel, a ring round a hole of two, and an island of one pixel
    const isInk = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0,
      1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    removeMaskSpecks(isInk, 11, 5, 2);

    expect([isInk[24], isInk[32]]).toStrictEqual([1, 0]);
    expect([isInk[28], isInk[29], isInk[0], isInk[12]]).toStrictEqual([0, 0, 0, 1]);
  });

  test("clears a ring under a speck's area without filling its hole", () => {
    expect.hasAssertions();

    const isInk = Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
    removeMaskSpecks(isInk, 5, 5, 9);

    expect(isInk.every((value) => value === 0)).toBe(true);
  });
});
