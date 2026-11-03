import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";

import { Currency } from "#src/models/inventory/Currency";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { AchievementTextLoaderMap } from "#src/services/achievement/AchievementTextLoaderMap";
import { advanceAchievements } from "#src/services/achievement/advanceAchievements";
import { readAchievements } from "#src/services/achievement/readAchievements";
import { useWorldScreenStore } from "#src/store/screen";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { defineStore, storeToRefs } from "pinia";
import { shallowRef, watch } from "vue";

// The achievements, their categories and their words in the reader's language, read the first time the Achievements
// Screen opens rather than with the world. A finished step or quest moves the achievements whatever screen is open, and
// The Primogems of those finished are paid into the wallet. The session starts it with the progress the save holds and
// Stops it as it unmounts
export const useWorldAchievementsStore = defineStore("world/achievements", () => {
  const worldScreenStore = useWorldScreenStore();
  const { screenKind } = storeToRefs(worldScreenStore);
  const worldSessionStore = useWorldSessionStore();
  const { wallet } = storeToRefs(worldSessionStore);
  const { events, getWorldNow, setWallet } = worldSessionStore;
  const achievementProgressMap = shallowRef<ReadonlyMap<number, AchievementProgress>>(new Map());
  const achievementData = shallowRef<{
    achievements: Achievement[];
    categories: AchievementCategory[];
    textMap: Readonly<Record<string, string>>;
  }>();
  watch(screenKind, (newScreenKind) => {
    if ((newScreenKind !== ScreenKind.Achievements && newScreenKind !== ScreenKind.PaimonMenu) || achievementData.value)
      return;
    getSynchronizedFunction(() =>
      getResultAsync(async () => {
        const [{ achievements, categories }, textMap] = await Promise.all([
          readAchievements(worldSessionStore.gameDataBaseUrl),
          AchievementTextLoaderMap[worldSessionStore.language](worldSessionStore.gameDataBaseUrl),
        ]);
        return { achievements, categories, textMap };
      }).match(
        (newAchievementData) => {
          achievementData.value = newAchievementData;
        },
        (error) => {
          console.error(error);
        },
      ),
    )();
  });
  const advanceAchievementsWith = (achievementEvents: AchievementEvent[]) => {
    if (achievementEvents.length === 0) return;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readAchievements(worldSessionStore.gameDataBaseUrl)).match(
      ({ achievements }) => {
        const now = getWorldNow();
        let primogems = 0;
        let nextProgressMap = achievementProgressMap.value;
        for (const achievementEvent of achievementEvents) {
          const advance = advanceAchievements(achievements, nextProgressMap, achievementEvent, now);
          primogems += advance.primogems;
          nextProgressMap = advance.progressMap;
        }
        achievementProgressMap.value = nextProgressMap;
        setWallet({ ...wallet.value, [Currency.Primogem]: wallet.value[Currency.Primogem] + primogems });
      },
      (error) => {
        console.error(error);
      },
    );
  };
  const start = (savedAchievementProgressMap: ReadonlyMap<number, AchievementProgress>) => {
    achievementProgressMap.value = savedAchievementProgressMap;
    events.on("achievementEvents", advanceAchievementsWith);
  };
  const stop = () => {
    achievementData.value = undefined;
    achievementProgressMap.value = new Map();
  };

  return { achievementData, achievementProgressMap, start, stop };
});
