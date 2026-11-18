<script setup lang="ts">
import type { OfferingLandmark } from "#src/models/world/OfferingLandmark";
import type { ToonNodeMaterial } from "genshin-engine";

import {
  OFFERING_STAND_IN_COLOR,
  OFFERING_STAND_IN_HEIGHT,
  OFFERING_STAND_IN_RADIUS,
} from "#src/services/offering/constants";
import { setObjectSurface } from "genshin-engine";
import { CapsuleGeometry, Mesh } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which the offering stands on
  getGroundHeight: (x: number, z: number) => number;
  landmark: OfferingLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
}

const { getGroundHeight, landmark, partMaterial } = defineProps<Props>();
const { position } = landmark;
const groundHeight = getGroundHeight(position.x, position.z);
const geometry = new CapsuleGeometry(OFFERING_STAND_IN_RADIUS, OFFERING_STAND_IN_HEIGHT - OFFERING_STAND_IN_RADIUS * 2);
const mesh = new Mesh(geometry, partMaterial);
mesh.position.y = OFFERING_STAND_IN_HEIGHT / 2;
mesh.castShadow = true;
mesh.receiveShadow = true;
setObjectSurface(mesh, OFFERING_STAND_IN_COLOR);

onUnmounted(() => {
  geometry.dispose();
});
</script>

<template>
  <TresGroup :position="[position.x, groundHeight, position.z]">
    <primitive :object="mesh" />
  </TresGroup>
</template>
