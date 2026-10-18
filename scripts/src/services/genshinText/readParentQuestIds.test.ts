import { readParentQuestIds } from "#src/services/genshinText/readParentQuestIds";
import { describe, expect, test } from "vitest";

describe(readParentQuestIds, () => {
  // A quest's file as the dump scrambles it: its sub quests under one name, each holding its accept conditions under a name
  // Of their own, and each sub quest's world quest in the sub quest table
  const QUEST_ID = 1000;
  const PARENT_QUEST_ID = 2000;
  const subQuestMap = new Map([
    [1001, { mainId: QUEST_ID }],
    [2001, { mainId: PARENT_QUEST_ID }],
  ]);
  const finishedCondition = { param: ["2001", "3"], type: "QUEST_COND_STATE_EQUAL" };

  test("reads the parent quest a sub quest's accept condition finished, once", () => {
    expect.hasAssertions();

    const questBinary = { A: [{ B: [finishedCondition, finishedCondition] }] };

    expect(readParentQuestIds(questBinary, QUEST_ID, subQuestMap)).toStrictEqual([PARENT_QUEST_ID]);
  });

  test("reads no parent for a condition on the quest's own sub quest, or one that asks a state but finished", () => {
    expect.hasAssertions();

    const questBinary = {
      A: [
        { B: [{ param: ["1001", "2"], type: "QUEST_COND_STATE_EQUAL" }] },
        { B: [{ param: ["2001", "2"], type: "QUEST_COND_STATE_EQUAL" }] },
      ],
    };

    expect(readParentQuestIds(questBinary, QUEST_ID, subQuestMap)).toStrictEqual([]);
  });
});
