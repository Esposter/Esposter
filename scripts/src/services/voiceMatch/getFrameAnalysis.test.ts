import { HOP_SECONDS, MEDIAN, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getFrameAnalysis } from "#src/services/voiceMatch/getFrameAnalysis";
import { getPercentile } from "#src/services/voiceMatch/getPercentile";
import { describe, expect, test } from "vitest";

describe(getFrameAnalysis, () => {
  // A period of exactly 80 samples, so the tracker has an exact lag to land on
  const TONE_HZ = 200;
  const TONE_SECONDS = 0.5;
  const toneSamples = TONE_SECONDS * MODEL_SAMPLE_RATE;
  const tone = Float32Array.from({ length: toneSamples * 2 }, (_, index) =>
    index < toneSamples ? Math.sin((2 * Math.PI * TONE_HZ * index) / MODEL_SAMPLE_RATE) : 0,
  );

  test("reads the tone's pitch off its voiced frames and none off the silence after it", () => {
    expect.hasAssertions();

    const { energiesDb, f0sHz } = getFrameAnalysis({ sampleRate: MODEL_SAMPLE_RATE, samples: tone });
    const voicedF0sHz = f0sHz.filter((f0Hz) => f0Hz > 0);
    const silentFrames = f0sHz.slice(Math.ceil(TONE_SECONDS / HOP_SECONDS));

    expect(energiesDb).toHaveLength(f0sHz.length);
    expect(getPercentile(voicedF0sHz, MEDIAN)).toBe(TONE_HZ);
    expect(voicedF0sHz.length).toBeGreaterThan(silentFrames.length);
    expect(silentFrames.every((f0Hz) => f0Hz === 0)).toBe(true);
  });
});
