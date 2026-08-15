<script setup lang="ts">
import { useAchievementStore } from "@/store/achievement";

await useAchievementSubscribables();

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { recentlyUnlockedUserAchievements, userAchievements } = storeToRefs(achievementStore);
const { deleteRecentlyUnlockedUserAchievement, initializeAchievementDefinitionMap } = achievementStore;
// The signed-in surfaces read the map the server masked for this viewer, so a hidden achievement they have
// Not unlocked keeps its "???" description
const achievementDefinitionMap = await $trpc.achievement.readAchievementMap.query();
initializeAchievementDefinitionMap(achievementDefinitionMap);
userAchievements.value = await useReadUserAchievements(undefined, achievementDefinitionMap);
</script>

<template>
  <AchievementNotificationSnackBar
    v-for="userAchievement in recentlyUnlockedUserAchievements"
    :key="userAchievement.achievement.name"
    :user-achievement
    @close="deleteRecentlyUnlockedUserAchievement(userAchievement.achievement.name)"
  />
</template>
