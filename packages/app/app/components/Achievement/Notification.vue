<script setup lang="ts">
import { useAchievementStore } from "@/store/achievement";

const achievementStore = useAchievementStore();
const { recentlyUnlockedUserAchievement } = storeToRefs(achievementStore);
const snackbar = computed({
  get: () => Boolean(recentlyUnlockedUserAchievement.value),
  set: (newSnackbar) => {
    if (newSnackbar) return;
    recentlyUnlockedUserAchievement.value = null;
  },
});
</script>

<template>
  <v-snackbar v-model="snackbar" :timeout="5000" color="success" location="top right" variant="elevated">
    <div v-if="recentlyUnlockedUserAchievement" flex items-center>
      <v-icon mr-3 :icon="recentlyUnlockedUserAchievement.achievement.icon" size="large" />
      <div>
        <div class="text-h6" font-bold>Achievement Unlocked!</div>
        <div class="text-subtitle-1">{{ recentlyUnlockedUserAchievement.achievement.name }}</div>
        <div class="text-caption">{{ recentlyUnlockedUserAchievement.achievement.description }}</div>
        <div class="text-caption" text-yellow font-bold>
          +{{ recentlyUnlockedUserAchievement.achievement.points }} points
        </div>
      </div>
    </div>
  </v-snackbar>
</template>
