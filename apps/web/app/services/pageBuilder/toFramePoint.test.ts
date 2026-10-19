import { toFramePoint } from "@/services/pageBuilder/toFramePoint";
import { describe, expect, test } from "vitest";

describe(toFramePoint, () => {
  test("a point is converted to frame pixels through the frame offset and scale", () => {
    expect.hasAssertions();

    expect(toFramePoint({ x: 300, y: 150 }, { left: 100, top: 50 }, 0.5)).toStrictEqual({ x: 400, y: 200 });
  });
});
