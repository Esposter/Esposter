<script setup lang="ts">
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";
import type { ToonNodeMaterial } from "genshin-engine";

import {
  WAYPOINT_STAND_IN_COLOR,
  WAYPOINT_STAND_IN_HEIGHT,
  WAYPOINT_STAND_IN_WIDTH,
} from "#src/services/map/constants";
import { setObjectSurface } from "genshin-engine";
import { BoxGeometry, Mesh } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which the pillar stands on
  getGroundHeight: (x: number, z: number) => number;
  landmark: WaypointLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
}

const { getGroundHeight, landmark, partMaterial } = defineProps<Props>();
const { arrival } = landmark;
const groundHeight = getGroundHeight(arrival.position.x, arrival.position.z);
const geometry = new BoxGeometry(WAYPOINT_STAND_IN_WIDTH, WAYPOINT_STAND_IN_HEIGHT, WAYPOINT_STAND_IN_WIDTH);
const mesh = new Mesh(geometry, partMaterial);
mesh.position.y = WAYPOINT_STAND_IN_HEIGHT / 2;
mesh.castShadow = true;
mesh.receiveShadow = true;
setObjectSurface(mesh, WAYPOINT_STAND_IN_COLOR);

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
