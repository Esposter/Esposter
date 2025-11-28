<script setup lang="ts">
import type { achievementDefinitions as baseAchievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

interface GridProps {
  achievementDefinitions: (typeof baseAchievementDefinitions)[number][];
  userAchievements: UserAchievementWithRelations[];
}

const { achievementDefinitions, userAchievements } = defineProps<GridProps>();
</script>

<template>
  <v-row>
    <AchievementGridItem
      v-for="achievementDefinition in achievementDefinitions"
      :key="achievementDefinition.name"
      :achievement="achievementDefinition"
      :user-achievement="userAchievements.find(({ achievement }) => achievement.name === achievementDefinition.name)"
    />
  </v-row>
</template>
