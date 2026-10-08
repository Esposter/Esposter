<script setup lang="ts">
import type { RegionData } from "#src/models/world/RegionData";
import type { LandmarkCollider, LightUniforms, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import WorldLandmarkBuilding from "#src/components/World/Landmark/Building/Index.vue";
import WorldLandmarkStatue from "#src/components/World/Landmark/Statue/Index.vue";
import WorldLandmarkTree from "#src/components/World/Landmark/Tree/Index.vue";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { SCENE_FAMILY_KEY } from "#src/services/scene/constants";
import { Group } from "three";

interface Props {
  // The kinds a witness render draws in place of ours, which stay mounted, unseen
  hiddenKinds?: LandmarkKind[];
  // The witness family each kind's landmarks stand for, marked on their groups so a witness render draws ours of it
  kindFamilyMap?: Partial<Record<LandmarkKind, string>>;
  // What the body and the camera collide with, given each landmark as it arrives
  landmarkCollider: LandmarkCollider;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  regionDataMap: ReadonlyMap<string, RegionData>;
  windUniforms: WindUniforms;
}

const {
  hiddenKinds = [],
  kindFamilyMap = {},
  landmarkCollider,
  lightUniforms,
  rampTexture,
  regionDataMap,
  windUniforms,
} = defineProps<Props>();
// Every landmark of every region in reach, built by its kind's kit, so a region's landmarks appear as its data
// Arrives and go when it is released
const regionLandmarks = computed(() => [...regionDataMap.values()].flatMap(({ landmarks }) => landmarks));
// The landmarks are placed in this group in the world's own coordinates, and the collider is given each as it is built,
// Once the scene holds its meshes, and lets go of each as it goes. The collider reads the group's matrices, so it is
// Made here rather than reached through a template ref's readonly proxy
const landmarksGroup = new Group();

onMounted(() => {
  landmarkCollider.syncLandmarks(landmarksGroup);
});

watch(regionLandmarks, () => landmarkCollider.syncLandmarks(landmarksGroup), { flush: "post" });
</script>

<template>
  <primitive :object="landmarksGroup">
    <TresGroup
      v-for="landmark of regionLandmarks"
      :key="landmark.id"
      :visible="!hiddenKinds.includes(landmark.kind)"
      :user-data="{ [SCENE_FAMILY_KEY]: kindFamilyMap[landmark.kind] }"
    >
      <WorldLandmarkTree
        v-if="landmark.kind === LandmarkKind.Tree"
        :landmark
        :light-uniforms
        :ramp-texture
        :wind-uniforms
      />
      <WorldLandmarkStatue
        v-else-if="landmark.kind === LandmarkKind.StatueOfTheSeven"
        :landmark
        :light-uniforms
        :ramp-texture
      />
      <WorldLandmarkBuilding
        v-else-if="landmark.kind === LandmarkKind.Building"
        :landmark
        :light-uniforms
        :ramp-texture
      />
    </TresGroup>
  </primitive>
</template>
