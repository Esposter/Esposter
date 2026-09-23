<script setup lang="ts">
import { AchievementView, AchievementViews } from "@/models/achievement/AchievementView";
import { AchievementViewItems } from "@/services/achievement/AchievementViewItems";
import { VIEW_QUERY_PARAMETER_KEY } from "@/services/route/constants";

definePageMeta({ middleware: "auth" });

const view = useEnumRouteQuery(VIEW_QUERY_PARAMETER_KEY, AchievementViews, AchievementView.Gallery);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Achievements</Title>
    </Head>
    <div px-4 py-8 flex flex-col gap-4 ui-body>
      <h1 ui-title>Achievements</h1>
      <UiTabs v-model="view" :items="AchievementViewItems" label="Achievements view">
        <template #default="{ value }">
          <AchievementList v-if="value === AchievementView.Gallery" />
          <AchievementLeaderboard v-else />
        </template>
      </UiTabs>
    </div>
  </NuxtLayout>
</template>
