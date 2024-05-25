<script setup lang="ts">
import { useLayoutStore } from "@/store/dashboard/layout";

await useReadDashboard();
const layoutStore = useLayoutStore();
const { visuals } = storeToRefs(layoutStore);
const visualRows = computed(() => {
  // Sort visuals by y value then by x value in each row
  const visualRows = Object.entries(Object.groupBy(visuals.value, ({ y }) => y))
    .toSorted(([a], [b]) => a - b)
    .map(([, visualRow]) => visualRow);
  for (const visualRow of visualRows) visualRow.sort((a, b) => a.x - b.x);
  return visualRows;
});
</script>

<template>
  <NuxtLayout>
    <v-container h-full fluid>
      <v-row v-for="(visualRow, rowIndex) in visualRows" :key="rowIndex">
        <v-col
          v-for="({ type, w, h, i }, columnIndex) in visualRow"
          :key="i"
          :style="{ aspectRatio: w / h }"
          :cols="w"
          :offset="
            visualRow[0].x +
            (columnIndex > 0
              ? visualRow[columnIndex].x - (visualRow[columnIndex - 1].x + visualRow[columnIndex - 1].w)
              : 0)
          "
        >
          <DashboardVisual :type />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
