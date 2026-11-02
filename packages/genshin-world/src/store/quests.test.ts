import type { Quest } from "#src/models/quest/Quest";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { useWorldQuestsStore } from "#src/store/quests";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";

describe(useWorldQuestsStore, () => {
  // A main quest of one step that asks for a place to be reached
  const QUEST: Quest = {
    descriptionTextId: "1",
    id: "7",
    kind: QuestKind.World,
    mainId: "7",
    offerTalkIds: [],
    parentQuestIds: [],
    rewards: [],
    steps: [{ id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetIds: ["0"] }], textId: "1" }],
    talks: [],
    titleTextId: "1",
  };

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
