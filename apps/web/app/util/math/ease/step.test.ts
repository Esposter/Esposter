import type { Threshold } from "#src/models/math/Threshold";

import { step } from "#src/util/math/ease/step";
import { describe, expect, test } from "vitest";

describe(step, () => {
  const speed = 1;
  const threshold = 1;
  const thresholds: Threshold[] = [{ speed, threshold }, { speed: speed + 1 }];

  test("holds a speed up to its threshold, then steps to the next", () => {
    expect.hasAssertions();

    expect(step(0, thresholds)).toBe(speed);
    expect(step(threshold, thresholds)).toBe(speed);
    expect(step(threshold + 1, thresholds)).toBe(speed + 1);
  });
});
