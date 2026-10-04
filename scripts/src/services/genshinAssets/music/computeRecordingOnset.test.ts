import { computeRecordingOnset } from "#src/services/genshinAssets/music/computeRecordingOnset";
import { describe, expect, test } from "vitest";

describe(computeRecordingOnset, () => {
  test("reads where a recording first reaches a tenth of its loudest", () => {
    expect.hasAssertions();

    expect(computeRecordingOnset(Float32Array.of(0, 0.05, -0.2, 1), 2)).toBe(1);
  });
});
