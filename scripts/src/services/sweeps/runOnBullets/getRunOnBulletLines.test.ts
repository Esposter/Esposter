import { getRunOnBulletLines } from "#src/services/sweeps/runOnBullets/getRunOnBulletLines";
import { describe, expect, test } from "vitest";

describe(getRunOnBulletLines, () => {
  test("finds a bullet opened on the line of the sentence before it", () => {
    expect.hasAssertions();

    expect(getRunOnBulletLines("# Design\n\n- **One.** Its text.- **Two.** Its text.\n")).toStrictEqual([3]);
  });

  test("finds none where each bullet opens a line", () => {
    expect.hasAssertions();

    expect(getRunOnBulletLines("- **One.** Its text.\n- **Two.** Its text.\n")).toStrictEqual([]);
  });
});
