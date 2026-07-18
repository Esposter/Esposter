<script setup lang="ts">
import type { UserAchievementWithDefinition } from "#shared/models/achievement/UserAchievementWithDefinition";

const MAX_RECENT_ACHIEVEMENTS = 4;

interface AchievementSummaryProps {
  userAchievements: UserAchievementWithDefinition[];
}

const { userAchievements } = defineProps<AchievementSummaryProps>();
const unlockedUserAchievements = computed(() => userAchievements.filter(({ unlockedAt }) => unlockedAt !== null));
const totalPoints = computed(() =>
  unlockedUserAchievements.value.reduce((total, { achievement }) => total + achievement.points, 0),
);
const recentUserAchievements = computed(() =>
  unlockedUserAchievements.value
    .toSorted((first, second) => (second.unlockedAt?.getTime() ?? 0) - (first.unlockedAt?.getTime() ?? 0))
    .slice(0, MAX_RECENT_ACHIEVEMENTS),
);
</script>

<template>
  <div flex flex-col gap-y-3>
    <div flex items-center gap-x-2>
      <v-icon color="orange" icon="mdi-trophy" />
      <span font-bold text-title-large>{{ totalPoints }} achievement points</span>
      <span op-medium-emphasis text-body-small>{{ unlockedUserAchievements.length }} unlocked</span>
    </div>
    <v-row v-if="recentUserAchievements.length > 0">
      <AchievementGridItem
        v-for="userAchievement of recentUserAchievements"
        :key="userAchievement.achievementId"
        :achievement-definition="userAchievement.achievement"
        :user-achievement
      />
    </v-row>
  </div>
</template>
