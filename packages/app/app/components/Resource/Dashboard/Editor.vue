<script setup lang="ts">
import type { VisualType } from "#shared/models/dashboard/data/VisualType";

import { VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";

const route = useRoute();
const dashboardStore = useDashboardStore();
const { loadContent, saveDashboard } = dashboardStore;
const { dashboard } = storeToRefs(dashboardStore);
const visualStore = useVisualStore();
const { visualType } = storeToRefs(visualStore);
const itemType = route.query[ITEM_TYPE_QUERY_PARAMETER_KEY];
if (VisualTypes.has(itemType as VisualType)) visualType.value = itemType as VisualType;
// The Suspense-wrapped blade awaits the content, so it opens on a populated store — the same shape Note uses
await loadContent();
// Layout drags and visual edits mutate the dashboard in place, so the watch has to be deep — and the
// Store seeds the dirty check with what it just read, so this first deep fire compares equal and saves nothing
watchAutosave(dashboard, saveDashboard);
</script>

<template>
  <v-container fluid h-full>
    <StyledCard flex flex-col size-full>
      <DashboardEditorHeader />
      <DashboardEditorContent />
    </StyledCard>
  </v-container>
</template>
