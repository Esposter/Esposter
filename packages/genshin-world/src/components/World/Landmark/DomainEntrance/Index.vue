<script setup lang="ts">
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { ToonNodeMaterial } from "genshin-engine";

import WorldLandmarkPillar from "#src/components/World/Landmark/Pillar/Index.vue";
import {
  DOMAIN_ENTRANCE_STAND_IN_COLOR,
  DOMAIN_ENTRANCE_STAND_IN_HEIGHT,
  DOMAIN_ENTRANCE_STAND_IN_WIDTH,
} from "#src/services/domains/constants";

interface Props {
  // The world's ground at a point in its own coordinates, which the pillar stands on
  getGroundHeight: (x: number, z: number) => number;
  landmark: DomainEntranceLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
}

const { getGroundHeight, landmark, partMaterial } = defineProps<Props>();
</script>

<template>
  <WorldLandmarkPillar
    :arrival="landmark.arrival"
    :color="DOMAIN_ENTRANCE_STAND_IN_COLOR"
    :get-ground-height
    :height="DOMAIN_ENTRANCE_STAND_IN_HEIGHT"
    :part-material
    :width="DOMAIN_ENTRANCE_STAND_IN_WIDTH"
  />
</template>
