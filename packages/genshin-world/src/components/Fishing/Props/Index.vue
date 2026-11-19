<script setup lang="ts">
import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";
import type { LightUniforms } from "genshin-engine";
import type { BufferGeometry, DataTexture } from "three";

import { computeFishingPropPlacements } from "#src/services/fishingProps/computeFishingPropPlacements";
import { FISHING_PROP_STAND_IN_COLOR } from "#src/services/fishingProps/constants";
import { createPropStandInGeometry, createToonMaterial, setObjectSurface } from "genshin-engine";
import { Group, Mesh } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each stand-in stands on
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The region's fishing-area props, each drawn as a stand-in at the place, turn and scale its record gives it
  places: FishingPropPlace[];
  rampTexture: DataTexture;
}

const { getGroundHeight, lightUniforms, places, rampTexture } = defineProps<Props>();
// One geometry per prop name, shared by each place the name holds, and one material for every stand-in, each mesh
// Carrying the colour the stand-ins share. The places are the region's, so the parent mounts this once per region
const partMaterial = createToonMaterial({ isObjectSurface: true, lightUniforms, rampTexture });
const propsGroup = new Group();
const geometries: BufferGeometry[] = [];

for (const name of new Set(places.map((place) => place.name))) {
  const geometry = createPropStandInGeometry(name);
  geometries.push(geometry);
  for (const { position, rotation, scale } of computeFishingPropPlacements(name, places, getGroundHeight)) {
    const propMesh = new Mesh(geometry, partMaterial);
    propMesh.position.set(...position);
    propMesh.quaternion.set(...rotation);
    propMesh.scale.set(...scale);
    propMesh.castShadow = true;
    propMesh.receiveShadow = true;
    setObjectSurface(propMesh, FISHING_PROP_STAND_IN_COLOR);
    propsGroup.add(propMesh);
  }
}

onUnmounted(() => {
  for (const geometry of geometries) geometry.dispose();
  partMaterial.dispose();
});
</script>

<template>
  <primitive :object="propsGroup" />
</template>
