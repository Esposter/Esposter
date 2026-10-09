import type { Quest } from "#src/models/quest/Quest";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { getFinishedQuestEvents } from "#src/services/quest/getFinishedQuestEvents";
import { describe, expect, test } from "vitest";

const createStep = (id: string) => ({
  id,
  objectives: [{ count: 1, kind: QuestObjectiveKind.GoTo, targetId: "0" }],
  textId: "textId",
});

describe(getFinishedQuestEvents, () => {
  const quest: Quest = {
    descriptionTextId: "descriptionTextId",
    id: "1",
    kind: QuestKind.Archon,
    steps: [createStep("10"), createStep("11")],
    talks: [],
    titleTextId: "titleTextId",
  };

  test("finishes the sub-quest of each step moved past", () => {
    expect.hasAssertions();

    expect(
      getFinishedQuestEvents(quest, { objectiveCounts: [], stepIndex: 0 }, { objectiveCounts: [], stepIndex: 1 }),
    ).toStrictEqual([{ kind: AchievementEventKind.QuestFinished, targetId: "10" }]);
  });

  test("finishes the main quest once its last step is done, and not again", () => {
    expect.hasAssertions();

    const finished = { objectiveCounts: [], stepIndex: 2 };

    expect(getFinishedQuestEvents(quest, { objectiveCounts: [], stepIndex: 1 }, finished)).toStrictEqual([
      { kind: AchievementEventKind.QuestFinished, targetId: "11" },
      { kind: AchievementEventKind.ParentQuestFinished, targetId: "1" },
    ]);
    expect(getFinishedQuestEvents(quest, finished, finished)).toStrictEqual([]);
  });
});
