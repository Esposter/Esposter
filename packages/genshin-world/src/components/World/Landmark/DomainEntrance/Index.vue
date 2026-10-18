<script setup lang="ts">
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { ToonNodeMaterial } from "genshin-engine";

import { setObjectSurface } from "genshin-engine";
import { BoxGeometry, Mesh } from "three";

// The stand-in kit a domain entrance draws until its own kit is built: one pillar in one colour, standing where the
// Entrance's arrival is
const STAND_IN_COLOR = "#7b8fa6";
const STAND_IN_HEIGHT = 6;
const STAND_IN_WIDTH = 2;

interface Props {
  // The world's ground at a point in its own coordinates, which the pillar stands on
  getGroundHeight: (x: number, z: number) => number;
  landmark: DomainEntranceLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
}

const { getGroundHeight, landmark, partMaterial } = defineProps<Props>();
const { arrival } = landmark;
const groundHeight = getGroundHeight(arrival.position.x, arrival.position.z);
const geometry = new BoxGeometry(STAND_IN_WIDTH, STAND_IN_HEIGHT, STAND_IN_WIDTH);
const mesh = new Mesh(geometry, partMaterial);
mesh.position.y = STAND_IN_HEIGHT / 2;
mesh.castShadow = true;
mesh.receiveShadow = true;
setObjectSurface(mesh, STAND_IN_COLOR);

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
