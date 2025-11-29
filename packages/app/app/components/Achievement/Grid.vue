<script setup lang="ts">
import type { UserAchievementWithDefinition } from "#shared/models/achievement/UserAchievementWithDefinition";
import type { achievementDefinitions as baseAchievementDefinitions } from "#shared/services/achievement/achievementDefinitions";

interface GridProps {
  achievementDefinitions: (typeof baseAchievementDefinitions)[number][];
  userAchievements: UserAchievementWithDefinition[];
}

const { achievementDefinitions, userAchievements } = defineProps<GridProps>();
</script>

<template>
  <v-row>
    <AchievementGridItem
      v-for="achievementDefinition in achievementDefinitions"
      :key="achievementDefinition.name"
      :achievement-definition
      :user-achievement="userAchievements.find(({ achievement }) => achievement.name === achievementDefinition.name)"
    />
  </v-row>
</template>
