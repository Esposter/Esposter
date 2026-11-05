import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { createQuestCommand } from "#src/services/dev/commands/createQuestCommand";
import { createMainQuest } from "#src/store/quests.fixture";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(createQuestCommand, () => {
  const fixture = createMainQuest(7);
  const step = takeOne(fixture.steps, 0);
  const quest: Quest = { ...fixture, steps: [step, step, step] };
  const UNKNOWN_QUEST_ID = "-1";

  test("A quest read answers the step its progress is on", () => {
    expect.hasAssertions();

    const readQuest = (questProgressMap: ReadonlyMap<string, QuestProgress>) =>
      createQuestCommand({ getQuestProgressMap: () => questProgressMap, getQuests: () => [quest] }).run({
        id: quest.id,
      });

    expect({
      finished: readQuest(new Map([[quest.id, { objectiveCounts: [], stepIndex: quest.steps.length }]])),
      notStarted: readQuest(new Map<string, QuestProgress>()),
      secondOfThree: readQuest(new Map([[quest.id, { objectiveCounts: [], stepIndex: 1 }]])),
    }).toStrictEqual({
      finished: { ok: true, value: "finished" },
      notStarted: { ok: true, value: "not started" },
      secondOfThree: { ok: true, value: "step 2 of 3" },
    });
  });

  test("A quest read refuses a quest the world does not carry", () => {
    expect.hasAssertions();

    const result = createQuestCommand({
      getQuestProgressMap: () => new Map<string, QuestProgress>(),
      getQuests: () => [],
    }).run({ id: UNKNOWN_QUEST_ID });

    expect(result).toStrictEqual({ error: "unknown quest -1", ok: false });
  });
});
