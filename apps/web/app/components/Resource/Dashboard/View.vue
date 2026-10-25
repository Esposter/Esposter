<script setup lang="ts">
// Aliased so the auto-imported <Dashboard> component isn't shadowed by the model class
import { Dashboard as BaseDashboard } from "#shared/models/dashboard/data/Dashboard";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { exportDashboardPng } from "@/services/dashboard/export/exportDashboardPng";
import { ResourceType } from "@esposter/db-schema";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Dashboard,
  id,
  () => $trpc.dashboard.readPublishedResourceContent.query(id),
  (version) => $trpc.dashboard.readPublishedVersionContent.query({ id, version }),
);
// The published content is the data form of the class — `visuals` carries plain rows where the constructor's
// `Partial<Dashboard>` declares class instances, and the class is what rebuilds them
const dashboard = new BaseDashboard(content as never);
</script>

<template>
  <div p-4 flex flex-col gap-3 ui-body>
    <div flex gap-3 items-center justify-between>
      <h1 ui-display>{{ name }}</h1>
      <UiButton :variant="UiButtonVariant.Quiet" @click="exportDashboardPng(name)">Export PNG</UiButton>
    </div>
    <Dashboard v-if="dashboard.visuals.length > 0" :visuals="dashboard.visuals" />
    <UiEmptyState v-else :meaning="UiIconMeaning.Chart" title="This dashboard has no visuals" />
  </div>
</template>
