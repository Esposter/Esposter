<script setup lang="ts">
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";
import { useAchievementStore } from "@/store/achievement";

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { initializeAchievementDefinitionMap } = achievementStore;
const { userAchievements } = storeToRefs(achievementStore);
const newAchievementDefinitionMap = await $trpc.achievement.readAllAchievementMap.query();
initializeAchievementDefinitionMap(newAchievementDefinitionMap);
userAchievements.value = (await $trpc.achievement.readUserAchievements.query()).map((achievement) =>
  mapToUserAchievementWithDefinition(achievement, newAchievementDefinitionMap[achievement.achievement.name]),
);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Achievements</Title>
    </Head>
    <v-container>
      <AchievementList />
    </v-container>
  </NuxtLayout>
</template>
