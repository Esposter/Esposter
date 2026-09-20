import { NOISE_PERCENTILE, SIGNAL_PERCENTILE } from "#src/services/voiceMatch/constants";
import { getPercentile } from "#src/services/voiceMatch/getPercentile";

// The speech level over the floor between words: a clip recorded under noise is a poor reference however typical
// Its voice, so the floor is a cut before the nearest clip is chosen
export const getSignalToNoiseDb = (energiesDb: number[]): number =>
  getPercentile(energiesDb, SIGNAL_PERCENTILE) - getPercentile(energiesDb, NOISE_PERCENTILE);
