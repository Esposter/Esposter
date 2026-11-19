<script setup lang="ts">
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { LightUniforms } from "genshin-engine";

import { FISHING_POINT_CAPACITY, FISHING_POINT_RING_OPTIONS } from "#src/services/fishing/constants";
import { createFishingRippleMaterial, createInstancedMesh, createRippleRingGeometry } from "genshin-engine";
import { Matrix4 } from "three";
import { float } from "three/tsl";

interface Props {
  // The world's ground at a point in its own coordinates, which the water each ring lies on stands at
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The fishing points whose rings show, each drawn as one ring of one instanced draw
  points: FishingPointPlace[];
}

const { getGroundHeight, lightUniforms, points } = defineProps<Props>();
const geometry = createRippleRingGeometry(FISHING_POINT_RING_OPTIONS);
const material = createFishingRippleMaterial({ age: float(0), lightUniforms });
const ringMesh = createInstancedMesh(geometry, material, FISHING_POINT_CAPACITY);
// The rings sit where the points are placed, so the mesh's bounds, measured once at its origin, would cull them
ringMesh.frustumCulled = false;
const matrix = new Matrix4();
watchEffect(() => {
  // The instanced draw holds at most its capacity of rings, so a point past it is not drawn
  const placed = points.slice(0, FISHING_POINT_CAPACITY);
  for (const [
    index,
    {
      position: { x, z },
    },
  ] of placed.entries())
    ringMesh.setMatrixAt(index, matrix.makeTranslation(x, getGroundHeight(x, z), z));

  ringMesh.count = placed.length;
  ringMesh.instanceMatrix.needsUpdate = true;
});

onUnmounted(() => {
  geometry.dispose();
  material.dispose();
  ringMesh.dispose();
});
</script>

<template>
  <primitive :object="ringMesh" />
</template>
