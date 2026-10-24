import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { getDropIndex } from "@/services/pageBuilder/getDropIndex";
import { describe, expect, test } from "vitest";

// Three columns in a row of 200 pixels each, the last two wrapped onto a line below the first
const WRAPPED_ROW: OverlayBox[] = [
  { height: 40, left: 0, top: 0, width: 200 },
  { height: 40, left: 200, top: 0, width: 200 },
  { height: 40, left: 400, top: 0, width: 200 },
  { height: 40, left: 0, top: 60, width: 200 },
  { height: 40, left: 200, top: 60, width: 200 },
];
const SINGLE_ROW: OverlayBox[] = [
  { height: 40, left: 0, top: 0, width: 200 },
  { height: 40, left: 200, top: 0, width: 200 },
  { height: 40, left: 400, top: 0, width: 200 },
];
const STACK: OverlayBox[] = [
  { height: 40, left: 0, top: 0, width: 600 },
  { height: 40, left: 0, top: 60, width: 600 },
];

describe(getDropIndex, () => {
  test("a drop on the second line of a wrapped row lands on that line", () => {
    expect.hasAssertions();

    expect(getDropIndex(WRAPPED_ROW, { x: 50, y: 80 }, true)).toBe(3);
  });

  test("a drop right of a wrapped row's first line lands after its last child there", () => {
    expect.hasAssertions();

    expect(getDropIndex(WRAPPED_ROW, { x: 500, y: 20 }, true)).toBe(3);
  });

  test("a drop in a single row lands before the child whose midpoint lies past the pointer", () => {
    expect.hasAssertions();

    expect(getDropIndex(SINGLE_ROW, { x: 150, y: 20 }, true)).toBe(1);
  });

  test("a drop in a stack lands by height", () => {
    expect.hasAssertions();

    expect(getDropIndex(STACK, { x: 0, y: 70 }, false)).toBe(1);
  });
});
