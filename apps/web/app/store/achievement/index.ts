import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { AchievementDefinitionViewMap } from "#shared/models/achievement/AchievementDefinitionViewMap";
import type { UserAchievementWithDefinition } from "#src/models/achievement/UserAchievementWithDefinition";
import type { AchievementName, UserAchievementInAchievementWithRelations } from "@esposter/db-schema";

import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { checkIsUnlockedUserAchievement } from "#src/services/achievement/checkIsUnlockedUserAchievement";
import { getUnlockedUserAchievements } from "#src/services/achievement/getUnlockedUserAchievements";
import { userAchievementTable } from "#src/services/achievement/overlay/constants";
import { toUserAchievementWithDefinition } from "#src/services/achievement/toUserAchievementWithDefinition";
import { checkIsVersioned } from "#src/services/shared/overlay/checkIsVersioned";
import { useOverlayStore } from "#src/store/overlay";

export const useAchievementStore = defineStore("achievement", () => {
  const achievementDefinitionMap = ref<AchievementDefinitionViewMap>();
  const achievementDefinitions = computed<AchievementDefinitionEntry[]>(() =>
    achievementDefinitionMap.value ? parseDictionaryToArray(achievementDefinitionMap.value, "name") : [],
  );
  // A push that lands before the definitions are read has no definition to build its row from, so it waits for them
  let heldUserAchievements: UserAchievementInAchievementWithRelations[] = [];
  const overlayStore = useOverlayStore();
  const { arrive, view } = overlayStore;
  const userAchievementRows = view(userAchievementTable);
  // The view's rows are drafts that may hold no version yet, so the list keeps the rows the server has versioned
  const userAchievements = computed(() =>
    userAchievementRows.value.filter((userAchievement) => checkIsVersioned(userAchievement)),
  );
  // Each row is an arrival, so a read that answers older than a row a push already brought keeps the newer one
  const initializeUserAchievements = (newUserAchievements: UserAchievementWithDefinition[]) => {
    for (const userAchievement of newUserAchievements) arrive(userAchievementTable, userAchievement);
  };
  const statistics = computed(() => {
    const unlockedUserAchievements = getUnlockedUserAchievements(userAchievements.value);
    return {
      totalAchievements: achievementDefinitions.value.length,
      totalPoints: achievementDefinitions.value.reduce((total, { points }) => total + points, 0),
      unlockedAchievements: unlockedUserAchievements.length,
      unlockedPoints: unlockedUserAchievements.reduce((total, { achievement: { points } }) => total + points, 0),
    };
  });
  const recentlyUnlockedUserAchievements = ref<UserAchievementWithDefinition[]>([]);
  const dismissRecentlyUnlockedUserAchievement = (name: AchievementName) => {
    recentlyUnlockedUserAchievements.value = recentlyUnlockedUserAchievements.value.filter(
      ({ achievement }) => achievement.name !== name,
    );
  };
  const updateAchievement = (updatedUserAchievement: UserAchievementInAchievementWithRelations) => {
    if (!achievementDefinitionMap.value) {
      heldUserAchievements.push(updatedUserAchievement);
      return;
    }

    const userAchievementWithDefinition = toUserAchievementWithDefinition(
      updatedUserAchievement,
      achievementDefinitionMap.value[updatedUserAchievement.achievement.name],
    );
    // A push the held row already supersedes is not a new unlock, so it raises no toast
    const isApplied = arrive(userAchievementTable, userAchievementWithDefinition);
    if (isApplied && checkIsUnlockedUserAchievement(userAchievementWithDefinition))
      recentlyUnlockedUserAchievements.value.push(userAchievementWithDefinition);
  };
  const initializeAchievementDefinitionMap = (newAchievementDefinitionMap: AchievementDefinitionViewMap) => {
    achievementDefinitionMap.value = newAchievementDefinitionMap;
    // Pushes held while the definitions were read are applied now, so an unlock that landed in that window is announced
    const heldPushes = heldUserAchievements;
    heldUserAchievements = [];
    for (const userAchievement of heldPushes) updateAchievement(userAchievement);
  };
  return {
    achievementDefinitions,
    dismissRecentlyUnlockedUserAchievement,
    initializeAchievementDefinitionMap,
    initializeUserAchievements,
    recentlyUnlockedUserAchievements,
    statistics,
    updateAchievement,
    userAchievements,
  };
});
