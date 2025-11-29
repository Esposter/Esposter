<script setup lang="ts">
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";
import { useAchievementStore } from "@/store/achievement";

definePageMeta({ middleware: "auth" });

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { initializeAchievementDefinitionMap } = achievementStore;
const { userAchievements } = storeToRefs(achievementStore);
const readAchievementDefinitionMap = await $trpc.achievement.readAchievementMap.query();
initializeAchievementDefinitionMap(readAchievementDefinitionMap);
userAchievements.value = (await $trpc.achievement.readUserAchievements.query()).map((achievement) =>
  mapToUserAchievementWithDefinition(achievement, readAchievementDefinitionMap[achievement.achievement.name]),
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
