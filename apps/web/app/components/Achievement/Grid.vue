<script setup lang="ts">
import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

interface Props {
  achievementDefinitions: AchievementDefinitionEntry[];
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
