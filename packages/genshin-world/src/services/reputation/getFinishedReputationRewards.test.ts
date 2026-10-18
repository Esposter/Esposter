import type { Quest } from "#src/models/quest/Quest";
import type { ReputationReward } from "#src/models/reputation/ReputationReward";

import { QuestKind } from "#src/models/quest/QuestKind";
import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { advanceQuest } from "#src/services/quest/advanceQuest";
import { getFinishedReputationRewards } from "#src/services/reputation/getFinishedReputationRewards";
import { describe, expect, test } from "vitest";

describe(getFinishedReputationRewards, () => {
  const REWARD: ReputationReward = { exp: 80, items: [{ count: 20_000, id: 202 }] };
  const QUEST_ID = 901;
  const TARGET_ID = "3";
  const BINDINGS = [{ questId: QUEST_ID, reward: REWARD }];
  const createQuest = (kind: QuestObjectiveKind, count: number): Quest => ({
    descriptionTextId: "description",
    id: String(QUEST_ID),
    kind: QuestKind.World,
    offerTalkIds: [],
    steps: [{ id: "1", objectives: [{ count, kind, targetId: TARGET_ID }], textId: "step" }],
    talks: [],
    titleTextId: "title",
  });

  test("a delivery request pays on completion", () => {
    expect.hasAssertions();

    const quest = createQuest(QuestObjectiveKind.Collect, 1);
    const progress = { objectiveCounts: [0], stepIndex: 0 };
    const nextProgress = advanceQuest(quest, progress, { kind: QuestObjectiveKind.Collect, targetId: TARGET_ID });

    expect(getFinishedReputationRewards(quest, progress, nextProgress, BINDINGS)).toStrictEqual([REWARD]);
  });

  test("a finished reputation quest pays once", () => {
    expect.hasAssertions();

    const quest = createQuest(QuestObjectiveKind.Collect, 1);
    const event = { kind: QuestObjectiveKind.Collect, targetId: TARGET_ID };
    const progress = { objectiveCounts: [0], stepIndex: 0 };
    const finished = advanceQuest(quest, progress, event);

    expect(getFinishedReputationRewards(quest, progress, finished, BINDINGS)).toStrictEqual([REWARD]);
    expect(getFinishedReputationRewards(quest, finished, advanceQuest(quest, finished, event), BINDINGS)).toStrictEqual(
      [],
    );
  });

  test("a camp request pays once its camp is cleared", () => {
    expect.hasAssertions();

    const quest = createQuest(QuestObjectiveKind.Defeat, 2);
    const event = { kind: QuestObjectiveKind.Defeat, targetId: TARGET_ID };
    const start = { objectiveCounts: [0], stepIndex: 0 };
    const oneDefeated = advanceQuest(quest, start, event);
    const cleared = advanceQuest(quest, oneDefeated, event);

    expect(getFinishedReputationRewards(quest, start, oneDefeated, BINDINGS)).toStrictEqual([]);
    expect(getFinishedReputationRewards(quest, oneDefeated, cleared, BINDINGS)).toStrictEqual([REWARD]);
    expect(getFinishedReputationRewards(quest, cleared, advanceQuest(quest, cleared, event), BINDINGS)).toStrictEqual(
      [],
    );
  });
});
