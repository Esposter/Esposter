<script setup lang="ts">
import { AchievementView, AchievementViews } from "#shared/models/achievement/AchievementView";
import { VIEW_QUERY_PARAMETER_KEY } from "#shared/services/route/constants";

definePageMeta({ middleware: "auth" });

const view = useEnumRouteQuery(VIEW_QUERY_PARAMETER_KEY, AchievementViews, AchievementView.Gallery);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Achievements</Title>
    </Head>
    <v-container>
      <v-tabs v-model="view" mb-4>
        <v-tab v-for="key in AchievementViews" :key :value="key">{{ key }}</v-tab>
      </v-tabs>
      <v-window v-model="view">
        <v-window-item :value="AchievementView.Gallery">
          <AchievementList />
        </v-window-item>
        <v-window-item :value="AchievementView.Leaderboard">
          <AchievementLeaderboard />
        </v-window-item>
      </v-window>
    </v-container>
  </NuxtLayout>
</template>
