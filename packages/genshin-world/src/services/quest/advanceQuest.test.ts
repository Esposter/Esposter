import type { Quest } from "#src/models/quest/Quest";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { describe, expect, test } from "vitest";

describe(advanceQuest, () => {
  // A step asking for a talk and two of an item, then a step asking to reach a place
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "id",
    kind: QuestKind.World,
    steps: [
      {
        id: "0",
        objectives: [
          { count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "0" },
          { count: 2, kind: QuestObjectiveKind.Collect, targetId: "0" },
        ],
        textId: "textId",
      },
      { id: "1", objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "0" }], textId: "textId" },
    ],
    talks: [],
    titleTextId: "titleTextId",
  };

  test("meets the objective an event names", () => {
    expect.hasAssertions();

    expect(
      advanceQuest(quest, { objectiveCounts: [], stepIndex: 0 }, { kind: QuestObjectiveKind.Collect, targetId: "0" }),
    ).toStrictEqual({ objectiveCounts: [0, 1], stepIndex: 0 });
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
