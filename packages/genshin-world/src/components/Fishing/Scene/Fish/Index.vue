<script setup lang="ts">
import type { FishingFish } from "#src/models/fishing/FishingFish";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { FISHING_FISH_COLOR, FISHING_FISH_LIFT } from "#src/services/fishing/constants";
import { watchImmediate } from "@vueuse/core";
import { createFishGeometry, createToonMaterial } from "genshin-engine";
import { Mesh } from "three";

interface Props {
  // The fish hooked at the lure, and the body it is drawn with
  fish: FishingFish;
  // The world's ground at a point in its own coordinates, which the water the fish is hooked from stands at
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { fish, getGroundHeight, lightUniforms, rampTexture } = defineProps<Props>();
const material = createToonMaterial({ color: FISHING_FISH_COLOR, lightUniforms, rampTexture });
const mesh = new Mesh(createFishGeometry(fish.shape), material);
// A fish's body changes with its stand-in, so the geometry is rebuilt when the body does, and the one it replaces freed
watch(
  () => fish.shape,
  (shape) => {
    mesh.geometry.dispose();
    mesh.geometry = createFishGeometry(shape);
  },
);
watchImmediate(
  [() => fish.position.x, () => fish.position.z, () => getGroundHeight(fish.position.x, fish.position.z)],
  ([x, z, height]) => {
    mesh.position.set(x, height + FISHING_FISH_LIFT, z);
  },
);

onUnmounted(() => {
  mesh.geometry.dispose();
  material.dispose();
});
</script>

<template>
  <primitive :object="mesh" />
</template>
