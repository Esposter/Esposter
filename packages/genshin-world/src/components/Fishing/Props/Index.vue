<script setup lang="ts">
import type { FishingPropPlace } from "#src/models/fishing/FishingPropPlace";
import type { LightUniforms } from "genshin-engine";
import type { BufferGeometry, DataTexture } from "three";

import { computeFishingPropPlacements } from "#src/services/fishingProps/computeFishingPropPlacements";
import { FISHING_PROP_STAND_IN_COLOR } from "#src/services/fishingProps/constants";
import { watchImmediate } from "@vueuse/core";
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
const geometries = new Map<string, BufferGeometry>();

for (const name of new Set(places.map((place) => place.name))) geometries.set(name, createPropStandInGeometry(name));
// The stand-ins are written again whenever the ground under a place changes, as a region's ground is laid after its data,
// So the placements are read through the ground getter inside the watch rather than once here
watchImmediate(
  () =>
    [...geometries].flatMap(([name, geometry]) =>
      computeFishingPropPlacements(name, places, getGroundHeight).map((placement) => ({ geometry, placement })),
    ),
  (placements) => {
    propsGroup.clear();
    for (const { geometry, placement } of placements) {
      const propMesh = new Mesh(geometry, partMaterial);
      propMesh.position.set(...placement.position);
      propMesh.quaternion.set(...placement.rotation);
      propMesh.scale.set(...placement.scale);
      propMesh.castShadow = true;
      propMesh.receiveShadow = true;
      setObjectSurface(propMesh, FISHING_PROP_STAND_IN_COLOR);
      propsGroup.add(propMesh);
    }
  },
);

onUnmounted(() => {
  for (const geometry of geometries.values()) geometry.dispose();
  partMaterial.dispose();
});
</script>

<template>
  <primitive :object="propsGroup" />
</template>
