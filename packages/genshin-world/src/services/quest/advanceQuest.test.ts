import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { checkIsQuestFinished } from "#src/services/quest/checkIsQuestFinished";
import { describe, expect, test } from "vitest";

describe(advanceQuest, () => {
  // A step asking for a talk and two of an item, then a step asking to reach a place
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "id",
    kind: QuestKind.World,
    mainId: "id",
    offerTalkIds: [],
    parentQuestIds: [],
    rewards: [],
    steps: [
      {
        id: "0",
        objectives: [
          { count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["0"] },
          { count: 2, kind: QuestObjectiveKind.Collect, targetIds: ["0"] },
        ],
        textId: "textId",
      },
      { id: "1", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetIds: ["0"] }], textId: "textId" },
    ],
    talks: [],
    titleTextId: "titleTextId",
  };

  test("meets a collect objective of any of its targets, and moves on once its count is met by them", () => {
    expect.hasAssertions();

    const anyOfQuest: Quest = {
      ...quest,
      steps: [
        {
          id: "0",
          objectives: [{ count: 2, kind: QuestObjectiveKind.Collect, targetIds: ["1", "2"] }],
          textId: "textId",
        },
      ],
    };
    const counted = advanceQuest(
      anyOfQuest,
      { objectiveCounts: [], stepIndex: 0 },
      { kind: QuestObjectiveKind.Collect, targetId: "2" },
    );

    expect(counted).toStrictEqual({ objectiveCounts: [1], stepIndex: 0 });
    expect(advanceQuest(anyOfQuest, counted, { kind: QuestObjectiveKind.Collect, targetId: "1" })).toStrictEqual({
      objectiveCounts: [],
      stepIndex: 1,
    });
  });

  test("meets the objective an event names", () => {
    expect.hasAssertions();

    expect(
      advanceQuest(quest, { objectiveCounts: [], stepIndex: 0 }, { kind: QuestObjectiveKind.Collect, targetId: "0" }),
    ).toStrictEqual({ objectiveCounts: [0, 1], stepIndex: 0 });
  });

  test("meets an objective through any of its alternative targets", () => {
    expect.hasAssertions();

    const groupQuest: Quest = {
      ...quest,
      steps: [
        {
          id: "0",
          objectives: [{ count: 2, kind: QuestObjectiveKind.Collect, targetIds: ["0", "1"] }],
          textId: "textId",
        },
      ],
    };

    expect(
      advanceQuest(
        groupQuest,
        { objectiveCounts: [], stepIndex: 0 },
        { kind: QuestObjectiveKind.Collect, targetId: "1" },
      ),
    ).toStrictEqual({ objectiveCounts: [1], stepIndex: 0 });
  });

  test("leaves the quest where it was for an event no objective names", () => {
    expect.hasAssertions();

    expect(
      advanceQuest(
        quest,
        { objectiveCounts: [0, 1], stepIndex: 0 },
        { kind: QuestObjectiveKind.Collect, targetId: "-1" },
      ),
    ).toStrictEqual({ objectiveCounts: [0, 1], stepIndex: 0 });
  });

  test("holds an objective at its count", () => {
    expect.hasAssertions();

    expect(
      advanceQuest(
        quest,
        { objectiveCounts: [0, 2], stepIndex: 0 },
        { kind: QuestObjectiveKind.Collect, targetId: "0" },
      ),
    ).toStrictEqual({ objectiveCounts: [0, 2], stepIndex: 0 });
  });

  test("moves on once every objective of the step is done", () => {
    expect.hasAssertions();

    expect(
      advanceQuest(
        quest,
        { objectiveCounts: [0, 2], stepIndex: 0 },
        { kind: QuestObjectiveKind.TalkTo, targetId: "0" },
      ),
    ).toStrictEqual({ objectiveCounts: [], stepIndex: 1 });
  });

  test("finishes the quest after its last step", () => {
    expect.hasAssertions();

    expect(
      advanceQuest(quest, { objectiveCounts: [], stepIndex: 1 }, { kind: QuestObjectiveKind.GoTo, targetId: "0" }),
    ).toStrictEqual({ objectiveCounts: [], stepIndex: 2 });
  });

  test("leaves a finished quest finished", () => {
    expect.hasAssertions();

    expect(
      advanceQuest(quest, { objectiveCounts: [], stepIndex: 2 }, { kind: QuestObjectiveKind.GoTo, targetId: "0" }),
    ).toStrictEqual({ objectiveCounts: [], stepIndex: 2 });
  });
});

describe("the carried introduction, Come Try Genius Invokation TCG", () => {
  // Its twelve steps the world carries, in the order the quest asks them: the talks it asks, and the card game's wins at the
  // Games its conditions name. Its plots, scenes, guide and time ticks are left out, and so are the steps with no words, step 18
  // among them, whose wins the world does not carry
  const introduction: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "70665",
    kind: QuestKind.World,
    mainId: "70665",
    offerTalkIds: [],
    parentQuestIds: [],
    rewards: [],
    steps: [
      {
        id: "7066501",
        objectives: [
          { count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066501"] },
          { count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066534"] },
        ],
        textId: "textId",
      },
      {
        id: "7066503",
        objectives: [
          { count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066504"] },
          { count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066505"] },
        ],
        textId: "textId",
      },
      {
        id: "7066507",
        objectives: [{ count: 1, kind: QuestObjectiveKind.Win, targetIds: ["30111"] }],
        textId: "textId",
      },
      {
        id: "7066508",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066516"] }],
        textId: "textId",
      },
      {
        id: "7066509",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066518"] }],
        textId: "textId",
      },
      {
        id: "7066510",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066521"] }],
        textId: "textId",
      },
      {
        id: "7066511",
        objectives: [{ count: 1, kind: QuestObjectiveKind.Win, targetIds: ["11001"] }],
        textId: "textId",
      },
      {
        id: "7066512",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066525"] }],
        textId: "textId",
      },
      {
        id: "7066514",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066526"] }],
        textId: "textId",
      },
      {
        id: "7066516",
        objectives: [{ count: 1, kind: QuestObjectiveKind.Win, targetIds: ["30112"] }],
        textId: "textId",
      },
      {
        id: "7066517",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066531"] }],
        textId: "textId",
      },
      {
        id: "7066518",
        objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["7066532"] }],
        textId: "textId",
      },
    ],
    talks: [],
    titleTextId: "titleTextId",
  };

  test("finishes when its last carried step does, and not a step before it", () => {
    expect.hasAssertions();

    let progress: QuestProgress = { objectiveCounts: [], stepIndex: 0 };
    for (const [index, step] of introduction.steps.entries()) {
      for (const {
        count,
        kind,
        targetIds: [targetId = ""],
      } of step.objectives)
        for (let met = 0; met < count; met++) progress = advanceQuest(introduction, progress, { kind, targetId });
      expect(progress.stepIndex).toBe(index + 1);
      expect(checkIsQuestFinished(introduction, progress)).toBe(index === introduction.steps.length - 1);
    }
  });
});
