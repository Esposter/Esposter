import type { ItemCount } from "#src/models/inventory/ItemCount";

import { WEEKLY_BOSS_TALENT_ITEM_IDS } from "#src/services/bosses/constants";
import { claimFirstClearReward } from "#src/services/domains/claimFirstClearReward";

// A weekly boss's highest difficulty, cleared for the first time, pays one of each of the boss's talent materials, the
// Ones its claim pays. A repeat clear gives nothing, as any domain's first clear does, through the one rule they share
export const claimWeeklyBossFirstClear = (
  clearedDomainIds: ReadonlySet<string>,
  domainId: string,
): { clearedDomainIds: ReadonlySet<string>; rewards: ItemCount[] } =>
  claimFirstClearReward(
    clearedDomainIds,
    domainId,
    WEEKLY_BOSS_TALENT_ITEM_IDS.map((id): ItemCount => ({ count: 1, id })),
  );
