import type { Threshold } from "@/models/math/Threshold";

import { step } from "@/util/math/ease/step";
import { describe, expect, test } from "vitest";

describe(step, () => {
  const speed = 1;
  const threshold = 10;
  const thresholds: Threshold[] = [{ speed, threshold }, { speed: speed + 1 }];

  test("steps", () => {
    expect.hasAssertions();

    expect(step(0, thresholds)).toBe(speed);
    expect(step(threshold, thresholds)).toBe(speed);
    expect(step(threshold + 1, thresholds)).toBe(speed + 1);
  });
});
