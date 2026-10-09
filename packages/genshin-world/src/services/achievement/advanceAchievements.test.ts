import type { Achievement } from "#src/models/achievement/Achievement";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { advanceAchievements } from "#src/services/achievement/advanceAchievements";
import { describe, expect, test } from "vitest";

describe(advanceAchievements, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const PRIMOGEMS = 5;
  const FIRST_QUEST_ID = "7010232";
  const SECOND_QUEST_ID = "7519704";
  const COUNTED_ID = 1;
  const TIER_ID = 2;
  // An OR trigger over two quests that counts both finishing, the second achievement the tier after it
  const counted: Achievement = {
    categoryId: 1,
    descriptionTextId: "",
    id: COUNTED_ID,
    isHidden: false,
    orderId: 1,
    preStageAchievementId: 0,
    primogems: PRIMOGEMS,
    progress: 2,
    titleTextId: "",
    trigger: { parameters: [FIRST_QUEST_ID, SECOND_QUEST_ID], type: "TRIGGER_FINISH_QUEST_OR" },
  };
  const tier: Achievement = {
    ...counted,
    id: TIER_ID,
    preStageAchievementId: COUNTED_ID,
    primogems: 0,
    progress: 1,
    trigger: { parameters: [SECOND_QUEST_ID], type: "TRIGGER_FINISH_QUEST_AND" },
  };

  test("should count a quest its trigger names once more, and pay the Primogems once the count is reached", () => {
    expect.hasAssertions();
    const firstAdvance = advanceAchievements(
      [counted],
      new Map(),
      { kind: AchievementEventKind.QuestFinished, targetId: FIRST_QUEST_ID },
      EPOCH,
    );
    expect(firstAdvance).toStrictEqual({ primogems: 0, progressMap: new Map([[COUNTED_ID, { count: 1 }]]) });
    const secondAdvance = advanceAchievements(
      [counted],
      firstAdvance.progressMap,
      { kind: AchievementEventKind.QuestFinished, targetId: SECOND_QUEST_ID },
      EPOCH,
    );
    expect(secondAdvance).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 2, finishedAt: EPOCH }]]),
    });
  });

  test("should leave an achievement alone for an event of another kind, a quest it does not name, or a trigger not watched", () => {
    expect.hasAssertions();
    const unwatched: Achievement = { ...counted, trigger: { parameters: [FIRST_QUEST_ID], type: "TRIGGER_TALK_NUM" } };
    expect(
      advanceAchievements(
        [counted, unwatched],
        new Map(),
        { kind: AchievementEventKind.ParentQuestFinished, targetId: FIRST_QUEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
    expect(
      advanceAchievements([counted], new Map(), { kind: AchievementEventKind.QuestFinished, targetId: "1" }, EPOCH),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
    expect(
      advanceAchievements(
        [unwatched],
        new Map(),
        { kind: AchievementEventKind.QuestFinished, targetId: FIRST_QUEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
  });

  test("should hold an achievement until the tier before it is done", () => {
    expect.hasAssertions();
    const secondQuestEvent = { kind: AchievementEventKind.QuestFinished, targetId: SECOND_QUEST_ID };
    const held = advanceAchievements([counted, tier], new Map(), secondQuestEvent, EPOCH);
    expect(held.progressMap).toStrictEqual(new Map([[COUNTED_ID, { count: 1 }]]));
    const tierFinishing = advanceAchievements(
      [counted, tier],
      held.progressMap,
      { kind: AchievementEventKind.QuestFinished, targetId: FIRST_QUEST_ID },
      EPOCH,
    );
    const tiered = advanceAchievements([counted, tier], tierFinishing.progressMap, secondQuestEvent, EPOCH);
    expect(tiered.progressMap.get(TIER_ID)).toStrictEqual({ count: 1, finishedAt: EPOCH });
  });
});
