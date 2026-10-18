import type { Quest } from "#src/models/quest/Quest";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { getQuestTargetId } from "#src/services/quest/getQuestTargetId";
import { describe, expect, test } from "vitest";

describe(getQuestTargetId, () => {
  // A talk begun on Paimon, then one begun on no one, then a place, then a plot, a scene and a wait, whose targets are the
  // World's state and not a place
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "0",
    kind: QuestKind.Archon,
    mainId: "0",
    offerTalkIds: [],
    parentQuestIds: [],
    rewards: [],
    steps: [
      { id: "0", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["talk"] }], textId: "0" },
      { id: "1", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["lone-talk"] }], textId: "1" },
      { id: "2", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetIds: ["place"] }], textId: "2" },
      { id: "3", objectives: [{ count: 1, kind: QuestObjectiveKind.Plot, targetIds: ["place"] }], textId: "3" },
      { id: "4", objectives: [{ count: 1, kind: QuestObjectiveKind.Scene, targetIds: ["place"] }], textId: "4" },
      { id: "5", objectives: [{ count: 1, kind: QuestObjectiveKind.Wait, targetIds: ["place"] }], textId: "5" },
      {
        id: "6",
        objectives: [
          { count: 1, kind: QuestObjectiveKind.Plot, targetIds: ["place"] },
          { count: 1, kind: QuestObjectiveKind.GoTo, targetIds: ["other-place"] },
        ],
        textId: "6",
      },
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
      getQuestTargetId(quest, { objectiveCounts: [], stepIndex: 7 }),
    ]).toStrictEqual(["place", ""]);
  });

  test("state step has no place", () => {
    expect.hasAssertions();

    expect([3, 4, 5].map((stepIndex) => getQuestTargetId(quest, { objectiveCounts: [], stepIndex }))).toStrictEqual([
      "",
      "",
      "",
    ]);
  });

  test("state step beside a place sends the player to the place", () => {
    expect.hasAssertions();

    expect(getQuestTargetId(quest, { objectiveCounts: [], stepIndex: 6 })).toBe("other-place");
  });
});
