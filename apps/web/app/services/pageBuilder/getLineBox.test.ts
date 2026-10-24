import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { LINE_THICKNESS } from "@/services/pageBuilder/constants";
import { getLineBox } from "@/services/pageBuilder/getLineBox";
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

describe(getLineBox, () => {
  test("a line before the first child of a wrapped row stands at that child's left edge", () => {
    expect.hasAssertions();

    expect(getLineBox({ childBoxes: WRAPPED_ROW, index: 3, isHorizontal: true })).toStrictEqual({
      height: 40,
      left: -LINE_THICKNESS / 2,
      top: 60,
      width: LINE_THICKNESS,
    });
  });

  test("a line in a single row stands in the gap between its two children", () => {
    expect.hasAssertions();

    expect(getLineBox({ childBoxes: SINGLE_ROW, index: 1, isHorizontal: true })).toStrictEqual({
      height: 40,
      left: 200 - LINE_THICKNESS / 2,
      top: 0,
      width: LINE_THICKNESS,
    });
  });
});
