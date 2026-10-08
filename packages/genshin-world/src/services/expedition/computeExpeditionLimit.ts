import type { ExpeditionLimitAdd } from "#src/models/expedition/ExpeditionLimitAdd";

import { EXPEDITION_BASE_LIMIT } from "#src/services/expedition/constants";

// How many expeditions may be out at once at this Adventure Rank: the base limit, raised by each rank's addition up to it
export const computeExpeditionLimit = (adventureRank: number, limitAdds: readonly ExpeditionLimitAdd[]): number =>
  limitAdds
    .filter(({ level }) => level <= adventureRank)
    .reduce((limit, { expeditionLimitAdd }) => limit + expeditionLimitAdd, EXPEDITION_BASE_LIMIT);
