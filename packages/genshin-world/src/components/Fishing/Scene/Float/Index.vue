<script setup lang="ts">
import type { GroundPoint, LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { useDisposedMesh } from "#src/composables/useDisposedMesh";
import { FISHING_FLOAT_COLOR, FISHING_FLOAT_OPTIONS } from "#src/services/fishing/constants";
import { createFloatGeometry, createToonMaterial } from "genshin-engine";

interface Props {
  // The world's ground at a point in its own coordinates, which the water the float rests on stands at
  getGroundHeight: (x: number, z: number) => number;
  // The point the lure lies at, on the water
  lure: GroundPoint;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { getGroundHeight, lightUniforms, lure, rampTexture } = defineProps<Props>();
const material = createToonMaterial({ color: FISHING_FLOAT_COLOR, lightUniforms, rampTexture });
const geometry = createFloatGeometry(FISHING_FLOAT_OPTIONS);
const mesh = useDisposedMesh(geometry, material);
watchEffect(() => {
  mesh.position.set(lure.x, getGroundHeight(lure.x, lure.z), lure.z);
});
</script>

<template>
  <primitive :object="mesh" />
</template>
