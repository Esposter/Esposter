import type { Commission } from "#src/models/commission/Commission";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

// The commissions the deal draws from: the tasks of each region whose opening quest is among the finished main quests, and
// Those of a region no quest is named for, which join as they are read
export const joinCommissionPool = (
  slices: readonly CommissionSlice[],
  finishedMainQuestIds: ReadonlySet<number>,
): Commission[] =>
  slices.flatMap(({ openingQuestId, tasks }) =>
    openingQuestId === undefined || finishedMainQuestIds.has(openingQuestId) ? tasks : [],
  );
