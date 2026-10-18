<script setup lang="ts">
import type { SceneExport } from "#src/models/scene/SceneExport";
import type { LoadedRegion } from "#src/models/world/LoadedRegion";
import type { LightUniforms, SkyUniforms, WaterUniforms } from "genshin-engine";

import { getOwnRegionData } from "#src/services/world/getOwnRegionData";
import { createRiverGeometry, createRiverMaterial } from "genshin-engine";

interface Props {
  lightUniforms: LightUniforms;
  // The regions in reach, each with the rivers the game places in it
  regionDataMap: ReadonlyMap<string, LoadedRegion>;
  // The game's own exports the world draws in place of ours, by component: a region whose export stands here draws its
  // Rivers itself, so its courses are left out
  sceneExportMap: ReadonlyMap<string, SceneExport>;
  skyUniforms: SkyUniforms;
  waterUniforms: WaterUniforms;
}

const { lightUniforms, regionDataMap, sceneExportMap, skyUniforms, waterUniforms } = defineProps<Props>();
const riverMaterial = createRiverMaterial(lightUniforms, skyUniforms, waterUniforms);
// Rebuilt as the regions in reach arrive or go, so the ribbons of a region that leaves are freed with it
const riverGeometries = computed(() =>
  getOwnRegionData(regionDataMap, sceneExportMap).flatMap(({ rivers }) =>
    rivers.map((course) => createRiverGeometry(course)),
  ),
);

watch(riverGeometries, (oldRiverGeometries) => {
  for (const geometry of oldRiverGeometries) geometry.dispose();
});
onUnmounted(() => {
  for (const geometry of riverGeometries.value) geometry.dispose();
  riverMaterial.dispose();
});
</script>

<template>
  <TresMesh v-for="geometry of riverGeometries" :key="geometry.uuid" :geometry :material="riverMaterial" />
</template>
