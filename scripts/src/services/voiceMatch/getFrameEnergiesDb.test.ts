import { HOP_SECONDS, MODEL_SAMPLE_RATE } from "#src/services/voiceMatch/constants";
import { getFrameEnergiesDb } from "#src/services/voiceMatch/getFrameEnergiesDb";
import { describe, expect, test } from "vitest";

describe(getFrameEnergiesDb, () => {
  const TONE_SECONDS = 0.5;
  const toneSamples = TONE_SECONDS * MODEL_SAMPLE_RATE;
  const tone = Float32Array.from({ length: toneSamples * 2 }, (_, index) => (index < toneSamples ? 1 : 0));

  test("reads one energy per hop, loud over the tone and floored over the silence after it", () => {
    expect.hasAssertions();

    const energiesDb = getFrameEnergiesDb({ sampleRate: MODEL_SAMPLE_RATE, samples: tone });
    const silentFrames = energiesDb.slice(Math.ceil(TONE_SECONDS / HOP_SECONDS));

    expect(energiesDb[0]).toBeCloseTo(0);
    expect(silentFrames.every((energyDb) => energyDb < 0)).toBe(true);
    expect(silentFrames.length).toBeGreaterThan(0);
  });
});
