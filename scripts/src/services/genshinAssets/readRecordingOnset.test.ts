import { readRecordingOnset } from "#src/services/genshinAssets/readRecordingOnset";
import { describe, expect, test } from "vitest";

describe(readRecordingOnset, () => {
  test("reads where a recording first reaches a tenth of its loudest", () => {
    expect.hasAssertions();

    expect(readRecordingOnset(Float32Array.of(0, 0.05, -0.2, 1), 2)).toBe(1);
  });
});
