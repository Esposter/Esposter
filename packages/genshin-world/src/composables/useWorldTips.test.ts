import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Tip } from "#src/models/tip/Tip";

import { useWorldTips } from "#src/composables/useWorldTips";
import { QuestKind } from "#src/models/quest/QuestKind";
import { TipTriggerType } from "#src/models/tip/TipTriggerType";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

const QUEST_ID = "1";
const PROGRESS: QuestProgress = { objectiveCounts: [], stepIndex: 0 };
const quest = (id: string): Quest => ({
  descriptionTextId: "",
  id,
  kind: QuestKind.World,
  offerTalkIds: [],
  rewards: [],
  steps: [],
  talks: [],
  titleTextId: "",
});
const tip = (id: number): Tip => ({
  id,
  subtitleTextId: "",
  titleTextId: "",
  trigger: { paramList: [QUEST_ID], triggerType: TipTriggerType.FinishQuestOr },
});

describe(useWorldTips, () => {
  test("a tip triggered by a finished quest is shown and kept shown in the save", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const shownTipIds = shallowRef<ReadonlySet<number>>(new Set());
    const tipShown = vi.fn<(tip: Tip) => void>();
    events.on("tipShown", tipShown);
    const { showingTip } = useWorldTips({ events, shownTipIds, tips: [tip(1)] });
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value).toStrictEqual(tip(1));
    expect(shownTipIds.value.has(1)).toBe(true);
    expect(tipShown).toHaveBeenCalledWith(tip(1));
  });

  test("a tip the save has shown is not shown again", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { showingTip } = useWorldTips({
      events,
      shownTipIds: shallowRef<ReadonlySet<number>>(new Set([1])),
      tips: [tip(1)],
    });
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value).toBeUndefined();
  });

  test("a second tip waits until the one on screen is closed", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const { closeTip, showingTip } = useWorldTips({
      events,
      shownTipIds: shallowRef<ReadonlySet<number>>(new Set()),
      tips: [tip(1), tip(2)],
    });
    events.emit("finishQuest", quest(QUEST_ID), PROGRESS, PROGRESS);
    expect(showingTip.value).toStrictEqual(tip(1));
    closeTip();
    expect(showingTip.value).toStrictEqual(tip(2));
    closeTip();
    expect(showingTip.value).toBeUndefined();
  });
});
