import { readReputationRequestQuest } from "#src/services/genshinText/readReputationRequestQuest";
import { QuestKind, QuestObjectiveKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(readReputationRequestQuest, () => {
  test("a delivery request is one collect step of the items it asks for, under its main quest's title", () => {
    expect.hasAssertions();

    expect(
      readReputationRequestQuest({
        giving: {
          exactItems: [
            { count: 3, id: 9001 },
            { count: 0, id: 0 },
          ],
          id: 900101,
        },
        groupItemIds: [],
        mainQuest: { chapterId: 0, descTextMapHash: 2, id: 9001, titleTextMapHash: 1 },
        rewards: [],
        subQuest: { mainId: 9001, stepDescTextMapHash: 3, subId: 900101 },
      }),
    ).toStrictEqual({
      descriptionTextId: "2",
      id: "900101",
      kind: QuestKind.World,
      mainId: "9001",
      offerTalkIds: [],
      parentQuestIds: [],
      rewards: [],
      steps: [
        { id: "900101", objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "9001" }], textId: "3" },
      ],
      talks: [],
      titleTextId: "1",
    });
  });

  test("a delivery request whose dump leaves its group count at zero is an exact delivery", () => {
    expect.hasAssertions();

    expect(
      readReputationRequestQuest({
        giving: { exactItems: [{ count: 3, id: 9001 }], givingGroupCount: 0, givingGroupIds: [], id: 900101 },
        groupItemIds: [],
        mainQuest: { chapterId: 0, descTextMapHash: 2, id: 9001, titleTextMapHash: 1 },
        rewards: [],
        subQuest: { mainId: 9001, stepDescTextMapHash: 3, subId: 900101 },
      }).steps,
    ).toStrictEqual([
      { id: "900101", objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "9001" }], textId: "3" },
    ]);
  });

  test("a group delivery request is one collect step of any one of the items its group names", () => {
    expect.hasAssertions();

    expect(
      readReputationRequestQuest({
        giving: { exactItems: [{ count: 0, id: 0 }], givingGroupCount: 2, givingGroupIds: [9002], id: 900201 },
        groupItemIds: [9101, 9102],
        mainQuest: { chapterId: 0, descTextMapHash: 2, id: 9002, titleTextMapHash: 1 },
        rewards: [],
        subQuest: { mainId: 9002, stepDescTextMapHash: 3, subId: 900201 },
      }).steps,
    ).toStrictEqual([
      {
        id: "900201",
        objectives: [{ alternativeTargetIds: ["9102"], count: 2, kind: QuestObjectiveKind.Collect, targetId: "9101" }],
        textId: "3",
      },
    ]);
  });
});
