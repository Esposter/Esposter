<script setup lang="ts">
// Aliased so the auto-imported <Dashboard> component isn't shadowed by the model class
import { Dashboard as DashboardModel } from "#shared/models/dashboard/data/Dashboard";
import { ResourceType } from "@esposter/db-schema";

interface Props {
  id: string;
  version?: number;
}

const { id, version } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Dashboard,
  id,
  () =>
    version
      ? $trpc.dashboard.readPublishedVersionContent.query({ id, version })
      : $trpc.dashboard.readPublishedResourceContent.query(id),
  version,
);
const dashboard = new DashboardModel(content as never);
</script>

<template>
  <v-container fluid>
    <h1 px-4 pt-4>{{ name }}</h1>
    <Dashboard :visuals="dashboard.visuals" />
  </v-container>
</template>
