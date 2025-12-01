<script setup lang="ts">
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";
import { useAchievementStore } from "@/store/achievement";

useAchievementSubscribables();

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { initializeAchievementDefinitionMap } = achievementStore;
const { recentlyUnlockedUserAchievements, userAchievements } = storeToRefs(achievementStore);
const achievementDefinitionMap = await $trpc.achievement.readAchievementMap.query();
initializeAchievementDefinitionMap(achievementDefinitionMap);
userAchievements.value = (await $trpc.achievement.readUserAchievements.query()).map((achievement) =>
  mapToUserAchievementWithDefinition(achievement, achievementDefinitionMap[achievement.achievement.name]),
);
</script>

<template>
  <AchievementNotificationSnackBar
    v-for="userAchievement in recentlyUnlockedUserAchievements"
    :key="userAchievement.achievement.name"
    :user-achievement
    @close="
      () => {
        const index = recentlyUnlockedUserAchievements.findIndex(
          ({ achievement }) => achievement.name === userAchievement.achievement.name,
        );
        if (index === -1) return;
        recentlyUnlockedUserAchievements.splice(index, 1);
      }
    "
  />
</template>
