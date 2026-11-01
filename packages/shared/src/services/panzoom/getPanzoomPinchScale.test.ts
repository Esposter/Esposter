import { getPanzoomPinchScale } from "#src/services/panzoom/getPanzoomPinchScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomPinchScale, () => {
  test("#643 and #671 move a pinch by the step per 80 pixels of finger distance, at any scale", () => {
    expect.hasAssertions();

    expect(getPanzoomPinchScale(5, 80, 0.3)).toBe(6.5);
    expect(getPanzoomPinchScale(10, 80, 0.3)).toBe(13);
  });
});
