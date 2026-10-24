import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { TEST_SINGLE_ROW, TEST_WRAPPED_ROW } from "@/services/pageBuilder/constants.test";
import { getDropIndex } from "@/services/pageBuilder/getDropIndex";
import { describe, expect, test } from "vitest";

describe(getDropIndex, () => {
  const STACK: OverlayBox[] = [
    { height: 40, left: 0, top: 0, width: 600 },
    { height: 40, left: 0, top: 60, width: 600 },
  ];

  test("a drop on the second line of a wrapped row lands on that line", () => {
    expect.hasAssertions();

    expect(getDropIndex(TEST_WRAPPED_ROW, { x: 50, y: 80 }, true)).toBe(3);
  });

  test("a drop right of a wrapped row's first line lands after its last child there", () => {
    expect.hasAssertions();

    expect(getDropIndex(TEST_WRAPPED_ROW, { x: 500, y: 20 }, true)).toBe(3);
  });

  test("a drop in a single row lands before the child whose midpoint lies past the pointer", () => {
    expect.hasAssertions();

    expect(getDropIndex(TEST_SINGLE_ROW, { x: 150, y: 20 }, true)).toBe(1);
  });

  test("a drop beside a taller child on the line lands before the shorter child the pointer has passed", () => {
    expect.hasAssertions();

    // The first child's bottom lies above the pointer, so the pointer's line starts at the taller second child
    const UNEQUAL_HEIGHTS: OverlayBox[] = [
      { height: 40, left: 0, top: 0, width: 200 },
      { height: 100, left: 200, top: 0, width: 200 },
      { height: 40, left: 0, top: 110, width: 200 },
    ];

    expect(getDropIndex(UNEQUAL_HEIGHTS, { x: 50, y: 50 }, true)).toBe(0);
  });

  test("a drop in a stack lands by height", () => {
    expect.hasAssertions();

    expect(getDropIndex(STACK, { x: 0, y: 70 }, false)).toBe(1);
  });
});
