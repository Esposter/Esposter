<script setup lang="ts">
import { useDashboardStore } from "@/store/dashboard";

const dashboardStore = useDashboardStore();
const { loadContent, saveDashboard } = dashboardStore;
const { dashboard } = storeToRefs(dashboardStore);
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
