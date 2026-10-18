<script setup lang="ts">
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { ToonNodeMaterial } from "genshin-engine";

import {
  DOMAIN_ENTRANCE_STAND_IN_COLOR,
  DOMAIN_ENTRANCE_STAND_IN_HEIGHT,
  DOMAIN_ENTRANCE_STAND_IN_WIDTH,
} from "#src/services/domains/constants";
import { setObjectSurface } from "genshin-engine";
import { BoxGeometry, Mesh } from "three";

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
const geometry = new BoxGeometry(
  DOMAIN_ENTRANCE_STAND_IN_WIDTH,
  DOMAIN_ENTRANCE_STAND_IN_HEIGHT,
  DOMAIN_ENTRANCE_STAND_IN_WIDTH,
);
const mesh = new Mesh(geometry, partMaterial);
mesh.position.y = DOMAIN_ENTRANCE_STAND_IN_HEIGHT / 2;
mesh.castShadow = true;
mesh.receiveShadow = true;
setObjectSurface(mesh, DOMAIN_ENTRANCE_STAND_IN_COLOR);

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
