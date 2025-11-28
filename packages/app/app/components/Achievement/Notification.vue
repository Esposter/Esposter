<script setup lang="ts">
import { useAchievementStore } from "@/store/achievement";

const achievementStore = useAchievementStore();
const { achievementDefinitionMap, recentlyUnlockedUserAchievement } = storeToRefs(achievementStore);
const recentlyUnlockedUserAchievementWithDefinition = computed(() =>
  recentlyUnlockedUserAchievement.value && achievementDefinitionMap.value
    ? {
        ...recentlyUnlockedUserAchievement.value,
        achievement: {
          name: recentlyUnlockedUserAchievement.value.achievement.name,
          ...achievementDefinitionMap.value[recentlyUnlockedUserAchievement.value.achievement.name],
        },
      }
    : null,
);
const snackbar = computed({
  get: () => Boolean(recentlyUnlockedUserAchievementWithDefinition.value),
  set: (newSnackbar) => {
    if (newSnackbar) return;
    recentlyUnlockedUserAchievement.value = null;
  },
});
</script>

<template>
  <v-snackbar v-model="snackbar" :timeout="5000" color="success" location="top right" variant="elevated">
    <div v-if="recentlyUnlockedUserAchievementWithDefinition" flex items-center>
      <v-icon :icon="recentlyUnlockedUserAchievementWithDefinition.achievement.icon" size="large" mr-3 />
      <div>
        <div class="text-h6" font-bold>Achievement Unlocked!</div>
        <div class="text-subtitle-1">{{ recentlyUnlockedUserAchievementWithDefinition.achievement.name }}</div>
        <div class="text-caption">{{ recentlyUnlockedUserAchievementWithDefinition.achievement.description }}</div>
        <div class="text-caption" text-yellow font-bold>
          +{{ recentlyUnlockedUserAchievementWithDefinition.achievement.points }} points
        </div>
      </div>
    </div>
  </v-snackbar>
</template>
