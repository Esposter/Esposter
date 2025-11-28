<script setup lang="ts">
import { useAchievementStore } from "@/store/achievement";

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { initializeAchievementDefinitionMap } = achievementStore;
const { userAchievements } = storeToRefs(achievementStore);
initializeAchievementDefinitionMap(await $trpc.achievement.readAllAchievementMap.query());
userAchievements.value = await $trpc.achievement.readUserAchievements.query();
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
