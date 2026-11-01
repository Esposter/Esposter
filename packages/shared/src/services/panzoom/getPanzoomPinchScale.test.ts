import { getPanzoomPinchScale } from "#src/services/panzoom/getPanzoomPinchScale";
import { describe, expect, test } from "vitest";

describe(getPanzoomPinchScale, () => {
  test("#63 scales a pinch by the ratio of the fingers' distance to the distance at the start", () => {
    expect.hasAssertions();

    expect(getPanzoomPinchScale(4, 100, 200)).toBe(8);
  });

  test("#643 a pinch that spreads the fingers from 100 to 180 pixels at scale 5 ends at scale 9", () => {
    expect.hasAssertions();

    expect(getPanzoomPinchScale(5, 100, 180)).toBe(9);
  });

  test("#671 a pinch at scale 10 that grows the fingers from 100 to 130 pixels ends at scale 13", () => {
    expect.hasAssertions();

    expect(getPanzoomPinchScale(10, 100, 130)).toBe(13);
  });

  test("#683 a pinch whose fingers move by one wheel notch's ratio ends where that notch does, at scale 20", () => {
    expect.hasAssertions();

    expect(getPanzoomPinchScale(20, 100, 110.5171)).toBeCloseTo(22.10342, 5);
  });
});
