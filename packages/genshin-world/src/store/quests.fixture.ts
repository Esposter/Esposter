import type { Quest } from "#src/models/quest/Quest";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { useWorldQuestsStore } from "#src/store/quests";

// A main quest of one step, which its progress finishes by standing past that step
const createMainQuest = (id: number): Quest => ({
  descriptionTextId: "1",
  id: String(id),
  kind: QuestKind.World,
  mainId: String(id),
  offerTalkIds: [],
  parentQuestIds: [],
  rewards: [],
  steps: [{ id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetIds: ["0"] }], textId: "1" }],
  talks: [],
  titleTextId: "1",
});

// A quest whose one step asks to interact with a scene point, by that point's id, which also names the quest
export const createInteractQuest = (pointId: number): Quest => ({
  ...createMainQuest(pointId),
  steps: [
    {
      id: "0",
      objectives: [{ count: 1, kind: QuestObjectiveKind.Interact, targetIds: [String(pointId)] }],
      textId: "1",
    },
  ],
});

// The quests store holding exactly these main quests as finished, for a suite that tests a feature reading them. Called
// Again, it replaces them, as a quest finishing in the world adds one
export const finishTestMainQuests = (...ids: number[]) => {
  const worldQuestsStore = useWorldQuestsStore();
  worldQuestsStore.quests = ids.map((id) => createMainQuest(id));
  worldQuestsStore.questProgressMap = new Map(ids.map((id) => [String(id), { objectiveCounts: [], stepIndex: 1 }]));
  return worldQuestsStore;
};
