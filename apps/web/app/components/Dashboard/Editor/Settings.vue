<script setup lang="ts">
import { useDashboardStore } from "@/store/dashboard";
import { CollisionMode, CompactType } from "vue-grid-layout-headless";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const { setLayout } = dashboardStore;
// The plain words for each setting. The package's names are not shown, so a reader sees what a choice does
const packingItems = [
  { description: "Visuals rise to close gaps", title: "Pack upward", value: CompactType.Vertical },
  { description: "Visuals move left to close gaps", title: "Pack sideways", value: CompactType.Horizontal },
  { description: "Visuals stay where they are placed", title: "Free placement", value: CompactType.None },
];
const overlapItems = [
  { description: "A drop moves the visuals it lands on down", title: "Push others away", value: CollisionMode.Push },
  { description: "A drop trades places with the visual it lands on", title: "Swap places", value: CollisionMode.Swap },
  { description: "A drop onto another visual is refused", title: "Block overlap", value: CollisionMode.Prevent },
];
</script>

<!-- The settings of the whole canvas, which the inspector shows while nothing on it is selected -->
<template>
  <div p-3 flex flex-col gap-3>
    <p text-sm text-muted>Packing</p>
    <UiRadioGroup
      label="Packing"
      :items="packingItems"
      :model-value="dashboard.compactType"
      @update:model-value="
        async (compactType) => {
          if (compactType) await setLayout({ collision: dashboard.collision, compactType });
        }
      "
    />
    <p text-sm text-muted>Overlaps</p>
    <UiRadioGroup
      label="Overlaps"
      :items="overlapItems"
      :model-value="dashboard.collision"
      @update:model-value="
        async (collision) => {
          if (collision) await setLayout({ collision, compactType: dashboard.compactType });
        }
      "
    />
  </div>
</template>
