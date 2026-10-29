import { computeMedianFrameTime } from "#src/services/dev/computeMedianFrameTime";
import { describe, expect, test } from "vitest";

describe(computeMedianFrameTime, () => {
  test.each([
    { expected: 20, frameTimes: [30, 10, 20], title: "the middle frame of an odd count" },
    { expected: 25, frameTimes: [40, 10, 30, 20], title: "the mean of the two middle frames of an even count" },
  ])("is $title", ({ expected, frameTimes }) => {
    expect.hasAssertions();

    expect(computeMedianFrameTime(frameTimes)).toBe(expected);
  });

  test("reads no frame as zero", () => {
    expect.hasAssertions();

    expect(computeMedianFrameTime([])).toBe(0);
  });
});
