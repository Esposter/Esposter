<script setup lang="ts">
const achievementStore = useAchievementStore();
const userAchievements = await useReadUserEntities(() => $trpc.achievement.readUserAchievements);
const stats = await useReadUserEntities(() => $trpc.achievement.readUserStats);
achievementStore.userAchievements = userAchievements;
achievementStore.stats = stats;
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
