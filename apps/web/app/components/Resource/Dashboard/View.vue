<script setup lang="ts">
// Aliased so the auto-imported <Dashboard> component isn't shadowed by the model class
import { Dashboard as BaseDashboard } from "#shared/models/dashboard/data/Dashboard";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
// The published content is the data form of the class — `visuals` carries plain rows where the constructor's
// `Partial<Dashboard>` declares class instances, and the class is what rebuilds them
const dashboard = new BaseDashboard(content as never);
</script>

<template>
  <div p-4 flex flex-col gap-3 ui-body>
    <h1 ui-display>{{ name }}</h1>
    <Dashboard v-if="dashboard.visuals.length > 0" :visuals="dashboard.visuals" />
    <UiEmptyState v-else :meaning="UiIconMeaning.Chart" title="This dashboard has no visuals" />
  </div>
</template>
