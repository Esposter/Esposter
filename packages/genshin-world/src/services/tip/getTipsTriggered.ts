import type { Tip } from "#src/models/tip/Tip";
import type { TipTriggerType } from "#src/models/tip/TipTriggerType";

// The tips a trigger of one kind fires on an event: the tips of that kind whose parameters the event matches, and which the
// Save has not shown yet
export const getTipsTriggered = (
  tips: readonly Tip[],
  shownTipIds: ReadonlySet<number>,
  triggerType: TipTriggerType,
  matchesParamList: (paramList: string[]) => boolean,
): Tip[] =>
  tips.filter(
    ({ id, trigger }) =>
      trigger?.triggerType === triggerType && matchesParamList(trigger.paramList) && !shownTipIds.has(id),
  );
