import type { Tip } from "#src/models/tip/Tip";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { ShallowRef } from "vue";

import { getTipsTriggeredByQuest } from "#src/services/tip/getTipsTriggeredByQuest";
import { shallowRef } from "vue";

// The tips the world shows: each tip a finished quest triggers and the save has not shown is shown in turn, the next only
// Once the one on screen is closed. A tip is kept in the save once it is shown, so it is shown once per save
export const useWorldTips = ({
  events,
  shownTipIds,
  tips,
}: {
  events: WorldEvents;
  shownTipIds: ShallowRef<ReadonlySet<number>>;
  tips: readonly Tip[];
}) => {
  const showingTip = shallowRef<Tip>();
  const queuedTips: Tip[] = [];
  const showTip = (tip: Tip) => {
    shownTipIds.value = new Set(shownTipIds.value).add(tip.id);
    showingTip.value = tip;
    events.emit("tipShown", tip);
  };
  const showNextTip = () => {
    const nextTip = queuedTips.shift();
    if (nextTip) showTip(nextTip);
  };
  const closeTip = () => {
    showingTip.value = undefined;
    showNextTip();
  };
  events.on("finishQuest", ({ id: questId }) => {
    queuedTips.push(
      ...getTipsTriggeredByQuest(tips, questId, shownTipIds.value).filter(
        ({ id }) => !queuedTips.some((queuedTip) => queuedTip.id === id),
      ),
    );
    if (!showingTip.value) showNextTip();
  });
  return { closeTip, showingTip };
};
