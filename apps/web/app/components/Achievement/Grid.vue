<script setup lang="ts">
import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievementWithDefinition } from "#src/models/achievement/UserAchievementWithDefinition";
import type { AchievementName } from "@esposter/db-schema";

interface Props {
  achievementDefinitions: AchievementDefinitionEntry[];
  achievementNameRarityMap?: Record<AchievementName, number> | undefined;
  userAchievements: UserAchievementWithDefinition[];
}

const { userAchievements } = defineProps<Props>();
// Each achievement's first row, found once for the list rather than searched for again by every definition drawn
const userAchievementMap = computed(() => {
  const map = new Map<string, UserAchievementWithDefinition>();
  for (const userAchievement of userAchievements)
    if (!map.has(userAchievement.achievement.name)) map.set(userAchievement.achievement.name, userAchievement);
  return map;
});
</script>

<template>
  <ul gap-4 grid cols-1 lg:cols-4 md:cols-3 sm:cols-2>
    <AchievementGridItem
      v-for="achievementDefinition in achievementDefinitions"
      :key="achievementDefinition.name"
      :achievement-definition
      :rarity="achievementNameRarityMap?.[achievementDefinition.name]"
      :user-achievement="userAchievementMap.get(achievementDefinition.name)"
    />
  </ul>
</template>
