import { removeMaskSpecks } from "#src/services/recreation/image/removeMaskSpecks";
import { describe, expect, test } from "vitest";

describe(removeMaskSpecks, () => {
  test("fills a hole and clears an island under a speck's area, and keeps larger runs and the open paper", () => {
    expect.hasAssertions();

    // A ring round a hole of one pixel, a ring round a hole of two, and an island of one pixel
    const inkMask = Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0,
      1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    removeMaskSpecks(inkMask, 11, 5, 2);

    expect(inkMask).toStrictEqual(
      Uint8Array.from([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1,
        0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]),
    );
  });

  test("clears a ring under a speck's area without filling its hole", () => {
    expect.hasAssertions();

    const inkMask = Uint8Array.from([0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]);
    removeMaskSpecks(inkMask, 5, 5, 9);

    expect(inkMask.every((value) => value === 0)).toBe(true);
  });
});
