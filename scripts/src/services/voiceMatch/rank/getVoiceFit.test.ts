import type { CandidateVoice } from "#src/models/voiceMatch/CandidateVoice";
import type { VoiceProfile } from "#src/models/voiceMatch/VoiceProfile";

import {
  MAX_PITCH_SHIFT,
  PITCH_WEIGHT,
  RATE_WEIGHT,
  SPREAD_WEIGHT,
  TIMBRE_WEIGHT,
} from "#src/services/voiceMatch/constants";
import { getVoiceFit } from "#src/services/voiceMatch/rank/getVoiceFit";
import { describe, expect, test } from "vitest";

describe(getVoiceFit, () => {
  const name = "name";
  const reference: VoiceProfile = {
    clipCount: 1,
    embedding: [1, 0],
    medianF0Hz: 200,
    pitchSpreadSemitones: 0,
    signalToNoiseDb: 0,
    speechSeconds: 1,
    syllablesPerSecond: 1,
  };
  const getCandidate = (profile: Partial<VoiceProfile>): CandidateVoice => ({
    name,
    profile: { ...reference, ...profile },
    styles: [],
    wordErrorRate: 0,
  });

  test("scores the same voice as a perfect fit with no adjustment", () => {
    expect.hasAssertions();

    expect(getVoiceFit(reference, getCandidate({}), 1, 1)).toStrictEqual({
      pitch: 0,
      rate: 0,
      score: TIMBRE_WEIGHT + PITCH_WEIGHT + RATE_WEIGHT + SPREAD_WEIGHT,
      voice: name,
    });
  });

  test("solves pitch from the ratio of medians and rate relative to each corpus's median", () => {
    expect.hasAssertions();

    // Half the reference's pitch needs the full rise; the same rate as the reference, in a corpus running at half
    // The reference corpus's median, is twice as fast relatively and needs slowing by half
    const fit = getVoiceFit(reference, getCandidate({ medianF0Hz: 200 / 1.5, syllablesPerSecond: 1 }), 1, 0.5);

    expect(fit?.pitch).toBe(MAX_PITCH_SHIFT);
    expect(fit?.rate).toBe(-50);
  });

  test("returns nothing for a voice the service would clamp", () => {
    expect.hasAssertions();

    expect(getVoiceFit(reference, getCandidate({ medianF0Hz: 100 }), 1, 1)).toBeUndefined();
    expect(getVoiceFit(reference, getCandidate({ syllablesPerSecond: 0.1 }), 1, 1)).toBeUndefined();
  });
});
