import { resampleClip } from "#src/services/resampleClip";
import { describe, expect, test } from "vitest";

describe(resampleClip, () => {
  test("keeps a clip already at the rate", () => {
    expect.hasAssertions();

    const samples = Float32Array.of(0, 1);

    expect(resampleClip({ sampleRate: 1, samples }, 1)).toStrictEqual({ sampleRate: 1, samples });
  });

  test("interpolates between the samples it keeps", () => {
    expect.hasAssertions();

    expect(resampleClip({ sampleRate: 2, samples: Float32Array.of(0, 1, 0, 1) }, 1)).toStrictEqual({
      sampleRate: 1,
      samples: Float32Array.of(0, 0),
    });
    expect(resampleClip({ sampleRate: 4, samples: Float32Array.of(0, 1, 0, 1) }, 3)).toStrictEqual({
      sampleRate: 3,
      samples: Float32Array.from([0, 1 - 1 / 3, 2 / 3]),
    });
  });
});
