<script setup lang="ts">
import { useAchievementStore } from "@/stores/achievement";

const achievementStore = useAchievementStore();
const { recentlyUnlocked } = storeToRefs(achievementStore);
const snackbar = ref(false);

watch(recentlyUnlocked, (newRecentlyUnlocked) => {
  if (newRecentlyUnlocked) snackbar.value = true;
});
</script>

<template>
  <v-snackbar v-model="snackbar" :timeout="5000" color="success" location="top right" variant="elevated">
    <div v-if="recentlyUnlocked" flex items-center>
      <v-icon :icon="recentlyUnlocked.achievement.icon" size="large" mr-3 />
      <div>
        <div class="text-h6" font-bold>Achievement Unlocked!</div>
        <div class="text-subtitle-1">{{ recentlyUnlocked.achievement.name }}</div>
        <div class="text-caption">{{ recentlyUnlocked.achievement.description }}</div>
        <div class="text-caption text-amber" font-bold>+{{ recentlyUnlocked.achievement.points }} points</div>
      </div>
    </div>
  </v-snackbar>
</template>
