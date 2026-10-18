<script setup lang="ts">
import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { GroundPoint, LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import {
  WILDLIFE_CAPACITY,
  WILDLIFE_CAPSULE_HEIGHT,
  WILDLIFE_CAPSULE_RADIUS,
  WILDLIFE_COLOR,
  WILDLIFE_STEP_SECONDS,
} from "#src/services/wildlife/constants";
import { stepWildlife } from "#src/services/wildlife/stepWildlife";
import { composeHeadingMatrix } from "#src/services/world/composeHeadingMatrix";
import { useLoop } from "@tresjs/core";
import { createFixedStepLoop, createInstancedMesh, createToonMaterial } from "genshin-engine";
import { CapsuleGeometry, Matrix4, Vector3 } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each animal stands on
  getGroundHeight: (x: number, z: number) => number;
  // Whether a screen over the world holds it, as the game's menus hold its animals
  isHeld?: true;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  // The point the animals run from, the character's feet, which none is given while no character stands in the world
  target?: GroundPoint;
  // The animals in the world, which the session's combat holds and this steps and draws, a struck one left out
  wildlifeList: Wildlife[];
}

const { getGroundHeight, isHeld, lightUniforms, rampTexture, target, wildlifeList } = defineProps<Props>();
const { onBeforeRender } = useLoop();
const fixedStepLoop = createFixedStepLoop(WILDLIFE_STEP_SECONDS, () => {
  for (const wildlife of wildlifeList) stepWildlife(wildlife, target, WILDLIFE_STEP_SECONDS);
});
// Every animal is one capsule of one instanced draw, stood on the ground and turned to its heading, as a stand-in until
// Its model lands. The capsules move, so the mesh's bounds, measured once, would cull them where they once stood
const wildlifeMesh = createInstancedMesh(
  new CapsuleGeometry(WILDLIFE_CAPSULE_RADIUS, WILDLIFE_CAPSULE_HEIGHT - WILDLIFE_CAPSULE_RADIUS * 2),
  createToonMaterial({ color: WILDLIFE_COLOR, lightUniforms, rampTexture }),
  WILDLIFE_CAPACITY,
);
wildlifeMesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();

onBeforeRender(({ delta }) => {
  if (!isHeld) fixedStepLoop.advance(delta);
  let count = 0;
  for (const { heading, position, state } of wildlifeList) {
    if (count === WILDLIFE_CAPACITY) break;
    if (state === WildlifeState.Struck) continue;
    point.set(position.x, getGroundHeight(position.x, position.z) + WILDLIFE_CAPSULE_HEIGHT / 2, position.z);
    wildlifeMesh.setMatrixAt(count, composeHeadingMatrix(matrix, point, heading));
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
