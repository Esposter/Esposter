import type { LoadReading } from "#src/models/genshinParity/page/LoadReading";

import { formatLoadMeter } from "#src/services/genshinParity/shared/formatLoadMeter";
import { describe, expect, test } from "vitest";

describe(formatLoadMeter, () => {
  const reading = (isFailed: boolean): LoadReading => ({
    bench: {
      gameDataBytes: 0,
      gameDataRequests: 0,
      geometries: 0,
      kindCounts: {},
      measures: [{ duration: 1, isFailed, name: "world-gate" }],
      programs: 0,
      requests: 0,
      textures: 0,
      totalBytes: 0,
    },
    readyMs: 0,
  });

  test("passes a load within budget whose steps all settled", () => {
    expect.hasAssertions();
    expect(formatLoadMeter(reading(false), undefined, "machine").isFailed).toBe(false);
  });

  test("fails a load with a failed step, though every figure is within budget", () => {
    expect.hasAssertions();
    expect(formatLoadMeter(reading(true), undefined, "machine").isFailed).toBe(true);
  });
});
