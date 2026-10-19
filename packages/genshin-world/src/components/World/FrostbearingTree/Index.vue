<script setup lang="ts">
import type { FrostbearingTreePlace } from "#src/models/offering/FrostbearingTreePlace";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { useStandInInstances } from "#src/composables/useStandInInstances";
import {
  FROSTBEARING_TREE_STAND_IN_COLOR,
  FROSTBEARING_TREE_STAND_IN_HEIGHT,
  FROSTBEARING_TREE_STAND_IN_RADIUS,
} from "#src/services/offering/constants";
import { createInstancedMesh, createToonMaterial } from "genshin-engine";
import { CapsuleGeometry } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each stand-in stands on
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The Frostbearing Trees' places in the world, each stood in at its place
  places: readonly FrostbearingTreePlace[];
  rampTexture: DataTexture;
}

const { getGroundHeight, lightUniforms, places, rampTexture } = defineProps<Props>();
// Every tree is one capsule of one instanced draw sharing one material, stood on the ground until its model lands. The
// Stand-ins are placed anywhere in the world, so the mesh's bounds, measured from its geometry alone, would cull them
const treeMesh = createInstancedMesh(
  new CapsuleGeometry(
    FROSTBEARING_TREE_STAND_IN_RADIUS,
    FROSTBEARING_TREE_STAND_IN_HEIGHT - FROSTBEARING_TREE_STAND_IN_RADIUS * 2,
  ),
  createToonMaterial({ color: FROSTBEARING_TREE_STAND_IN_COLOR, lightUniforms, rampTexture }),
  places.length,
);
treeMesh.frustumCulled = false;

// The places are read once as the world opens, so the instances are written once for them
useStandInInstances(treeMesh, () => places, getGroundHeight, FROSTBEARING_TREE_STAND_IN_HEIGHT / 2);
</script>

<template>
  <primitive :object="treeMesh" />
</template>
