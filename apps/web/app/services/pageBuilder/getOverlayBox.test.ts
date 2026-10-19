import { getOverlayBox } from "@/services/pageBuilder/getOverlayBox";
import { describe, expect, test } from "vitest";

describe(getOverlayBox, () => {
  test("an overlay sits where its element sits inside the frame", () => {
    expect.hasAssertions();

    expect(getOverlayBox({ height: 20, left: 120, top: 40, width: 80 }, { left: 20, top: 10 })).toStrictEqual({
      height: 20,
      left: 100,
      top: 30,
      width: 80,
    });
  });

  test("an overlay keeps its element's size", () => {
    expect.hasAssertions();

    expect(getOverlayBox({ height: 36, left: 0, top: 0, width: 240 }, { left: 0, top: 0 })).toStrictEqual({
      height: 36,
      left: 0,
      top: 0,
      width: 240,
    });
  });
});
