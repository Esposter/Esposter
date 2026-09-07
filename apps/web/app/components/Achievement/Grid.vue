<script setup lang="ts">
import type { achievementDefinitions as baseAchievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

interface Props {
  achievementDefinitions: (typeof baseAchievementDefinitions)[number][];
  userAchievements: UserAchievementWithDefinition[];
}

const { achievementDefinitions, userAchievements } = defineProps<Props>();
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
