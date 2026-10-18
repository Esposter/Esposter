import type { Quest } from "#src/models/quest/Quest";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { useWorldQuestStates } from "#src/composables/useWorldQuestStates";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { assert, describe, expect, onTestFinished, test, vi } from "vitest";
import { effectScope, nextTick, shallowRef } from "vue";

describe(useWorldQuestStates, () => {
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "id",
    kind: QuestKind.World,
    mainId: "id",
    offerTalkIds: [],
    parentQuestIds: [],
    rewards: [],
    steps: [
      { id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.Plot, targetIds: ["plot"] }], textId: "textId" },
      { id: "1", objectives: [{ count: 1, kind: QuestObjectiveKind.Scene, targetIds: ["scene"] }], textId: "textId" },
      { id: "2", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["talk"] }], textId: "textId" },
    ],
    talks: [{ id: "talk", lines: [], npcIds: [], startLineId: "0" }],
    titleTextId: "titleTextId",
  };
  const gameClock = { days: 0, minutes: 0, minutesPerSecond: 0 };

  // The quest world as the session holds it: every event the states raise advances the quest, as doQuestEvent does
  const createQuestWorld = (getSceneId: () => string) => {
    const scope = effectScope();
    onTestFinished(() => {
      scope.stop();
    });
    const events = createWorldEvents();
    const questProgressMap = shallowRef<ReadonlyMap<string, QuestProgress>>(new Map());
    const onQuestEvent = vi.fn<(questEvent: QuestEvent) => void>((questEvent) => {
      const progress = questProgressMap.value.get(quest.id);
      if (progress) questProgressMap.value = new Map([[quest.id, advanceQuest(quest, progress, questEvent)]]);
    });
    events.on("questEvent", onQuestEvent);
    const worldQuestStates = scope.run(() =>
      useWorldQuestStates({
        events,
        getGameClock: () => gameClock,
        getSceneId,
        questProgressMap,
        quests: shallowRef([quest]),
      }),
    );
    assert.exists(worldQuestStates);
    return { ...worldQuestStates, onQuestEvent, questProgressMap };
  };

  test("plot ended at once", async () => {
    expect.hasAssertions();

    const { onQuestEvent, questProgressMap } = createQuestWorld(() => "");
    questProgressMap.value = new Map([[quest.id, { objectiveCounts: [], stepIndex: 0 }]]);
    await nextTick();

    expect(onQuestEvent).toHaveBeenCalledExactlyOnceWith({ kind: QuestObjectiveKind.Plot, targetId: "plot" });
    expect(questProgressMap.value.get(quest.id)).toStrictEqual({ objectiveCounts: [], stepIndex: 1 });
  });

  test("scene the player is in", async () => {
    expect.hasAssertions();

    let sceneId = "";
    const { checkQuestStates, onQuestEvent, questProgressMap } = createQuestWorld(() => sceneId);
    questProgressMap.value = new Map([[quest.id, { objectiveCounts: [], stepIndex: 1 }]]);
    await nextTick();

    expect(onQuestEvent).not.toHaveBeenCalled();

    sceneId = "scene";
    checkQuestStates();
    await nextTick();

    expect(onQuestEvent).toHaveBeenCalledExactlyOnceWith({ kind: QuestObjectiveKind.Scene, targetId: "scene" });
    expect(questProgressMap.value.get(quest.id)).toStrictEqual({ objectiveCounts: [], stepIndex: 2 });
  });
});
