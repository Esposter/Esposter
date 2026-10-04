import { readGroundRow } from "#src/services/genshinParity/witness/readGroundRow";
import { describe, expect, test } from "vitest";

describe(readGroundRow, () => {
  const camera = { eyeHeight: 1, fov: 90, height: 100, pitch: 0 };

  test("sees level ground at its eye height ahead half a field of view down, and the far ground at the horizon", () => {
    expect.hasAssertions();
    expect(readGroundRow(1, camera)).toBeCloseTo(100);
    expect(readGroundRow(1e9, camera)).toBeCloseTo(50);
  });

  test("lowers the horizon by the pitch", () => {
    expect.hasAssertions();
    expect(readGroundRow(1e9, { ...camera, pitch: 45 })).toBeCloseTo(100);
  });
});
