<script setup lang="ts">
import type { RockLandmark } from "#src/models/world/RockLandmark";
import type { ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry } from "three";

import { ROCK_STAND_IN_COLOR } from "#src/services/world/constants";
import { setObjectSurface } from "genshin-engine";
import { Mesh } from "three";

interface Props {
  // The rock's geometry, built once from its hull's boxes and shared by every place the hull stands in
  geometry: BufferGeometry;
  landmark: RockLandmark;
  // The one material every landmark's part draws in, each in the surface its mesh carries
  partMaterial: ToonNodeMaterial;
}

const { geometry, landmark, partMaterial } = defineProps<Props>();
// The rock stands where its record places it, turned and scaled as the record gives it, with no ground beneath it to
// Find, since the record holds its place in the world's own coordinates
const rockMesh = new Mesh(geometry, partMaterial);
rockMesh.position.set(...landmark.place);
rockMesh.quaternion.set(...landmark.turn);
rockMesh.scale.set(...landmark.scale);
rockMesh.castShadow = true;
rockMesh.receiveShadow = true;
setObjectSurface(rockMesh, ROCK_STAND_IN_COLOR);
</script>

<template>
  <primitive :object="rockMesh" />
</template>
