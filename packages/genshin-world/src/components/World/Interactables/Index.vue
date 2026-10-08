<script setup lang="ts">
import type { Interactable } from "#src/models/interaction/Interactable";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import {
  DROP_STAND_IN_COLOR,
  DROP_STAND_IN_RADIUS,
  INTERACTABLE_CAPACITY,
  RESIDENT_STAND_IN_COLOR,
} from "#src/services/interaction/constants";
import { PROVISIONAL_LOCOMOTION } from "#src/services/world/locomotion/constants";
import { watchImmediate } from "@vueuse/core";
import { createToonMaterial } from "genshin-engine";
import { InteractionKind } from "genshin-interface";
import { CapsuleGeometry, InstancedMesh, Matrix4, Quaternion, SphereGeometry, Vector3 } from "three";

interface Props {
  // The drops and the residents in the world, each a row of the prompts
  interactables: Interactable[];
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { interactables, lightUniforms, rampTexture } = defineProps<Props>();
// A drop is a small sphere on the ground, and a resident the capsule every body stands in as until it is measured
const dropMesh = new InstancedMesh(
  new SphereGeometry(DROP_STAND_IN_RADIUS),
  createToonMaterial({ color: DROP_STAND_IN_COLOR, lightUniforms, rampTexture }),
  INTERACTABLE_CAPACITY,
);
const residentMesh = new InstancedMesh(
  new CapsuleGeometry(
    PROVISIONAL_LOCOMOTION.capsuleRadius,
    PROVISIONAL_LOCOMOTION.capsuleHeight - PROVISIONAL_LOCOMOTION.capsuleRadius * 2,
  ),
  createToonMaterial({ color: RESIDENT_STAND_IN_COLOR, lightUniforms, rampTexture }),
  INTERACTABLE_CAPACITY,
);
// The stand-ins are placed anywhere in the world, so the mesh's bounds, measured from its geometry alone, would cull them
dropMesh.frustumCulled = false;
residentMesh.frustumCulled = false;
const matrix = new Matrix4();
const point = new Vector3();
const scale = new Vector3(1, 1, 1);
const rotation = new Quaternion();
// Each stand-in stands on its row's ground point, lifted by the half of its own height
const writeStandIns = (mesh: InstancedMesh, rows: Interactable[], lift: number) => {
  mesh.count = rows.length;
  for (const [index, { position }] of rows.entries()) {
    point.set(position.x, position.y + lift, position.z);
    mesh.setMatrixAt(index, matrix.compose(point, rotation, scale));
  }
  mesh.instanceMatrix.needsUpdate = true;
};

watchImmediate(
  () => interactables,
  (rows) => {
    writeStandIns(
      dropMesh,
      rows.filter(({ kind }) => kind === InteractionKind.PickUp).slice(0, INTERACTABLE_CAPACITY),
      DROP_STAND_IN_RADIUS,
    );
    writeStandIns(
      residentMesh,
      rows.filter(({ kind }) => kind === InteractionKind.Talk).slice(0, INTERACTABLE_CAPACITY),
      PROVISIONAL_LOCOMOTION.capsuleHeight / 2,
    );
  },
);

onUnmounted(() => {
  for (const mesh of [dropMesh, residentMesh]) {
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh.dispose();
  }
});
</script>

<template>
  <primitive :object="dropMesh" />
  <primitive :object="residentMesh" />
</template>
