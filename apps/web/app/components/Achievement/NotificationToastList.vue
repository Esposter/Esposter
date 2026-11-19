<script setup lang="ts">
import { useAchievementStore } from "#src/store/achievement/index";

useAchievementSubscribables();
await useUserSocket();

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { recentlyUnlockedUserAchievements } = storeToRefs(achievementStore);
const { dismissRecentlyUnlockedUserAchievement, initializeAchievementDefinitionMap, initializeUserAchievements } =
  achievementStore;
// The signed-in surfaces read the map the server masked for this viewer, so a hidden achievement they have
// Not unlocked keeps its "???" description
const achievementDefinitionMap = await $trpc.achievement.readAchievementMap.query();
initializeAchievementDefinitionMap(achievementDefinitionMap);
initializeUserAchievements(await useReadUserAchievements(undefined, achievementDefinitionMap));
</script>

<template>
  <AchievementNotificationToast
    v-for="userAchievement in recentlyUnlockedUserAchievements"
    :key="userAchievement.achievement.name"
    :user-achievement
    @close="dismissRecentlyUnlockedUserAchievement(userAchievement.achievement.name)"
  />
</template>
