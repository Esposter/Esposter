import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";

import { getVoiceProfile } from "#src/services/voiceMatch/getVoiceProfile";
import { describe, expect, test } from "vitest";

describe(getVoiceProfile, () => {
  const clipProfiles: ClipProfile[] = [
    {
      embedding: Float32Array.of(1, 0),
      signalToNoiseDb: 0,
      speechSeconds: 1,
      syllables: 1,
      voicedF0sHz: [100],
    },
    {
      embedding: Float32Array.of(0, 1),
      signalToNoiseDb: 1,
      speechSeconds: 2,
      syllables: 2,
      voicedF0sHz: [200, 400],
    },
  ];

  test("pools every voiced frame, sums the rate, and renormalises the mean embedding", () => {
    expect.hasAssertions();

    const profile = getVoiceProfile(clipProfiles);

    expect(profile.clipCount).toBe(2);
    expect(profile.embedding[0]).toBeCloseTo(Math.SQRT1_2);
    expect(profile.embedding[1]).toBeCloseTo(Math.SQRT1_2);
    expect(profile.medianF0Hz).toBeCloseTo(200);
    // Three pitches an octave apart: a standard deviation of one octave scaled by two thirds
    expect(profile.pitchSpreadSemitones).toBeCloseTo(Math.sqrt(2 / 3) * 12);
    expect(profile.speechSeconds).toBe(3);
    expect(profile.syllablesPerSecond).toBe(1);
    expect(profile.signalToNoiseDb).toBe(1);
  });
});
