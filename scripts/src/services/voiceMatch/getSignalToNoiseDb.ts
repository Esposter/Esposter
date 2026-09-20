import type { FrameAnalysis } from "#src/models/voiceMatch/FrameAnalysis";

import { NOISE_PERCENTILE, SIGNAL_PERCENTILE } from "#src/services/voiceMatch/constants";
import { getPercentile } from "#src/services/voiceMatch/getPercentile";

// The speech level over the floor between words, as the field's duration-and-noise caveat asks to have measured on
// Both corpora before their embeddings are compared: game audio is mastered and synthesis is clean, and a gap here
// Moves the score on its own
export const getSignalToNoiseDb = ({ energiesDb }: FrameAnalysis): number =>
  getPercentile(energiesDb, SIGNAL_PERCENTILE) - getPercentile(energiesDb, NOISE_PERCENTILE);
