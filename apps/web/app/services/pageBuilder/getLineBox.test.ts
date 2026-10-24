import type { OverlayBox } from "@/models/pageBuilder/OverlayBox";

import { LINE_THICKNESS } from "@/services/pageBuilder/constants";
import { TEST_SINGLE_ROW, TEST_WRAPPED_ROW } from "@/services/pageBuilder/constants.test";
import { getLineBox } from "@/services/pageBuilder/getLineBox";
import { describe, expect, test } from "vitest";

describe(getLineBox, () => {
  test("a line before the first child of a wrapped row stands at that child's left edge", () => {
    expect.hasAssertions();

    expect(getLineBox({ childBoxes: TEST_WRAPPED_ROW, index: 3, isHorizontal: true })).toStrictEqual({
      height: 40,
      left: -LINE_THICKNESS / 2,
      top: 60,
      width: LINE_THICKNESS,
    });
  });

  test("a line in a single row stands in the gap between its two children", () => {
    expect.hasAssertions();

    expect(getLineBox({ childBoxes: TEST_SINGLE_ROW, index: 1, isHorizontal: true })).toStrictEqual({
      height: 40,
      left: 200 - LINE_THICKNESS / 2,
      top: 0,
      width: LINE_THICKNESS,
    });
  });
});
