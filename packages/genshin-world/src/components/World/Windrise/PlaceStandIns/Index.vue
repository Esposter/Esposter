<script setup lang="ts">
import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";
import type { OculusPlace } from "#src/models/oculus/OculusPlace";
import type { LightUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import WorldStandIns from "#src/components/World/StandIns/Index.vue";
import { StandInShape } from "#src/models/world/StandInShape";
import { MINING_OUTCROP_STAND_IN_COLOR, MINING_OUTCROP_STAND_IN_RADIUS } from "#src/services/gathering/constants";
import { OCULUS_STAND_IN_COLOR, OCULUS_STAND_IN_RADIUS } from "#src/services/statue/constants";

interface Props {
  // The world's ground at a point in its own coordinates, which each stand-in floats above
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The mining outcrops standing now, each stood in as a rock at its place
  miningOutcropPlaces: GatheringPlace[];
  // The Oculi not yet found, each stood in at its place
  oculusPlaces: OculusPlace[];
  rampTexture: DataTexture;
}

defineProps<Props>();
</script>

<template>
  <WorldStandIns
    v-if="oculusPlaces.length > 0"
    :key="oculusPlaces.length"
    :color="OCULUS_STAND_IN_COLOR"
    :get-ground-height
    :light-uniforms
    :places="oculusPlaces"
    :radius="OCULUS_STAND_IN_RADIUS"
    :ramp-texture
    :shape="StandInShape.Sphere"
  />
  <WorldStandIns
    v-if="miningOutcropPlaces.length > 0"
    :key="miningOutcropPlaces.length"
    :color="MINING_OUTCROP_STAND_IN_COLOR"
    :get-ground-height
    :light-uniforms
    :places="miningOutcropPlaces"
    :radius="MINING_OUTCROP_STAND_IN_RADIUS"
    :ramp-texture
    :shape="StandInShape.Rock"
  />
</template>
