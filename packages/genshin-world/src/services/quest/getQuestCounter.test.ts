import type { QuestStep } from "#src/models/quest/QuestStep";

import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { getQuestCounter } from "#src/services/quest/getQuestCounter";
import { describe, expect, test } from "vitest";

describe(getQuestCounter, () => {
  // A talk, then two of an item
  const step: QuestStep = {
    id: "0",
    objectives: [
      { count: 1, kind: QuestObjectiveKind.TalkTo, targetId: "0" },
      { count: 2, kind: QuestObjectiveKind.Collect, targetId: "0" },
    ],
    textId: "textId",
  };

  test("counts the first objective counted past one, none met before the first", () => {
    expect.hasAssertions();

    expect([getQuestCounter(step, [1, 1]), getQuestCounter(step, [])]).toStrictEqual(["(1/2)", "(0/2)"]);
  });

  test("shows nothing for a step with no objective counted past one", () => {
    expect.hasAssertions();

    expect(getQuestCounter({ ...step, objectives: step.objectives.slice(0, 1) }, [0])).toBe("");
  });
});
