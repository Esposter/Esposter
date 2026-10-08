import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { QuestObjectiveKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(readQuestSteps, () => {
  // A quest's file as the dump scrambles it: its sub quests under one name, each holding its id, its order, its words'
  // Hash and its finish conditions under names of their own, and a fail condition only one of them has
  const QUEST_ID = 1;
  const TEXT_HASH = 1000;
  const checkIsText = (hash: number) => hash === TEXT_HASH;

  test("reads the shown steps in their order, each with its first condition that asks something", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        {
          B: 101,
          C: 2,
          D: TEXT_HASH,
          E: [{ F: "QUEST_CONTENT_OBTAIN_ITEM", G: [0, 3] }],
          H: [{ F: "QUEST_CONTENT_TEAM_DEAD", G: [0, 0] }],
        },
        { B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_COMPLETE_TALK", G: [0, 0] }] },
        { B: 102, C: 3, E: [{ F: "QUEST_CONTENT_TRIGGER_FIRE", G: [0, 0] }] },
      ],
    };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: [],
      steps: [
        {
          id: "100",
          objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "0" }],
          textId: String(TEXT_HASH),
        },
        {
          id: "101",
          objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "0" }],
          textId: String(TEXT_HASH),
        },
      ],
    });
  });

  test("notes a shown step whose conditions ask nothing of the Traveler", () => {
    expect.hasAssertions();

    const questBinary = { A: [{ B: 100, C: 1, D: TEXT_HASH, E: [{ F: "QUEST_CONTENT_FINISH_PLOT", G: [0, 0] }] }] };

    expect(readQuestSteps(questBinary, QUEST_ID, checkIsText)).toStrictEqual({
      notes: ["1's step 100 asks nothing of the Traveler its conditions name"],
      steps: [],
    });
  });
});
