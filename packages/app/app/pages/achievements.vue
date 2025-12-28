<script setup lang="ts">
definePageMeta({ middleware: "auth" });
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
