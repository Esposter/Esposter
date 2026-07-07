<script setup lang="ts">
// Aliased so the auto-imported <Dashboard> component isn't shadowed by the model class
import { Dashboard as DashboardModel } from "#shared/models/dashboard/data/Dashboard";
import { getResultAsync } from "@esposter/shared";

const route = useRoute();
const { $trpc } = useNuxtApp();
const { content, name } = await getResultAsync(() =>
  $trpc.dashboard.readPublishedResourceContent.query(String(route.params.id)),
).match(
  (publishedResource) => publishedResource,
  () => {
    throw createError({ statusCode: 404, statusMessage: "Dashboard not found" });
  },
);
const dashboard = new DashboardModel(content as never);
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });
</script>

<template>
  <NuxtLayout>
    <v-container fluid>
      <h1 px-4 pt-4>{{ name }}</h1>
      <Dashboard :visuals="dashboard.visuals" />
    </v-container>
  </NuxtLayout>
</template>
