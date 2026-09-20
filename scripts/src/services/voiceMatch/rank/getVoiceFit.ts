import type { CandidateVoice } from "#src/models/voiceMatch/CandidateVoice";
import type { VoiceFit } from "#src/models/voiceMatch/VoiceFit";
import type { VoiceProfile } from "#src/models/voiceMatch/VoiceProfile";

import {
  MAX_PITCH_SHIFT,
  MAX_RATE_SHIFT,
  MIN_RATE_SHIFT,
  PITCH_WEIGHT,
  RATE_WEIGHT,
  SPREAD_TOLERANCE_SEMITONES,
  SPREAD_WEIGHT,
  TIMBRE_WEIGHT,
} from "#src/services/voiceMatch/constants";
import { getCosineSimilarity } from "#src/services/voiceMatch/rank/getCosineSimilarity";
import { getShiftPercentage } from "#src/services/voiceMatch/rank/getShiftPercentage";

// Stage 3 and the composite for stage 4, for one voice against one character. Pitch is compared in hertz, since a
// Hertz is a hertz in any corpus; rate is compared relative to each corpus's own median, since a cast's lines and
// A synthetic carrier run at different syllable rates and a raw ratio would move every voice by that difference. A
// Shift the service would clamp is the wrong voice, and nothing is returned for it
export const getVoiceFit = (
  reference: VoiceProfile,
  candidate: CandidateVoice,
  referenceRateMedian: number,
  candidateRateMedian: number,
): undefined | VoiceFit => {
  const pitch = getShiftPercentage(reference.medianF0Hz, candidate.profile.medianF0Hz);
  const rate = getShiftPercentage(
    reference.syllablesPerSecond / referenceRateMedian,
    candidate.profile.syllablesPerSecond / candidateRateMedian,
  );
  if (Math.abs(pitch) > MAX_PITCH_SHIFT || rate < MIN_RATE_SHIFT || rate > MAX_RATE_SHIFT) return undefined;

  const timbre = getCosineSimilarity(reference.embedding, candidate.profile.embedding);
  const pitchFit = 1 - Math.abs(pitch) / MAX_PITCH_SHIFT;
  const rateFit = 1 - (rate < 0 ? rate / MIN_RATE_SHIFT : rate / MAX_RATE_SHIFT);
  const spreadDistance = Math.abs(reference.pitchSpreadSemitones - candidate.profile.pitchSpreadSemitones);
  const spreadFit = Math.max(0, 1 - spreadDistance / SPREAD_TOLERANCE_SEMITONES);
  const score = TIMBRE_WEIGHT * timbre + PITCH_WEIGHT * pitchFit + RATE_WEIGHT * rateFit + SPREAD_WEIGHT * spreadFit;
  return { pitch, rate, score, voice: candidate.name };
};
