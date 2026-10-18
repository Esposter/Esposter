import type { Tip } from "#src/models/tip/Tip";

import { TipTriggerType } from "#src/models/tip/TipTriggerType";

// The tips a finished quest triggers and the save has not shown yet: a tip whose trigger is a quest among its parameters,
// Among them the quest that finished. A trigger of another kind is not matched, since the world raises no event for it
export const getTipsTriggeredByQuest = (
  tips: readonly Tip[],
  questId: string,
  shownTipIds: ReadonlySet<number>,
): Tip[] =>
  tips.filter(
    ({ id, trigger }) =>
      trigger?.triggerType === TipTriggerType.FinishQuestOr &&
      trigger.paramList.includes(questId) &&
      !shownTipIds.has(id),
  );
