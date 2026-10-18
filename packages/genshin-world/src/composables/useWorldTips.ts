import type { Tip } from "#src/models/tip/Tip";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { ShallowRef } from "vue";

import { TipTriggerType } from "#src/models/tip/TipTriggerType";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { getTipsTriggered } from "#src/services/tip/getTipsTriggered";
import { shallowRef } from "vue";

// The tips the world shows: each tip a world event triggers and the save has not shown is shown in turn, the next only
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
  // The triggered tips join the queue behind the ones waiting, each once, and the first of them is shown if none is on screen
  const queueTips = (triggeredTips: Tip[]) => {
    queuedTips.push(...triggeredTips.filter(({ id }) => !queuedTips.some((queuedTip) => queuedTip.id === id)));
    if (!showingTip.value) showNextTip();
  };
  // A finished quest triggers the quest-or tips naming it, and the quest-all tips naming only it: a quest-all tip naming
  // Several quests never fires, since the world reads one finished quest at a time
  events.on("finishQuest", ({ id: questId }) => {
    queueTips([
      ...getTipsTriggered(tips, shownTipIds.value, TipTriggerType.FinishQuestOr, (paramList) =>
        paramList.includes(questId),
      ),
      ...getTipsTriggered(
        tips,
        shownTipIds.value,
        TipTriggerType.FinishQuestAnd,
        (paramList) => paramList.length === 1 && paramList[0] === questId,
      ),
    ]);
  });
  // A main quest finished triggers the parent-quest tips naming it
  events.on("parentQuestFinish", (mainId) => {
    queueTips(
      getTipsTriggered(tips, shownTipIds.value, TipTriggerType.FinishParentQuestOr, (paramList) =>
        paramList.includes(mainId),
      ),
    );
  });
  // A change to the bag triggers the obtain tips whose item the bag holds one of. A parameter names items by their ids joined by ';'
  events.on("bagChange", (inventory) => {
    queueTips(
      getTipsTriggered(tips, shownTipIds.value, TipTriggerType.ObtainMaterialNum, (paramList) =>
        paramList.some((param) =>
          param.split(";").some((itemId) => countInventoryItem(inventory.items, Number(itemId)) > 0),
        ),
      ),
    );
  });
  // The first unlock of a domain entrance triggers the dungeon-entry tips. Their parameter names a dungeon entry whose meaning is
  // Not read yet, so any entry's first unlock fires them, and the save keeps each shown once
  events.on("domainEntryUnlocked", () => {
    queueTips(getTipsTriggered(tips, shownTipIds.value, TipTriggerType.DungeonEntryToBeExplored, () => true));
  });
  // A World Level reached triggers the tips naming that level
  events.on("worldLevelUp", (worldLevel) => {
    queueTips(
      getTipsTriggered(tips, shownTipIds.value, TipTriggerType.WorldLevelUp, (paramList) =>
        paramList.includes(String(worldLevel)),
      ),
    );
  });
  return { closeTip, showingTip };
};
