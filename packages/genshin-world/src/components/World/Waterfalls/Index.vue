<script setup lang="ts">
import type { SceneExport } from "#src/models/scene/SceneExport";
import type { LoadedRegion } from "#src/models/world/LoadedRegion";
import type { WaterUniforms } from "genshin-engine";

import { getDrawnWaterfalls } from "#src/services/world/getDrawnWaterfalls";
import { getOwnRegionData } from "#src/services/world/getOwnRegionData";
import { createWaterfallGeometry, createWaterfallMaterial } from "genshin-engine";

interface Props {
  // The regions in reach, each with the falls the game places in it
  regionDataMap: ReadonlyMap<string, LoadedRegion>;
  // The game's own exports the world draws in place of ours, by component: a region whose export stands here draws its
  // Falls itself, so its sheets are left out
  sceneExportMap: ReadonlyMap<string, SceneExport>;
  waterUniforms: WaterUniforms;
}

const { regionDataMap, sceneExportMap, waterUniforms } = defineProps<Props>();
const waterfallMaterial = createWaterfallMaterial(waterUniforms);
// Rebuilt as the regions in reach arrive or go, so the sheets of a region that leaves are freed with it
const waterfallGeometries = computed(() => {
  const regionWaterfalls = getOwnRegionData(regionDataMap, sceneExportMap).flatMap(({ waterfalls }) => waterfalls);
  const drawnWaterfalls = getDrawnWaterfalls(regionWaterfalls);
  return drawnWaterfalls.map((waterfall) => createWaterfallGeometry(waterfall));
});

watch(waterfallGeometries, (oldWaterfallGeometries) => {
  for (const geometry of oldWaterfallGeometries) geometry.dispose();
});
onUnmounted(() => {
  for (const geometry of waterfallGeometries.value) geometry.dispose();
  waterfallMaterial.dispose();
});
</script>

<template>
  <TresMesh v-for="geometry of waterfallGeometries" :key="geometry.uuid" :geometry :material="waterfallMaterial" />
</template>
