<script setup lang="ts">
import { mapToUserAchievementWithDefinition } from "@/services/achievement/mapToUserAchievementWithDefinition";
import { useAchievementStore } from "@/store/achievement";

definePageMeta({ middleware: "auth" });

const { $trpc } = useNuxtApp();
const achievementStore = useAchievementStore();
const { initializeAchievementDefinitionMap } = achievementStore;
const { userAchievements } = storeToRefs(achievementStore);
const achievementDefinitionMap = await $trpc.achievement.readAchievementMap.query();
initializeAchievementDefinitionMap(achievementDefinitionMap);
userAchievements.value = (await $trpc.achievement.readUserAchievements.query()).map((achievement) =>
  mapToUserAchievementWithDefinition(achievement, achievementDefinitionMap[achievement.achievement.name]),
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
