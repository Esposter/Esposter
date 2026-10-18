import { readReputationRequestQuest } from "#src/services/genshinText/readReputationRequestQuest";
import { QuestKind, QuestObjectiveKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(readReputationRequestQuest, () => {
  test("a delivery request is one collect step of the items it asks for, under its main quest's title", () => {
    expect.hasAssertions();

    expect(
      readReputationRequestQuest({
        giving: { exactItems: [{ count: 3, id: 9001 }, {}], id: 900101 },
        mainQuest: { descTextMapHash: 2, id: 9001, titleTextMapHash: 1 },
        subQuest: { mainId: 9001, stepDescTextMapHash: 3, subId: 900101 },
      }),
    ).toStrictEqual({
      descriptionTextId: "2",
      id: "900101",
      kind: QuestKind.World,
      offerTalkIds: [],
      steps: [
        { id: "900101", objectives: [{ count: 3, kind: QuestObjectiveKind.Collect, targetId: "9001" }], textId: "3" },
      ],
      talks: [],
      titleTextId: "1",
    });
  });
});
