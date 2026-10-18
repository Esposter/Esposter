import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { computeQuestStepTargets } from "#src/services/quest/computeQuestStepTargets";
import { describe, expect, test } from "vitest";

describe(computeQuestStepTargets, () => {
  // A quest of two steps, the first naming target 9 and the second target 7
  const quest: Quest = {
    descriptionTextId: "",
    id: "quest",
    kind: QuestKind.World,
    offerTalkIds: [],
    steps: [
      { id: "first", objectives: [{ count: 1, kind: QuestObjectiveKind.Interact, targetId: "9" }], textId: "first" },
      { id: "second", objectives: [{ count: 1, kind: QuestObjectiveKind.Interact, targetId: "7" }], textId: "second" },
    ],
    talks: [],
    titleTextId: "",
  };

  test("a quest in progress has reached the steps up to and including its current one", () => {
    expect.hasAssertions();

    const progress: QuestProgress = { objectiveCounts: [], stepIndex: 0 };

    expect(computeQuestStepTargets([quest], new Map([[quest.id, progress]]))).toStrictEqual({
      named: new Set(["7", "9"]),
      reached: new Set(["9"]),
    });
  });

  test("a finished quest has reached every step", () => {
    expect.hasAssertions();

    const progress: QuestProgress = { objectiveCounts: [], stepIndex: quest.steps.length };

    expect(computeQuestStepTargets([quest], new Map([[quest.id, progress]]))).toStrictEqual({
      named: new Set(["7", "9"]),
      reached: new Set(["7", "9"]),
    });
  });

  test("a quest not started has reached no step", () => {
    expect.hasAssertions();

    expect(computeQuestStepTargets([quest], new Map())).toStrictEqual({
      named: new Set(["7", "9"]),
      reached: new Set(),
    });
  });
});
