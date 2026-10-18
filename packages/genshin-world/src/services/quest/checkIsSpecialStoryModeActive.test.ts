import { QuestBanType } from "#src/models/quest/QuestBanType";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { checkIsSpecialStoryModeActive } from "#src/services/quest/checkIsSpecialStoryModeActive";
import { describe, expect, test } from "vitest";

const QUEST_ID = "1";
const OBJECTIVE = { count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "1" };

describe("checkIsSpecialStoryModeActive", () => {
  test("a quest on a restricted step is restricted", () => {
    expect.hasAssertions();

    const quests = [
      {
        id: QUEST_ID,
        steps: [
          { id: "1", objectives: [OBJECTIVE], textId: "1" },
          { banType: QuestBanType.BanGroupCommon, id: "2", objectives: [OBJECTIVE], textId: "2" },
        ],
      },
    ];

    expect(checkIsSpecialStoryModeActive(quests, new Map([[QUEST_ID, { objectiveCounts: [0], stepIndex: 1 }]]))).toBe(
      true,
    );
  });

  test("a quest on a step with no restriction is not restricted", () => {
    expect.hasAssertions();

    const quests = [
      {
        id: QUEST_ID,
        steps: [
          { banType: QuestBanType.BanGroupCommon, id: "1", objectives: [OBJECTIVE], textId: "1" },
          { id: "2", objectives: [OBJECTIVE], textId: "2" },
        ],
      },
    ];

    expect(checkIsSpecialStoryModeActive(quests, new Map([[QUEST_ID, { objectiveCounts: [0], stepIndex: 1 }]]))).toBe(
      false,
    );
  });
});
