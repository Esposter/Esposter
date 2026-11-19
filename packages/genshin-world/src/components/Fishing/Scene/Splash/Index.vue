<script setup lang="ts">
import type { GroundPoint, LightUniforms } from "genshin-engine";

import { useDisposedMesh } from "#src/composables/useDisposedMesh";
import { FISHING_SPLASH_OPTIONS } from "#src/services/fishing/constants";
import { createFishingRippleMaterial, createSplashGeometry } from "genshin-engine";
import { uniform } from "three/tsl";

interface Props {
  // The world's ground at a point in its own coordinates, which the water the splash breaks on stands at
  getGroundHeight: (x: number, z: number) => number;
  // The point the lure lies at, where the splash breaks
  lure: GroundPoint;
  lightUniforms: LightUniforms;
  // How far through its life the splash is, from zero to one
  splash: { age: number };
}

const { getGroundHeight, lightUniforms, lure, splash } = defineProps<Props>();
const age = uniform(0);
const material = createFishingRippleMaterial({ age, lightUniforms });
const geometry = createSplashGeometry(FISHING_SPLASH_OPTIONS);
const mesh = useDisposedMesh(geometry, material);
watchEffect(() => {
  age.value = splash.age;
  mesh.position.set(lure.x, getGroundHeight(lure.x, lure.z), lure.z);
});
</script>

<template>
  <primitive :object="mesh" />
</template>
