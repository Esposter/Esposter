import type { ClipProfile } from "#src/models/voiceMatch/ClipProfile";
import type { VoiceProfile } from "#src/models/voiceMatch/VoiceProfile";

import { EMBEDDING_DECIMALS, MEDIAN, SEMITONES_PER_OCTAVE } from "#src/services/voiceMatch/constants";
import { getPercentile } from "#src/services/voiceMatch/getPercentile";

// One speaker from their clips. The embedding is the renormalised mean of the clips' unit vectors, which is what
// Averaging a reference over several clips means; the pitch statistics pool every voiced frame, so a long clip
// Weighs what its duration says and no clip's single median stands for it; the rate is syllables over speech time,
// Summed, for the same reason
export const getVoiceProfile = (clipProfiles: ClipProfile[]): VoiceProfile => {
  const [first] = clipProfiles;
  const embedding = Array.from<number>({ length: first?.embedding.length ?? 0 }).fill(0);
  for (const { embedding: clipEmbedding } of clipProfiles)
    for (const [index, value] of clipEmbedding.entries()) embedding[index] = (embedding[index] ?? 0) + value;
  const norm = Math.hypot(...embedding) || 1;
  const logF0s = clipProfiles.flatMap(({ voicedF0sHz }) => voicedF0sHz.map((f0Hz) => Math.log2(f0Hz)));
  const meanLogF0 = logF0s.reduce((sum, logF0) => sum + logF0, 0) / (logF0s.length || 1);
  const logF0Variance = logF0s.reduce((sum, logF0) => sum + (logF0 - meanLogF0) ** 2, 0) / (logF0s.length || 1);
  const speechSeconds = clipProfiles.reduce((sum, { speechSeconds: clipSeconds }) => sum + clipSeconds, 0);
  const syllables = clipProfiles.reduce((sum, { syllables: clipSyllables }) => sum + clipSyllables, 0);
  return {
    clipCount: clipProfiles.length,
    embedding: embedding.map((value) => Number((value / norm).toFixed(EMBEDDING_DECIMALS))),
    medianF0Hz: 2 ** getPercentile(logF0s, MEDIAN),
    pitchSpreadSemitones: Math.sqrt(logF0Variance) * SEMITONES_PER_OCTAVE,
    signalToNoiseDb: getPercentile(
      clipProfiles.map(({ signalToNoiseDb }) => signalToNoiseDb),
      MEDIAN,
    ),
    speechSeconds,
    syllablesPerSecond: syllables / (speechSeconds || 1),
  };
};
