<script setup lang="ts">
import type { VisualType } from "#shared/models/dashboard/data/VisualType";

import { VisualTypes } from "#shared/models/dashboard/data/VisualType";
import { ITEM_TYPE_QUERY_PARAMETER_KEY } from "@/services/shared/constants";
import { useDashboardStore } from "@/store/dashboard";
import { useVisualStore } from "@/store/dashboard/visual";
import deepEqual from "fast-deep-equal";
import { omitDeep } from "lodash-omitdeep";

const route = useRoute();
const dashboardStore = useDashboardStore();
const { loadContent, saveDashboard } = dashboardStore;
const { dashboard } = storeToRefs(dashboardStore);
const visualStore = useVisualStore();
const { visualType } = storeToRefs(visualStore);
const isLoading = ref(true);
const itemType = route.query[ITEM_TYPE_QUERY_PARAMETER_KEY];
if (VisualTypes.has(itemType as VisualType)) visualType.value = itemType as VisualType;
const virtualDashboard = computed((oldVirtualDashboard) => {
  const newVirtualDashboard = omitDeep(dashboard.value);
  return oldVirtualDashboard && deepEqual(newVirtualDashboard, oldVirtualDashboard)
    ? oldVirtualDashboard
    : newVirtualDashboard;
});
// Autosave every content change; guarded so the initial load populating the store doesn't immediately write back
watch(virtualDashboard, async () => {
  if (isLoading.value) return;
  await saveDashboard();
});

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <v-container v-else fluid h-full>
    <StyledCard flex flex-col size-full>
      <DashboardEditorHeader />
      <DashboardEditorContent />
    </StyledCard>
  </v-container>
</template>
