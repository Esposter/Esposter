import type { Quest } from "#src/models/quest/Quest";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
import { describe, expect, test } from "vitest";

describe(getQuestTargetId, () => {
  // A talk begun on Paimon, then one begun on no one, then a place
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "0",
    kind: QuestKind.Archon,
    mainId: "0",
    offerTalkIds: [],
    rewards: [],
    steps: [
      { id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "talk" }], textId: "0" },
      { id: "1", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "lone-talk" }], textId: "1" },
      { id: "2", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "place" }], textId: "2" },
    ],
    talks: [
      { id: "talk", lines: [], npcIds: ["paimon", "amber"], startLineId: "0" },
      { id: "lone-talk", lines: [], npcIds: [], startLineId: "0" },
    ],
    titleTextId: "titleTextId",
  };

  test("sends a talk to the first character it begins on, and one begun on no one to itself", () => {
    expect.hasAssertions();

    expect([getQuestTargetId(quest), getQuestTargetId(quest, { objectiveCounts: [], stepIndex: 1 })]).toStrictEqual([
      "paimon",
      "lone-talk",
    ]);
  });

  test("sends any other objective to its target, and a quest past its last step nowhere", () => {
    expect.hasAssertions();

    expect([
      getQuestTargetId(quest, { objectiveCounts: [], stepIndex: 2 }),
      getQuestTargetId(quest, { objectiveCounts: [], stepIndex: 3 }),
    ]).toStrictEqual(["place", ""]);
  });
});
