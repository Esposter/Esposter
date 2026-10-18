import type { Inventory } from "#src/models/inventory/Inventory";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Tip, TipTrigger } from "#src/models/tip/Tip";

import { useWorldTips } from "#src/composables/useWorldTips";
import { QuestKind } from "#src/models/quest/QuestKind";
import { TipTriggerType } from "#src/models/tip/TipTriggerType";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

const QUEST_ID = "1";
const ITEM_ID = 101;
const PROGRESS: QuestProgress = { objectiveCounts: [], stepIndex: 0 };
const quest = (id: string): Quest => ({
  descriptionTextId: "",
  id,
  kind: QuestKind.World,
  mainId: id,
  offerTalkIds: [],
  rewards: [],
  steps: [],
  talks: [],
  titleTextId: "",
});
const tip = (
  id: number,
  trigger: TipTrigger = { paramList: [QUEST_ID], triggerType: TipTriggerType.FinishQuestOr },
): Tip => ({ id, subtitleTextId: "", titleTextId: "", trigger });
const inventoryOf = (itemIds: number[]): Inventory => ({
  items: itemIds.map((itemId, id) => ({
    definition: { category: ItemCategory.Material, id: itemId, name: "", rank: 0, rarity: 0, stackLimit: 99 },
    id,
    quantity: 1,
  })),
  nextId: itemIds.length,
});
const createWorldTips = (tips: Tip[], shown: ReadonlySet<number> = new Set()) => {
  const events = createWorldEvents();
  const shownTipIds = shallowRef<ReadonlySet<number>>(shown);
  return { events, shownTipIds, ...useWorldTips({ events, shownTipIds, tips }) };
};

describe(useWorldTips, () => {
  test("a triggered tip is shown once when its quest finishes and is kept shown in the save", () => {
    expect.hasAssertions();
    const tipShown = vi.fn<(tip: Tip) => void>();
    const { events, shownTipIds, showingTip } = createWorldTips([tip(1)]);
    events.on("tipShown", tipShown);
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value).toStrictEqual(tip(1));
    expect(shownTipIds.value.has(1)).toBe(true);
    expect(tipShown).toHaveBeenCalledWith(tip(1));
  });

  test("a tip the save has shown is not shown again", () => {
    expect.hasAssertions();
    const { events, showingTip } = createWorldTips([tip(1)], new Set([1]));
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value).toBeUndefined();
  });

  test("a second tip waits until the one on screen is closed", () => {
    expect.hasAssertions();
    const { closeTip, events, showingTip } = createWorldTips([tip(1), tip(2)]);
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value).toStrictEqual(tip(1));
    closeTip();
    expect(showingTip.value).toStrictEqual(tip(2));
    closeTip();
    expect(showingTip.value).toBeUndefined();
  });

  test("a quest-all tip naming the quest that finishes is shown", () => {
    expect.hasAssertions();
    const { events, showingTip } = createWorldTips([
      tip(1, { paramList: [QUEST_ID], triggerType: TipTriggerType.FinishQuestAnd }),
    ]);
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value?.id).toBe(1);
  });

  test("a quest-all tip naming several quests is not shown for one of them", () => {
    expect.hasAssertions();
    const { events, showingTip } = createWorldTips([
      tip(1, { paramList: [QUEST_ID, "2"], triggerType: TipTriggerType.FinishQuestAnd }),
    ]);
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value).toBeUndefined();
  });

  test("an obtain tip is shown once the bag holds one of its items", () => {
    expect.hasAssertions();
    const { events, showingTip } = createWorldTips([
      tip(1, { paramList: [`${ITEM_ID};${ITEM_ID + 1}`], triggerType: TipTriggerType.ObtainMaterialNum }),
    ]);
    events.emit("bagChange", inventoryOf([ITEM_ID + 1]));
    expect(showingTip.value?.id).toBe(1);
  });

  test("an obtain tip is not shown while the bag holds none of its items", () => {
    expect.hasAssertions();
    const { events, showingTip } = createWorldTips([
      tip(1, { paramList: [String(ITEM_ID)], triggerType: TipTriggerType.ObtainMaterialNum }),
    ]);
    events.emit("bagChange", inventoryOf([ITEM_ID + 1]));
    expect(showingTip.value).toBeUndefined();
  });

  test("a world level tip is shown when the world level reaches its level", () => {
    expect.hasAssertions();
    const { events, showingTip } = createWorldTips([
      tip(1, { paramList: ["2"], triggerType: TipTriggerType.WorldLevelUp }),
    ]);
    events.emit("worldLevelUp", 1);
    expect(showingTip.value).toBeUndefined();
    events.emit("worldLevelUp", 2);
    expect(showingTip.value?.id).toBe(1);
  });
});
