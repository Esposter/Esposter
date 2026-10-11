<script setup lang="ts">
import type { Interactable } from "#src/models/interaction/Interactable";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture, InstancedMesh, Scene } from "three";

import { createSightProxy } from "#src/services/elementalSight/createSightProxy";
import {
  CHEST_STAND_IN_CAPACITY,
  CHEST_STAND_IN_COLOR,
  CHEST_STAND_IN_SIZE,
  DROP_STAND_IN_COLOR,
  DROP_STAND_IN_RADIUS,
  INTERACTABLE_CAPACITY,
  RESIDENT_STAND_IN_COLOR,
} from "#src/services/interaction/constants";
import { PROVISIONAL_LOCOMOTION } from "#src/services/world/locomotion/constants";
import { watchImmediate } from "@vueuse/core";
import { createInstancedMesh, createToonMaterial } from "genshin-engine";
import { InteractionKind } from "genshin-interface";
import { BoxGeometry, CapsuleGeometry, Matrix4, Quaternion, SphereGeometry, Vector3 } from "three";

interface Props {
  // The drops and the residents in the world, each a row of the prompts
  interactables: Interactable[];
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  // The scene the sight's mask is drawn from, which the stand-ins of the drops and the residents are added to
  sightScene: Scene;
}

const { interactables, lightUniforms, rampTexture, sightScene } = defineProps<Props>();
// A drop is a small sphere on the ground, a chest a box, and a resident the capsule every body stands in as until it is
// Measured
const dropMesh = createInstancedMesh(
  new SphereGeometry(DROP_STAND_IN_RADIUS),
  createToonMaterial({ color: DROP_STAND_IN_COLOR, lightUniforms, rampTexture }),
  INTERACTABLE_CAPACITY,
);
const chestMesh = createInstancedMesh(
  new BoxGeometry(CHEST_STAND_IN_SIZE, CHEST_STAND_IN_SIZE, CHEST_STAND_IN_SIZE),
  createToonMaterial({ color: CHEST_STAND_IN_COLOR, lightUniforms, rampTexture }),
  CHEST_STAND_IN_CAPACITY,
);
const residentMesh = createInstancedMesh(
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
chestMesh.frustumCulled = false;
// The sight's stand-ins of both, drawn from the same points and lit white, since no element is on a drop or a resident
const dropSightProxy = createSightProxy(dropMesh);
const chestSightProxy = createSightProxy(chestMesh);
const residentSightProxy = createSightProxy(residentMesh);
sightScene.add(dropSightProxy, chestSightProxy, residentSightProxy);
const matrix = new Matrix4();
const point = new Vector3();
const scale = new Vector3(1, 1, 1);
const rotation = new Quaternion();
// Each stand-in stands on its row's ground point, lifted by the half of its own height
const writeStandIns = (mesh: InstancedMesh, sightProxy: InstancedMesh, rows: Interactable[], lift: number) => {
  mesh.count = rows.length;
  sightProxy.count = rows.length;
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
      dropSightProxy,
      rows.filter(({ kind }) => kind === InteractionKind.PickUp).slice(0, INTERACTABLE_CAPACITY),
      DROP_STAND_IN_RADIUS,
    );
    writeStandIns(
      chestMesh,
      chestSightProxy,
      rows.filter(({ kind }) => kind === InteractionKind.Open).slice(0, CHEST_STAND_IN_CAPACITY),
      CHEST_STAND_IN_SIZE / 2,
    );
    writeStandIns(
      residentMesh,
      residentSightProxy,
      rows.filter(({ kind }) => kind === InteractionKind.Talk).slice(0, INTERACTABLE_CAPACITY),
      PROVISIONAL_LOCOMOTION.capsuleHeight / 2,
    );
  },
);

onUnmounted(() => {
  for (const sightProxy of [dropSightProxy, chestSightProxy, residentSightProxy]) {
    sightScene.remove(sightProxy);
    sightProxy.material.dispose();
    sightProxy.dispose();
  }
  for (const mesh of [dropMesh, chestMesh, residentMesh]) {
    mesh.geometry.dispose();
    mesh.material.dispose();
    mesh.dispose();
  }
});
</script>

<template>
  <primitive :object="dropMesh" />
  <primitive :object="chestMesh" />
  <primitive :object="residentMesh" />
</template>
