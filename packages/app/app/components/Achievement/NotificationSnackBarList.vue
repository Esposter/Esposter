<script setup lang="ts">
import { useAchievementStore } from "@/store/achievement";

useAchievementSubscribables();

const achievementStore = useAchievementStore();
const { recentlyUnlockedUserAchievements } = storeToRefs(achievementStore);
</script>

<template>
  <AchievementNotificationSnackBar
    v-for="userAchievement in recentlyUnlockedUserAchievements"
    :key="userAchievement.id"
    :user-achievement
    @close="
      (id) => {
        const index = recentlyUnlockedUserAchievements.findIndex(({ id }) => id === id);
        if (index === -1) return;
        recentlyUnlockedUserAchievements.splice(index, 1);
      }
    "
  />
</template>
