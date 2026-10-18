<script setup lang="ts">
import type { SceneExport } from "#src/models/scene/SceneExport";
import type { WindriseStatue } from "#src/models/windrise/WindriseStatue";
import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { LoadedRegion } from "#src/models/world/LoadedRegion";
import type { RegionPaletteMap } from "#src/models/world/RegionPaletteMap";
import type { TreeImpostor } from "#src/models/world/TreeImpostor";
import type { TreeSpecies } from "#src/models/world/TreeSpecies";
import type { LandmarkCollider, LightUniforms, TreeOptions, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import WorldLandmarkBuilding from "#src/components/World/Landmark/Building/Index.vue";
import WorldLandmarkStatue from "#src/components/World/Landmark/Statue/Index.vue";
import WorldLandmarkTree from "#src/components/World/Landmark/Tree/Index.vue";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";
import { SCENE_FAMILY_KEY } from "#src/services/scene/constants";
import { OAK_BARK_PART, OAK_LEAF_PART } from "#src/services/windrise/constants";
import { getWindrisePartColor } from "#src/services/windrise/getWindrisePartColor";
import { getWindrisePartDetail } from "#src/services/windrise/getWindrisePartDetail";
import { getExportedLandmarkIds } from "#src/services/world/getExportedLandmarkIds";
import { createDitherFadeNode, createLeafMaterial, createObjectFadeNode, createToonMaterial } from "genshin-engine";
import { Group } from "three";

interface Props {
  // The world's ground at a point in its own coordinates, which each landmark stands on
  getGroundHeight: (x: number, z: number) => number;
  // The kinds a witness render draws in place of ours, which stay mounted, unseen
  hiddenKinds?: LandmarkKind[];
  // The witness family each kind's landmarks stand for, marked on their groups so a witness render draws ours of it
  kindFamilyMap?: Partial<Record<LandmarkKind, string>>;
  // What the body and the camera collide with, given each landmark as it arrives
  landmarkCollider: LandmarkCollider;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  // The regions in reach, each with the palettes its buildings are drawn in
  regionDataMap: ReadonlyMap<string, LoadedRegion>;
  // The game's own exports the world draws, by component, in place of each landmark standing within a family of theirs
  // Its kind stands in for, which stays mounted, unseen, so the body and the camera still collide with ours
  sceneExportMap: ReadonlyMap<string, SceneExport>;
  // The statue every Statue of The Seven is drawn as
  statue: WindriseStatue;
  // The families' surfaces, the oak's painting the trees and the statue's the statues
  surfaces: WindriseSurfaces;
  // Each species as the tree kit's parameters, which a tree is grown by
  treeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions>;
  windUniforms: WindUniforms;
}

const {
  getGroundHeight,
  hiddenKinds = [],
  kindFamilyMap = {},
  landmarkCollider,
  lightUniforms,
  rampTexture,
  regionDataMap,
  sceneExportMap,
  statue,
  surfaces,
  treeSpeciesOptionsMap,
  windUniforms,
} = defineProps<Props>();
// Every landmark of every region in reach, built by its kind's kit, so a region's landmarks appear as its data
// Arrives and go when it is released
const regionLandmarks = computed(() => [...regionDataMap.values()].flatMap(({ landmarks }) => landmarks));
// The landmarks the exports draw in place of ours, read again as a region or a component's exports arrive or go
const exportedLandmarkIds = computed(() => getExportedLandmarkIds(regionLandmarks.value, sceneExportMap.values()));
// The palettes every region in reach read with its data, which each of its buildings is drawn in
const regionPalettes = computed(() => {
  const mergedRegionPalettes: Partial<RegionPaletteMap> = {};
  for (const loadedRegion of regionDataMap.values()) Object.assign(mergedRegionPalettes, loadedRegion.regionPalettes);
  return mergedRegionPalettes;
});
// The landmarks are placed in this group in the world's own coordinates, and the collider is given each as it is built,
// Once the scene holds its meshes, and lets go of each as it goes. The collider reads the group's matrices, so it is
// Made here rather than reached through a template ref's readonly proxy
const landmarksGroup = new Group();
// One material for each kind of landmark, made once and shared by every landmark of it, each mesh carrying what tells it
// From the rest: a building's or a statue's part its surface, a tree's mesh how far its impostor has faded in over it
const partMaterial = createToonMaterial({ isObjectSurface: true, lightUniforms, rampTexture });
const treeMeshMask = createDitherFadeNode(createObjectFadeNode()).not();
const barkMaterial = createToonMaterial({
  color: getWindrisePartColor(surfaces.Oak, OAK_BARK_PART),
  detail: getWindrisePartDetail(surfaces.Oak, OAK_BARK_PART),
  lightUniforms,
  rampTexture,
});
barkMaterial.maskNode = treeMeshMask;
const leafMaterial = createLeafMaterial(
  {
    color: getWindrisePartColor(surfaces.Oak, OAK_LEAF_PART),
    detail: getWindrisePartDetail(surfaces.Oak, OAK_LEAF_PART),
    lightUniforms,
    rampTexture,
  },
  windUniforms,
  treeMeshMask,
);
const treeImpostorMap = new Map<TreeSpecies, TreeImpostor>();

// Gives the collider the landmarks that arrived since the last sync, whose colliders it builds on the main thread, timed
// As the load step `landmark-colliders`. The build is synchronous, so the measure is written as it returns
const syncLandmarkColliders = (): void => {
  const start = performance.now();
  landmarkCollider.syncLandmarks(landmarksGroup);
  performance.measure(`${LOAD_STEP_MEASURE_PREFIX}landmark-colliders`, { start });
};

onMounted(() => {
  syncLandmarkColliders();
});

watch(regionLandmarks, () => syncLandmarkColliders(), { flush: "post" });

onUnmounted(() => {
  partMaterial.dispose();
  barkMaterial.dispose();
  leafMaterial.dispose();
  for (const { geometry, impostor, material } of treeImpostorMap.values()) {
    geometry.dispose();
    material.dispose();
    impostor.albedoTarget.dispose();
    impostor.normalTarget.dispose();
  }
});
</script>

<template>
  <primitive :object="landmarksGroup">
    <TresGroup
      v-for="landmark of regionLandmarks"
      :key="landmark.id"
      :visible="!hiddenKinds.includes(landmark.kind) && !exportedLandmarkIds.has(landmark.id)"
      :user-data="{ [SCENE_FAMILY_KEY]: kindFamilyMap[landmark.kind] }"
    >
      <WorldLandmarkTree
        v-if="landmark.kind === LandmarkKind.Tree"
        :bark-material
        :get-ground-height
        :landmark
        :leaf-material
        :light-uniforms
        :ramp-texture
        :surfaces
        :tree-impostor-map
        :tree-species-options-map
      />
      <WorldLandmarkStatue
        v-else-if="landmark.kind === LandmarkKind.StatueOfTheSeven"
        :get-ground-height
        :landmark
        :part-material
        :statue
        :surfaces
      />
      <WorldLandmarkBuilding
        v-else-if="landmark.kind === LandmarkKind.Building"
        :get-ground-height
        :landmark
        :part-material
        :region-palettes
      />
    </TresGroup>
  </primitive>
</template>
