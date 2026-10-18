<script setup lang="ts">
import {
  HOME_REALM_EXIT_POINT,
  HOME_REALM_GROUND_HEIGHT,
  HOME_REALM_ISLAND_RADIUS,
  HOME_REALM_STEWARD_POINT,
} from "#src/services/home/constants";
</script>

<template>
  <TresAmbientLight :intensity="1" />
  <TresDirectionalLight :intensity="2" :position="[10, 20, 10]" />
  <!-- The island is a flat disc of the realm's ground, the stand-in for the realm's layout until the PC exports it -->
  <TresMesh :position="[0, HOME_REALM_GROUND_HEIGHT - 0.5, 0]">
    <TresCylinderGeometry :args="[HOME_REALM_ISLAND_RADIUS, HOME_REALM_ISLAND_RADIUS, 1, 48]" />
    <TresMeshStandardMaterial color="#8fbf7a" />
  </TresMesh>
  <TresMesh :position="[HOME_REALM_STEWARD_POINT.x, HOME_REALM_GROUND_HEIGHT + 1, HOME_REALM_STEWARD_POINT.z]">
    <TresBoxGeometry :args="[1, 2, 1]" />
    <TresMeshStandardMaterial color="#d9c7a0" />
  </TresMesh>
  <TresMesh :position="[HOME_REALM_EXIT_POINT.x, HOME_REALM_GROUND_HEIGHT + 0.5, HOME_REALM_EXIT_POINT.z]">
    <TresBoxGeometry :args="[1, 1, 1]" />
    <TresMeshStandardMaterial color="#6aa7d6" />
  </TresMesh>
</template>
