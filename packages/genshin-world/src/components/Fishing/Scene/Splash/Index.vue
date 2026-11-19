<script setup lang="ts">
import type { GroundPoint, LightUniforms } from "genshin-engine";

import { useDisposedMesh } from "#src/composables/useDisposedMesh";
import { FISHING_SPLASH_OPTIONS } from "#src/services/fishing/constants";
import { watchImmediate } from "@vueuse/core";
import { createFishingRippleMaterial, createSplashGeometry } from "genshin-engine";
import { uniform } from "three/tsl";

interface Props {
  // The world's ground at a point in its own coordinates, which the water the splash breaks on stands at
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The point the lure lies at, where the splash breaks
  lure: GroundPoint;
  // How far through its life the splash is, from zero to one
  splash: { age: number };
}

const { getGroundHeight, lightUniforms, lure, splash } = defineProps<Props>();
const age = uniform(0);
const material = createFishingRippleMaterial({ age, lightUniforms });
const geometry = createSplashGeometry(FISHING_SPLASH_OPTIONS);
const mesh = useDisposedMesh(geometry, material);
watchImmediate(
  () => splash.age,
  (newAge) => {
    age.value = newAge;
  },
);
watchImmediate([() => lure.x, () => lure.z, () => getGroundHeight(lure.x, lure.z)], ([x, z, height]) => {
  mesh.position.set(x, height, z);
});
</script>

<template>
  <primitive :object="mesh" />
</template>
