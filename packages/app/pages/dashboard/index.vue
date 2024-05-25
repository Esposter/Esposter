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
      <v-row v-for="(visualRow, index) in visualRows" :key="index">
        <v-col v-for="{ type, w, h, i } in visualRow" :key="i" :cols="w" :style="{ aspectRatio: w / h }">
          <DashboardVisual :type />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
