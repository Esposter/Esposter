import { getStartRotationY } from "@/services/visual/globe/getStartRotationY";
import { describe, expect, test } from "vitest";

describe(getStartRotationY, () => {
  test("a reader in Greenwich starts at the base rotation", () => {
    expect.hasAssertions();

    expect(getStartRotationY(0)).toBe(0);
  });

  test("a reader ten hours east turns their longitude to the camera", () => {
    expect.hasAssertions();

    // The browser reports UTC minus local time, so ten hours east is minus six hundred minutes
    expect(getStartRotationY(-600)).toBeCloseTo((-150 * Math.PI) / 180, 10);
  });
});
