import type { Achievement } from "#src/models/achievement/Achievement";
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";
import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { AchievementProgress } from "#src/models/achievement/AchievementProgress";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { WorldEvents } from "#src/models/world/WorldEvents";
import type { GameLanguage } from "genshin-text";
import type { Ref } from "vue";

import { Currency } from "#src/models/inventory/Currency";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { AchievementTextLoaderMap } from "#src/services/achievement/AchievementTextLoaderMap";
import { advanceAchievements } from "#src/services/achievement/advanceAchievements";
import { readAchievements } from "#src/services/achievement/readAchievements";
import { getResultAsync } from "@esposter/shared";

// The achievements, their categories and their words in the reader's language, read the first time the Achievements
// Screen opens rather than with the world. A finished step or quest moves the achievements whatever screen is open, and
// The Primogems of those finished are paid into the wallet
export const useWorldAchievements = ({
  events,
  getWorldNow,
  language,
  savedAchievementProgressMap,
  screenKind,
  setWallet,
  wallet,
}: {
  events: WorldEvents;
  getWorldNow: () => Temporal.Instant;
  language: GameLanguage;
  savedAchievementProgressMap: ReadonlyMap<number, AchievementProgress>;
  screenKind: Ref<ScreenKind>;
  setWallet: (nextWallet: Wallet) => void;
  wallet: Ref<Wallet>;
}) => {
  const achievementData = shallowRef<{
    achievements: Achievement[];
    categories: AchievementCategory[];
    textMap: Readonly<Record<string, string>>;
  }>();
  const achievementProgressMap = shallowRef<ReadonlyMap<number, AchievementProgress>>(savedAchievementProgressMap);
  watch(screenKind, (newScreenKind) => {
    if (newScreenKind !== ScreenKind.Achievements || achievementData.value) return;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(async () => {
      const [{ achievements, categories }, textMap] = await Promise.all([
        readAchievements(),
        AchievementTextLoaderMap[language](),
      ]);
      return { achievements, categories, textMap };
    }).match(
      (newAchievementData) => {
        achievementData.value = newAchievementData;
      },
      (error) => {
        console.error(error);
      },
    );
  });
  const advanceAchievementsWith = (achievementEvents: AchievementEvent[]) => {
    if (achievementEvents.length === 0) return;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(readAchievements).match(
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
  events.on("achievementEvents", advanceAchievementsWith);
  return { achievementData, achievementProgressMap };
};
