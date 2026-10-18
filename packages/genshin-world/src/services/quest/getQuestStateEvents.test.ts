import type { Quest } from "#src/models/quest/Quest";
import type { QuestObjective } from "#src/models/quest/QuestObjective";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { formatQuestWaitTargetId } from "#src/services/quest/formatQuestWaitTargetId";
import { getQuestStateEvents } from "#src/services/quest/getQuestStateEvents";
import { getQuestStepKey } from "#src/services/quest/getQuestStepKey";
import { MINUTES_PER_HOUR } from "genshin-engine";
import { describe, expect, test } from "vitest";

// A quest whose first step asks the objectives it is given, then a step asking for a talk
const createQuest = (objectives: QuestObjective[]): Quest => ({
  descriptionTextId: "descriptionTextId",
  id: "id",
  kind: QuestKind.World,
  mainId: "id",
  offerTalkIds: [],
  parentQuestIds: [],
  rewards: [],
  steps: [
    { id: "0", objectives, textId: "textId" },
    { id: "1", objectives: [{ count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["talk"] }], textId: "textId" },
  ],
  talks: [{ id: "talk", lines: [], npcIds: [], startLineId: "0" }],
  titleTextId: "titleTextId",
});

describe(getQuestStateEvents, () => {
  const progress: QuestProgress = { objectiveCounts: [], stepIndex: 0 };
  const state = { days: 0, minutes: 0, sceneId: "" };

  test("plot ended at once", () => {
    expect.hasAssertions();

    const quest = createQuest([{ count: 1, kind: QuestObjectiveKind.Plot, targetIds: ["plot"] }]);
    const questEvents = getQuestStateEvents([quest], new Map([[quest.id, progress]]), state, new Map());

    expect(questEvents).toStrictEqual([{ kind: QuestObjectiveKind.Plot, targetId: "plot" }]);
    expect(
      questEvents.reduce((questProgress, questEvent) => advanceQuest(quest, questProgress, questEvent), progress),
    ).toStrictEqual({ objectiveCounts: [], stepIndex: 1 });
  });

  test("scene the player is in", () => {
    expect.hasAssertions();

    const quest = createQuest([{ count: 1, kind: QuestObjectiveKind.Scene, targetIds: ["1", "2"] }]);

    expect(
      getQuestStateEvents([quest], new Map([[quest.id, progress]]), { ...state, sceneId: "2" }, new Map()),
    ).toStrictEqual([{ kind: QuestObjectiveKind.Scene, targetId: "2" }]);
  });

  test("scene the world has not built", () => {
    expect.hasAssertions();

    const quest = createQuest([{ count: 1, kind: QuestObjectiveKind.Scene, targetIds: ["1"] }]);
    const questProgressMap = new Map([[quest.id, progress]]);

    expect([
      getQuestStateEvents([quest], questProgressMap, { ...state, sceneId: "2" }, new Map()),
      getQuestStateEvents([quest], questProgressMap, state, new Map()),
    ]).toStrictEqual([[], []]);
  });

  test("skipped day counted", () => {
    expect.hasAssertions();

    const targetId = formatQuestWaitTargetId({ days: 2, fromHour: 0, toHour: 24 });
    const quest = createQuest([{ count: 1, kind: QuestObjectiveKind.Wait, targetIds: [targetId] }]);
    const questProgressMap = new Map([[quest.id, progress]]);
    const stepStartDays = new Map([[getQuestStepKey(quest.id, 0), 1]]);

    expect([
      getQuestStateEvents([quest], questProgressMap, { ...state, days: 2 }, stepStartDays),
      getQuestStateEvents([quest], questProgressMap, { ...state, days: 3 }, stepStartDays),
    ]).toStrictEqual([[], [{ kind: QuestObjectiveKind.Wait, targetId }]]);
  });

  test("alternative window met", () => {
    expect.hasAssertions();

    const morningTargetId = formatQuestWaitTargetId({ days: 0, fromHour: 6, toHour: 9 });
    const eveningTargetId = formatQuestWaitTargetId({ days: 0, fromHour: 18, toHour: 24 });
    const quest = createQuest([
      { count: 1, kind: QuestObjectiveKind.Wait, targetIds: [morningTargetId, eveningTargetId] },
    ]);

    expect(
      getQuestStateEvents(
        [quest],
        new Map([[quest.id, progress]]),
        { ...state, minutes: 20 * MINUTES_PER_HOUR },
        new Map(),
      ),
    ).toStrictEqual([{ kind: QuestObjectiveKind.Wait, targetId: eveningTargetId }]);
  });

  test("objective already met", () => {
    expect.hasAssertions();

    const quest = createQuest([
      { count: 1, kind: QuestObjectiveKind.Plot, targetIds: ["plot"] },
      { count: 1, kind: QuestObjectiveKind.TalkTo, targetIds: ["talk"] },
    ]);

    expect(
      getQuestStateEvents([quest], new Map([[quest.id, { objectiveCounts: [1, 0], stepIndex: 0 }]]), state, new Map()),
    ).toStrictEqual([]);
  });

  test("quest not in progress", () => {
    expect.hasAssertions();

    const quest = createQuest([{ count: 1, kind: QuestObjectiveKind.Plot, targetIds: ["plot"] }]);

    expect([
      getQuestStateEvents([quest], new Map(), state, new Map()),
      getQuestStateEvents([quest], new Map([[quest.id, { objectiveCounts: [], stepIndex: 2 }]]), state, new Map()),
    ]).toStrictEqual([[], []]);
  });
});
