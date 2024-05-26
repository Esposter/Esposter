<script setup lang="ts">
import type { DashboardVisual } from "@/models/dashboard/DashboardVisual";
import { BLANK_GRID_VALUE } from "@/services/shared/constants";
import { getPositionHash } from "@/util/id/getPositionHash";

interface DashboardGridProps {
  visuals: DashboardVisual[];
  noColumns: number;
}

const { visuals, noColumns } = defineProps<DashboardGridProps>();
const aspectRatio = 16 / 9;
const maxY = computed(() => {
  const visualY = visuals.reduce((acc, { y, h }) => (acc > y + h ? acc : y + h), 0);
  // We want to fallback to a higher y value that retains some sort of aspect ratio
  // so that the dashboard will split the grid in the y-axis a lot nicer visually
  const fallbackY = Math.ceil(noColumns * aspectRatio);
  return Math.max(visualY, fallbackY);
});
const gridTemplateAreas = computed(() => {
  const gridTemplateAreas: string[][] = Array(maxY.value)
    .fill(null)
    .map(() => Array(noColumns).fill(BLANK_GRID_VALUE));

  for (const { x, y, w, h } of visuals)
    for (let i = y; i < y + h; i++) for (let j = x; j < x + w; j++) gridTemplateAreas[i][j] = getPositionHash({ x, y });

  return gridTemplateAreas.map((row) => `'${row.join(" ")}'`).join(" ");
});
</script>

<template>
  <v-container h-full grid grid-cols-12 gap-4 :style="{ gridTemplateAreas }" fluid>
    <div v-for="{ type, x, y, i } in visuals" :key="i" :style="{ gridArea: getPositionHash({ x, y }) }">
      <DashboardVisual :type />
    </div>
  </v-container>
</template>
