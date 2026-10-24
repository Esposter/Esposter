import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { AchievementStatus } from "@/models/achievement/AchievementStatus";
import { getUnlockedUserAchievements } from "@/services/achievement/getUnlockedUserAchievements";

export const getAchievementListMap = (
  achievementDefinitions: AchievementDefinitionEntry[],
  userAchievements: UserAchievementWithDefinition[],
) => {
  const unlockedUserAchievements = getUnlockedUserAchievements(userAchievements);
  const unlockedAchievementNames = new Set(unlockedUserAchievements.map(({ achievement }) => achievement.name));
  const checkIsUnlockedDefinition = ({ name }: AchievementDefinitionEntry) => unlockedAchievementNames.has(name);
  return {
    [AchievementStatus.All]: { achievementDefinitions, userAchievements },
    [AchievementStatus.Locked]: {
      achievementDefinitions: achievementDefinitions.filter(
        (achievementDefinition) => !checkIsUnlockedDefinition(achievementDefinition),
      ),
      userAchievements,
    },
    [AchievementStatus.Unlocked]: {
      achievementDefinitions: achievementDefinitions.filter((achievementDefinition) =>
        checkIsUnlockedDefinition(achievementDefinition),
      ),
      userAchievements: unlockedUserAchievements,
    },
  };
};
