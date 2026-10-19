import { getFrameScale } from "#src/services/getFrameScale";
import { describe, expect, test } from "vitest";

describe(getFrameScale, () => {
  test("a pane width of 0 gives scale 1", () => {
    expect.hasAssertions();
    expect(getFrameScale(0, 992)).toBe(1);
  });

  test("a narrow pane scales the frame down", () => {
    expect.hasAssertions();
    expect(getFrameScale(600, 992)).toBe(600 / 992);
  });

  test("a wide pane does not scale the frame above 1", () => {
    expect.hasAssertions();
    expect(getFrameScale(1200, 992)).toBe(1);
  });
});
