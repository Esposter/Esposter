<script setup lang="ts">
import type { LandmarkArrival } from "#src/models/world/LandmarkArrival";
import type { ToonNodeMaterial } from "genshin-engine";

import { setObjectSurface } from "genshin-engine";
import { BoxGeometry, Mesh } from "three";

interface Props {
  arrival: LandmarkArrival;
  color: string;
  // The world's ground at a point in its own coordinates, which the pillar stands on
  getGroundHeight: (x: number, z: number) => number;
  height: number;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
  width: number;
}

const { arrival, color, getGroundHeight, height, partMaterial, width } = defineProps<Props>();
const groundHeight = getGroundHeight(arrival.position.x, arrival.position.z);
const geometry = new BoxGeometry(width, height, width);
const mesh = new Mesh(geometry, partMaterial);
mesh.position.y = height / 2;
mesh.castShadow = true;
mesh.receiveShadow = true;
setObjectSurface(mesh, color);

onUnmounted(() => {
  geometry.dispose();
});
</script>

<template>
  <TresGroup
    :position="[arrival.position.x, groundHeight + arrival.heightOffset, arrival.position.z]"
    :rotation-y="arrival.rotation"
  >
    <primitive :object="mesh" />
  </TresGroup>
</template>
