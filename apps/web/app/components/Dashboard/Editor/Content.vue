<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DASHBOARD_EDITOR_ROW_HEIGHT, DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { useVisualStore } from "@/store/dashboard/visual";

const visualStore = useVisualStore();
const { visuals } = storeToRefs(visualStore);
const { updateVisual } = visualStore;
</script>

<template>
  <UiEmptyState
    v-if="visuals.length === 0"
    description="Add a visual from the bar above, then click it to bind its data"
    :meaning="UiIconMeaning.Chart"
    title="No visuals yet"
    flex-1
  />
  <div v-else p-3 flex-1>
    <DashboardGrid
      :visuals
      :column-number="DASHBOARD_NO_COLUMNS"
      :row-height="DASHBOARD_EDITOR_ROW_HEIGHT"
      is-editable
      @commit="(changes) => changes.forEach((change) => updateVisual(change))"
    >
      <template #default="{ visual }">
        <DashboardVisualPreviewContainer
          size-full
          ui-frame
          cursor-pointer
          active="not-focus-within:[background-image:var(--ui-pressed-overlay)]"
          :visual
        />
      </template>
    </DashboardGrid>
  </div>
</template>

<style scoped>
/* The grid is the page's background, in the library's tokens */
.dashboard-grid {
  width: 100%;
  min-height: 100%;
  background-color: var(--ui-background);
}
</style>
