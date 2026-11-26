<script setup lang="ts">
import { DashboardEditorOverlapItems } from "#src/services/dashboard/editor/DashboardEditorOverlapItems";
import { DashboardEditorPackingItems } from "#src/services/dashboard/editor/DashboardEditorPackingItems";
import { useDashboardStore } from "#src/store/dashboard/index";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const { setLayout } = dashboardStore;
</script>

<!-- The settings of the whole canvas, which the inspector shows while nothing on it is selected -->
<template>
  <div p-3 flex flex-col gap-3>
    <p text-muted>Packing</p>
    <UiRadioGroup
      label="Packing"
      :items="DashboardEditorPackingItems"
      :model-value="dashboard.compactType"
      @update:model-value="(compactType) => {
        if (compactType) setLayout({ collision: dashboard.collision, compactType });
      }"
    />
    <p text-muted>Overlaps</p>
    <UiRadioGroup
      label="Overlaps"
      :items="DashboardEditorOverlapItems"
      :model-value="dashboard.collision"
      @update:model-value="(collision) => {
        if (collision) setLayout({ collision, compactType: dashboard.compactType });
      }"
    />
  </div>
</template>
