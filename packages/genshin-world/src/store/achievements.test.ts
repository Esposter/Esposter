import type { Achievement } from "#src/models/achievement/Achievement";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { Currency } from "#src/models/inventory/Currency";
import { useWorldAchievementsStore } from "#src/store/achievements";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test, vi } from "vitest";

const ACHIEVEMENT_ID = 1;
const PRIMOGEMS = 5;
const QUEST_ID = "11";
const achievement: Achievement = {
  categoryId: 1,
  descriptionTextId: "",
  id: ACHIEVEMENT_ID,
  isHidden: false,
  orderId: 1,
  preStageAchievementId: 0,
  primogems: PRIMOGEMS,
  progress: 1,
  titleTextId: "",
  trigger: { parameters: [[QUEST_ID]], type: "TRIGGER_FINISH_QUEST_AND" },
};

vi.mock(import("#src/services/achievement/readAchievements"), () => ({
  readAchievements: () => Promise.resolve({ achievements: [achievement], categories: [] }),
}));

describe(useWorldAchievementsStore, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);

  test("a finished quest its trigger names finishes the achievement and pays its Primogems into the wallet", async () => {
    expect.hasAssertions();

    const worldSessionStore = startTestWorldSession({ getWorldNow: () => EPOCH });
    const worldAchievementsStore = useWorldAchievementsStore();
    worldAchievementsStore.start(new Map());
    worldSessionStore.events.emit("achievementEvents", [
      { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: QUEST_ID },
    ]);

    await vi.waitFor(() => {
      expect(worldAchievementsStore.achievementProgressMap).toStrictEqual(
        new Map([[ACHIEVEMENT_ID, { count: 1, finishedAt: EPOCH }]]),
      );
    });
    expect(worldSessionStore.wallet[Currency.Primogem]).toBe(PRIMOGEMS);
  });

  test("the progress the save holds is the store's from the start, and none is left once it stops", () => {
    expect.hasAssertions();

    startTestWorldSession();
    const worldAchievementsStore = useWorldAchievementsStore();
    const savedProgressMap = new Map([[ACHIEVEMENT_ID, { count: 1, finishedAt: EPOCH }]]);
    worldAchievementsStore.start(savedProgressMap);

    expect(worldAchievementsStore.achievementProgressMap).toBe(savedProgressMap);

    worldAchievementsStore.stop();

    expect(worldAchievementsStore.achievementProgressMap).toStrictEqual(new Map());
  });
});
