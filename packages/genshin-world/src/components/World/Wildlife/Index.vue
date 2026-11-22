<script setup lang="ts">
import type { Wildlife } from "#src/models/wildlife/Wildlife";
import type { WildlifeKind } from "#src/models/wildlife/WildlifeKind";
import type { GroundPoint, LightUniforms, SilhouetteSize } from "genshin-engine";
import type { DataTexture, InstancedMesh } from "three";

import { WildlifeKinds } from "#src/models/wildlife/WildlifeKind";
import { WildlifeShape } from "#src/models/wildlife/WildlifeShape";
import { WildlifeState } from "#src/models/wildlife/WildlifeState";
import {
  WILDLIFE_CAPACITY,
  WILDLIFE_CAPSULE_HEIGHT,
  WILDLIFE_CAPSULE_RADIUS,
  WILDLIFE_COLOR,
  WILDLIFE_STEP_SECONDS,
} from "#src/services/wildlife/constants";
import { getWildlifeShape } from "#src/services/wildlife/getWildlifeShape";
import { stepWildlife } from "#src/services/wildlife/stepWildlife";
import { composeHeadingMatrix } from "#src/services/world/composeHeadingMatrix";
import { useLoop } from "@tresjs/core";
import { createFixedStepLoop, createInstancedMesh, createSilhouetteGeometry, createToonMaterial } from "genshin-engine";
import { CapsuleGeometry, Matrix4, Vector3 } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each animal stands on
  getGroundHeight: (x: number, z: number) => number;
  // Whether a screen over the world holds it, as the game's menus hold its animals
  isHeld: boolean;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  // The fitted bounds of each kind's silhouette, read once as its mesh is made; a kind with none is drawn as the capsule
  silhouetteSizes?: Partial<Record<WildlifeKind, SilhouetteSize>>;
  // The point the animals run from, the character's feet, which none is given while no character stands in the world
  target?: GroundPoint | undefined;
  // The animals in the world, which the session's combat holds and this steps and draws, a struck one left out
  wildlifeList: Wildlife[];
}

const {
  getGroundHeight,
  isHeld,
  lightUniforms,
  rampTexture,
  silhouetteSizes = {},
  target,
  wildlifeList,
} = defineProps<Props>();
// A boar's charge landing on the character, which the world takes out of the character's health
const emit = defineEmits<{ charge: [] }>();
const { onBeforeRender } = useLoop();
const fixedStepLoop = createFixedStepLoop(WILDLIFE_STEP_SECONDS, () => {
  for (const wildlife of wildlifeList) if (stepWildlife(wildlife, target, WILDLIFE_STEP_SECONDS)) emit("charge");
});
const material = createToonMaterial({ color: WILDLIFE_COLOR, lightUniforms, rampTexture });
// Every animal without a silhouette is one capsule of one instanced draw, and each kind with one is an instanced draw of
// Its silhouette. Each is stood on the ground and turned to its heading, as a stand-in until its model lands. The animals
// Move, so each mesh's bounds, measured once, would cull them where they once stood
const capsuleMesh = createInstancedMesh(
  new CapsuleGeometry(WILDLIFE_CAPSULE_RADIUS, WILDLIFE_CAPSULE_HEIGHT - WILDLIFE_CAPSULE_RADIUS * 2),
  material,
  WILDLIFE_CAPACITY,
);
const silhouetteMeshes = new Map<WildlifeKind, InstancedMesh>();
for (const kind of WildlifeKinds) {
  const size = silhouetteSizes[kind];
  if (size)
    silhouetteMeshes.set(kind, createInstancedMesh(createSilhouetteGeometry(size), material, WILDLIFE_CAPACITY));
}
const meshes: InstancedMesh[] = [capsuleMesh, ...silhouetteMeshes.values()];
for (const mesh of meshes) mesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();

onBeforeRender(({ delta }) => {
  if (!isHeld) fixedStepLoop.advance(delta);
  for (const mesh of meshes) mesh.count = 0;
  for (const { heading, kind, position, state } of wildlifeList) {
    if (state === WildlifeState.Struck) continue;
    const shape = getWildlifeShape(kind, silhouetteSizes);
    const mesh = shape === WildlifeShape.Silhouette ? silhouetteMeshes.get(kind) : capsuleMesh;
    if (!mesh || mesh.count === WILDLIFE_CAPACITY) continue;
    // A capsule is centred on its height, and a silhouette stands on its base
    const lift = shape === WildlifeShape.Capsule ? WILDLIFE_CAPSULE_HEIGHT / 2 : 0;
    point.set(position.x, getGroundHeight(position.x, position.z) + lift, position.z);
    mesh.setMatrixAt(mesh.count, composeHeadingMatrix(matrix, point, heading));
    mesh.count += 1;
  }

  for (const mesh of meshes) mesh.instanceMatrix.needsUpdate = true;
});

onUnmounted(() => {
  for (const mesh of meshes) {
    mesh.geometry.dispose();
    mesh.dispose();
  }

  material.dispose();
});
</script>

<template>
  <primitive v-for="mesh in meshes" :key="mesh.uuid" :object="mesh" />
</template>
