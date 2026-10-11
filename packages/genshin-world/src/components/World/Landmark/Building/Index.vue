<script setup lang="ts">
import type { BuildingLandmark } from "#src/models/world/BuildingLandmark";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";
import type { ToonNodeMaterial } from "genshin-engine";

import { BuildingKitPartsMap } from "#src/services/world/BuildingKitPartsMap";
import { setObjectSurface } from "genshin-engine";
import { Mesh } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which the building stands on
  getGroundHeight: (x: number, z: number) => number;
  landmark: BuildingLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
  // The building colours each region's palette record samples, which its kit draws its buildings in
  regionPalettes: RegionPaletteMap;
}

const { getGroundHeight, landmark, partMaterial, regionPalettes } = defineProps<Props>();
const { building, heightOffset, position, rotation } = landmark;
const groundHeight = getGroundHeight(position.x, position.z);
// The building's region kit decides its parts, each drawn in its own colour
const buildingMeshes = BuildingKitPartsMap[building.kit](building.options as never, regionPalettes).map(
  ({ color, geometry }) => {
    const mesh = new Mesh(geometry, partMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    setObjectSurface(mesh, color);
    return mesh;
  },
);

onUnmounted(() => {
  for (const { geometry } of buildingMeshes) geometry.dispose();
});
</script>

<template>
  <TresGroup :position="[position.x, groundHeight + heightOffset, position.z]" :rotation-y="rotation">
    <primitive v-for="(mesh, index) of buildingMeshes" :key="index" :object="mesh" />
  </TresGroup>
</template>
