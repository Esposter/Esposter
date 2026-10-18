import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { getQuestStepKey } from "#src/services/quest/getQuestStepKey";
import { getQuestStepStartDays } from "#src/services/quest/getQuestStepStartDays";
import { describe, expect, test } from "vitest";

describe(getQuestStepStartDays, () => {
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "id",
    kind: QuestKind.World,
    mainId: "id",
    offerTalkIds: [],
    parentQuestIds: [],
    rewards: [],
    steps: [0, 1, 2].map((index) => ({
      id: String(index),
      objectives: [{ count: 1, kind: QuestObjectiveKind.Wait, targetIds: ["0"] }],
      textId: "textId",
    })),
    talks: [],
    titleTextId: "titleTextId",
  };

  test("a step first seen begins on the day it is seen", () => {
    expect.hasAssertions();

    const questProgressMap = new Map<string, QuestProgress>([[quest.id, { objectiveCounts: [], stepIndex: 1 }]]);

    expect(getQuestStepStartDays([quest], questProgressMap, 3, new Map())).toStrictEqual(
      new Map([[getQuestStepKey(quest.id, 1), 3]]),
    );
  });

  test("a step already seen keeps the day it began", () => {
    expect.hasAssertions();

    const questProgressMap = new Map<string, QuestProgress>([[quest.id, { objectiveCounts: [], stepIndex: 1 }]]);
    const stepStartDays = new Map([[getQuestStepKey(quest.id, 1), 0]]);

    expect(getQuestStepStartDays([quest], questProgressMap, 3, stepStartDays)).toStrictEqual(stepStartDays);
  });

  test("a step the quest has moved past is forgotten", () => {
    expect.hasAssertions();

    const questProgressMap = new Map<string, QuestProgress>([[quest.id, { objectiveCounts: [], stepIndex: 2 }]]);
    const stepStartDays = new Map([[getQuestStepKey(quest.id, 1), 0]]);

    expect(getQuestStepStartDays([quest], questProgressMap, 3, stepStartDays)).toStrictEqual(
      new Map([[getQuestStepKey(quest.id, 2), 3]]),
    );
  });

  test("a finished quest holds no step", () => {
    expect.hasAssertions();

    const questProgressMap = new Map<string, QuestProgress>([[quest.id, { objectiveCounts: [], stepIndex: 3 }]]);

    expect(getQuestStepStartDays([quest], questProgressMap, 3, new Map())).toStrictEqual(new Map());
  });
});
