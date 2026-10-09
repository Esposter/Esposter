<script setup lang="ts">
import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { WildlifePlace } from "#src/models/wildlife/WildlifePlace";
import type { GroundPoint, LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import {
  WILDLIFE_CAPACITY,
  WILDLIFE_CAPSULE_HEIGHT,
  WILDLIFE_CAPSULE_RADIUS,
  WILDLIFE_COLOR,
  WILDLIFE_STEP_SECONDS,
} from "#src/services/wildlife/constants";
import { createWildlife } from "#src/services/wildlife/createWildlife";
import { stepWildlife } from "#src/services/wildlife/stepWildlife";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { useLoop } from "@tresjs/core";
import { createFixedStepLoop, createToonMaterial } from "genshin-engine";
import { CapsuleGeometry, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";

interface Props {
  // Whether a screen over the world holds it, as the game's menus hold its animals
  isHeld?: true;
  lightUniforms: LightUniforms;
  // The animals' places in the region, each animal stood at its place and running from the character as it comes near
  places: readonly WildlifePlace[];
  rampTexture: DataTexture;
  // The point the animals run from, the character's feet, which none is given while no character stands in the world
  target?: GroundPoint;
}

const { isHeld, lightUniforms, places, rampTexture, target } = defineProps<Props>();
const { onBeforeRender } = useLoop();
// Each place's animal, made once as the places are, so each keeps its flight across the frames
const wildlifeList: Wildlife[] = places.map((place) => createWildlife(place));
const fixedStepLoop = createFixedStepLoop(WILDLIFE_STEP_SECONDS, () => {
  for (const wildlife of wildlifeList) stepWildlife(wildlife, target, WILDLIFE_STEP_SECONDS);
});
// Every animal is one capsule of one instanced draw, stood on the ground and turned to its heading, as a stand-in until
// Its model lands. The capsules move, so the mesh's bounds, measured once, would cull them where they once stood
const wildlifeMesh = new InstancedMesh(
  new CapsuleGeometry(WILDLIFE_CAPSULE_RADIUS, WILDLIFE_CAPSULE_HEIGHT - WILDLIFE_CAPSULE_RADIUS * 2),
  createToonMaterial({ color: WILDLIFE_COLOR, lightUniforms, rampTexture }),
  WILDLIFE_CAPACITY,
);
wildlifeMesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();
const rotation = new Quaternion();
const scale = new Vector3(1, 1, 1);
const up = new Vector3(0, 1, 0);

onBeforeRender(({ delta }) => {
  if (!isHeld) fixedStepLoop.advance(delta);
  let count = 0;
  for (const { heading, position } of wildlifeList) {
    if (count === WILDLIFE_CAPACITY) break;
    point.set(position.x, getWorldHeight(position.x, position.z) + WILDLIFE_CAPSULE_HEIGHT / 2, position.z);
    wildlifeMesh.setMatrixAt(count, matrix.compose(point, rotation.setFromAxisAngle(up, heading), scale));
    count += 1;
  }

  wildlifeMesh.count = count;
  wildlifeMesh.instanceMatrix.needsUpdate = true;
});

onUnmounted(() => {
  wildlifeMesh.geometry.dispose();
  wildlifeMesh.material.dispose();
  wildlifeMesh.dispose();
});
</script>

<template>
  <primitive :object="wildlifeMesh" />
</template>
