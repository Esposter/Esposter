import type { HandbookDomain } from "#src/models/handbook/HandbookDomain";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";

import { DomainKind } from "#src/models/domains/DomainKind";
import { checkIsWeeklyBossEntryOpen } from "#src/services/bosses/checkIsWeeklyBossEntryOpen";
import { checkIsWeeklyBossFirstClaimable } from "#src/services/bosses/checkIsWeeklyBossFirstClaimable";
import { checkIsWeeklyBossQuickChallengeable } from "#src/services/bosses/checkIsWeeklyBossQuickChallengeable";

// The rows of the Domains tab, one per entrance in the order given. A weekly boss's domain is locked until its introducing
// Quests are done, and any other domain until its landmark is unlocked
export const toHandbookDomains = (
  entrances: readonly DomainEntranceLandmark[],
  {
    adventureRank,
    clearedDomainIds,
    completedMainQuestIds,
    unlockedLandmarkIds,
  }: {
    adventureRank: number;
    clearedDomainIds: ReadonlySet<string>;
    completedMainQuestIds: ReadonlySet<string>;
    unlockedLandmarkIds: ReadonlySet<string>;
  },
): HandbookDomain[] =>
  entrances.map((landmark) => {
    const isWeekly = landmark.domainKind === DomainKind.Trounce;
    const isLocked = isWeekly
      ? !checkIsWeeklyBossEntryOpen(landmark.entryId, completedMainQuestIds)
      : !unlockedLandmarkIds.has(landmark.id);
    return {
      entryId: landmark.entryId,
      isFirstClearClaimable: isWeekly && checkIsWeeklyBossFirstClaimable(clearedDomainIds, landmark.entryId),
      isLocked,
      isQuickChallengeable: isWeekly && checkIsWeeklyBossQuickChallengeable(adventureRank, isLocked),
      landmark,
      titleTextKey: landmark.titleTextKey,
    };
  });
