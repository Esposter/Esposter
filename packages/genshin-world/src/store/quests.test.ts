import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { useWorldQuestsStore } from "#src/store/quests";
import { createMainQuest } from "#src/store/quests.fixture";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";

describe(useWorldQuestsStore, () => {
  // A main quest of one step that asks for a place to be reached
  const QUEST = createMainQuest(7);

  const setUpQuests = () => {
    const worldSessionStore = startTestWorldSession();
    const worldQuestsStore = useWorldQuestsStore();
    worldQuestsStore.quests = [QUEST];
    worldQuestsStore.questProgressMap = new Map([[QUEST.id, { objectiveCounts: [], stepIndex: 0 }]]);
    return { worldQuestsStore, worldSessionStore };
  };

  test("a quest event that meets the last objective finishes the quest and says so once", () => {
    expect.hasAssertions();

    const { worldQuestsStore, worldSessionStore } = setUpQuests();
    const onFinishQuest = vi.fn<() => void>();
    worldSessionStore.events.on("finishQuest", onFinishQuest);
    worldQuestsStore.doQuestEvent({ kind: QuestObjectiveKind.GoTo, targetId: "0" });

    expect({
      finishedMainQuestIds: [...worldQuestsStore.finishedMainQuestIds],
      finishQuestCalls: onFinishQuest.mock.calls.length,
      questsInProgress: worldQuestsStore.questsInProgress,
    }).toStrictEqual({ finishedMainQuestIds: [7], finishQuestCalls: 1, questsInProgress: [] });
  });

  test("a quest event for another target leaves the quest in progress", () => {
    expect.hasAssertions();

    const { worldQuestsStore } = setUpQuests();
    worldQuestsStore.doQuestEvent({ kind: QuestObjectiveKind.GoTo, targetId: "1" });

    expect({
      finishedMainQuestIds: [...worldQuestsStore.finishedMainQuestIds],
      questsInProgress: worldQuestsStore.questsInProgress,
    }).toStrictEqual({ finishedMainQuestIds: [], questsInProgress: [QUEST] });
  });

  test("stopping the store forgets the quests", () => {
    expect.hasAssertions();

    const { worldQuestsStore } = setUpQuests();
    worldQuestsStore.stop();

    expect({ progress: worldQuestsStore.questProgressMap.size, quests: worldQuestsStore.quests }).toStrictEqual({
      progress: 0,
      quests: [],
    });
  });
});
