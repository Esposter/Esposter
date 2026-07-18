<script setup lang="ts">
// Aliased so the auto-imported <Dashboard> component isn't shadowed by the model class
import { Dashboard as DashboardModel } from "#shared/models/dashboard/data/Dashboard";
import { ResourceType } from "@esposter/db-schema";

interface ResourceDashboardViewProps {
  id: string;
}

const { id } = defineProps<ResourceDashboardViewProps>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(ResourceType.Dashboard, id, () =>
  $trpc.dashboard.readPublishedResourceContent.query(id),
);
const dashboard = new DashboardModel(content as never);
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });
</script>

<template>
  <v-container fluid>
    <h1 px-4 pt-4>{{ name }}</h1>
    <Dashboard :visuals="dashboard.visuals" />
  </v-container>
</template>
