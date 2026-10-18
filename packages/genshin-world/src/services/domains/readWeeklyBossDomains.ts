import type { WeeklyBossDomain } from "#src/models/domains/WeeklyBossDomain";

import { weeklyBossDomainsSchema } from "#src/models/domains/WeeklyBossDomain";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { readGameData } from "#src/services/data/readGameData";

// The weekly bosses' trounce domains by entry id, fetched from the hosted game data once a publish has written them. Before
// One does the game holds none, so there are none to list rather than a read that fails
export const readWeeklyBossDomains = (gameDataBaseUrl: string): Promise<Record<string, WeeklyBossDomain>> => {
  const weeklyBossDomainsKey: `domains/${string}` = "domains/weeklyBosses";
  return checkIsGameDataKey(weeklyBossDomainsKey)
    ? readGameData(gameDataBaseUrl, weeklyBossDomainsKey, weeklyBossDomainsSchema)
    : Promise.resolve({});
};
