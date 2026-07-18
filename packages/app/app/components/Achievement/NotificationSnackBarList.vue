<script setup lang="ts">
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";
import { useAchievementStore } from "@/store/achievement";

await useAchievementSubscribables();

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { recentlyUnlockedUserAchievements, userAchievements } = storeToRefs(achievementStore);
const { deleteRecentlyUnlockedUserAchievement, initializeAchievementDefinitionMap } = achievementStore;
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
    @close="deleteRecentlyUnlockedUserAchievement(userAchievement.achievement.name)"
  />
</template>
