<script setup lang="ts">
import type { RegionData } from "@/models/genshin/world/RegionData";
import type { LightUniforms, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { LandmarkKind } from "@/models/genshin/world/LandmarkKind";

interface Props {
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  regionDataMap: ReadonlyMap<string, RegionData>;
  windUniforms: WindUniforms;
}

const { lightUniforms, rampTexture, regionDataMap, windUniforms } = defineProps<Props>();
// Every landmark of every region in reach, built by its kind's kit, so a region's landmarks appear as its data
// Arrives and go when it is released
const landmarks = computed(() => [...regionDataMap.values()].flatMap(({ landmarks }) => landmarks));
</script>

<template>
  <template v-for="landmark of landmarks" :key="landmark.id">
    <GenshinLandmarkTree
      v-if="landmark.kind === LandmarkKind.Tree"
      :landmark
      :light-uniforms
      :ramp-texture
      :wind-uniforms
    />
    <GenshinLandmarkStatue v-else :landmark :light-uniforms :ramp-texture />
  </template>
</template>
