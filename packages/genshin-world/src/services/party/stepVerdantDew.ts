import type { Party } from "#src/models/party/Party";

import { VERDANT_DEW_GATHER_SECONDS, VERDANT_DEW_MAXIMUM_COUNT } from "#src/services/party/constants";
import { runDownSeconds } from "#src/services/runDownSeconds";

// The party's Verdant Dew some seconds on, written in place: while a Lunar-Bloom lets it gather and the party holds
// Fewer than the most, the seconds gather toward the next Dew, which is gained once they reach a Dew's, and what was
// Gathered toward it is kept between Lunar-Blooms, as gcsim (MIT) pkg/core/player/verdantdew.go keeps it
export const stepVerdantDew = ({ verdantDew }: Party, stepSeconds: number): void => {
  if (verdantDew.gatheringSeconds <= 0) return;
  if (verdantDew.count < VERDANT_DEW_MAXIMUM_COUNT) {
    verdantDew.gatheredSeconds += Math.min(stepSeconds, verdantDew.gatheringSeconds);
    if (verdantDew.gatheredSeconds >= VERDANT_DEW_GATHER_SECONDS) {
      verdantDew.count++;
      verdantDew.gatheredSeconds = 0;
    }
  }
  verdantDew.gatheringSeconds = Math.max(0, runDownSeconds(verdantDew.gatheringSeconds, stepSeconds));
};
