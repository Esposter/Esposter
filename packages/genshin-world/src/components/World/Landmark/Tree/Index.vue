<script setup lang="ts">
import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { TreeImpostor } from "#src/models/world/TreeImpostor";
import type { TreeLandmark } from "#src/models/world/TreeLandmark";
import type { TreeSpecies } from "#src/models/world/TreeSpecies";
import type { LightUniforms, ToonNodeMaterial, TreeOptions } from "genshin-engine";
import type { DataTexture } from "three";

import { OAK_BARK_PART, OAK_LEAF_PART } from "#src/services/windrise/constants";
import { getWindrisePartColor } from "#src/services/windrise/getWindrisePartColor";
import { createTreeImpostor } from "#src/services/world/createTreeImpostor";
import { isWebGPURenderer, useLoop, useTres } from "@tresjs/core";
import { createTreeGeometry, IMPOSTOR_CROSSFADE_SHARE, IMPOSTOR_SWITCH_HEIGHTS, setObjectFade } from "genshin-engine";
import { Group, MathUtils, Mesh, Vector3 } from "three";

interface Props {
  // The bark and the leaves every tree draws in, each mesh masked by its own fade
  barkMaterial: ToonNodeMaterial;
  // The world's ground at a point in its own coordinates, which the tree stands on
  getGroundHeight: (x: number, z: number) => number;
  landmark: TreeLandmark;
  leafMaterial: ToonNodeMaterial;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  // The families' surfaces, the oak's painting the impostor the tree bakes
  surfaces: WindriseSurfaces;
  // Each species' impostor, baked by the first tree of the species to draw and drawn by every tree of it
  treeImpostorMap: Map<TreeSpecies, TreeImpostor>;
  // Each species as the tree kit's parameters, which the tree is grown by
  treeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions>;
}

const {
  barkMaterial,
  getGroundHeight,
  landmark,
  leafMaterial,
  lightUniforms,
  rampTexture,
  surfaces,
  treeImpostorMap,
  treeSpeciesOptionsMap,
} = defineProps<Props>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
const { heightOffset, position, rotation, species } = landmark;
const { branchGeometry, leafGeometry } = createTreeGeometry(treeSpeciesOptionsMap[species]);
const branchMesh = new Mesh(branchGeometry, barkMaterial);
const leafMesh = new Mesh(leafGeometry, leafMaterial);
const treeGroup = new Group();
treeGroup.position.set(position.x, getGroundHeight(position.x, position.z) + heightOffset, position.z);
treeGroup.rotation.y = rotation;
for (const mesh of [branchMesh, leafMesh]) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  treeGroup.add(mesh);
}
let impostorHeight = 0;
let impostorMesh: Mesh | undefined;
const treePosition = new Vector3();
// The species' impostor is baked from the tree's own mesh on the first frame the renderer can draw, unless a tree of it
// Already has, then each frame the tree is the mesh near the eye and its impostor far from it, crossing over by a dither
// Across a band round the switch, which stands a number of the tree's heights out so a larger tree keeps its mesh
// Further. The fade is each mesh's own, which the shared materials read as it is drawn
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera || !isWebGPURenderer(renderer)) return;
  if (!impostorMesh) {
    const treeImpostor =
      treeImpostorMap.get(species) ??
      createTreeImpostor(
        renderer,
        branchGeometry,
        leafGeometry,
        getWindrisePartColor(surfaces.Oak, OAK_BARK_PART),
        getWindrisePartColor(surfaces.Oak, OAK_LEAF_PART),
        lightUniforms,
        rampTexture,
      );
    treeImpostorMap.set(species, treeImpostor);
    impostorHeight = treeImpostor.impostor.height;
    impostorMesh = new Mesh(treeImpostor.geometry, treeImpostor.material);
    impostorMesh.castShadow = true;
    impostorMesh.receiveShadow = true;
    treeGroup.add(impostorMesh);
  }
  treeGroup.getWorldPosition(treePosition);
  const switchDistance = impostorHeight * IMPOSTOR_SWITCH_HEIGHTS;
  const halfBand = (switchDistance * IMPOSTOR_CROSSFADE_SHARE) / 2;
  const fade = MathUtils.smoothstep(
    activeCamera.position.distanceTo(treePosition),
    switchDistance - halfBand,
    switchDistance + halfBand,
  );
  for (const mesh of [branchMesh, leafMesh, impostorMesh]) setObjectFade(mesh, fade);
  branchMesh.visible = leafMesh.visible = fade < 1;
  impostorMesh.visible = fade > 0;
});

onUnmounted(() => {
  branchGeometry.dispose();
  leafGeometry.dispose();
});
</script>

<template>
  <primitive :object="treeGroup" />
</template>
