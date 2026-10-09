<script setup lang="ts">
import type { TreeLandmark } from "#src/models/world/TreeLandmark";
import type { Impostor, LightUniforms, ToonNodeMaterial, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { BARK_COLOR, BARK_DETAIL, LEAF_COLOR, LEAF_DETAIL } from "#src/services/windrise/constants";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { TreeSpeciesOptionsMap } from "#src/services/world/TreeSpeciesOptionsMap";
import { isWebGPURenderer, useLoop, useTres } from "@tresjs/core";
import {
  bakeImpostor,
  createDitherFadeNode,
  createImpostorMaterial,
  createLeafMaterial,
  createLeafShapeNode,
  createToonMaterial,
  createTreeGeometry,
  IMPOSTOR_CROSSFADE_SHARE,
  IMPOSTOR_RESOLUTION,
  IMPOSTOR_SWITCH_HEIGHTS,
} from "genshin-engine";
import { Group, MathUtils, Mesh, PlaneGeometry, Vector3 } from "three";
import { uniform } from "three/tsl";

interface Props {
  landmark: TreeLandmark;
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
  windUniforms: WindUniforms;
}

const { landmark, lightUniforms, rampTexture, windUniforms } = defineProps<Props>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
const { heightOffset, position, rotation, species } = landmark;
const { branchGeometry, leafGeometry } = createTreeGeometry(TreeSpeciesOptionsMap[species]);
// How far the impostor has faded in over the mesh, which draws the pixels it does not
const fade = uniform(0);
const meshMask = createDitherFadeNode(fade).not();
const barkMaterial = createToonMaterial({ color: BARK_COLOR, detail: BARK_DETAIL, lightUniforms, rampTexture });
barkMaterial.maskNode = meshMask;
const leafMaterial = createLeafMaterial(
  { color: LEAF_COLOR, detail: LEAF_DETAIL, lightUniforms, rampTexture },
  windUniforms,
);
leafMaterial.maskNode = meshMask;
const branchMesh = new Mesh(branchGeometry, barkMaterial);
const leafMesh = new Mesh(leafGeometry, leafMaterial);
const treeGroup = new Group();
treeGroup.position.set(position.x, getWorldHeight(position.x, position.z) + heightOffset, position.z);
treeGroup.rotation.y = rotation;
for (const mesh of [branchMesh, leafMesh]) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  treeGroup.add(mesh);
}
let impostor: Impostor | undefined;
let impostorMesh: Mesh<PlaneGeometry, ToonNodeMaterial> | undefined;
const treePosition = new Vector3();
// The impostor is baked from the tree's own mesh on the first frame the renderer can draw, then each frame the tree is
// The mesh near the eye and its impostor far from it, crossing over by a dither across a band round the switch, which
// Stands a number of the tree's heights out so a larger tree keeps its mesh further
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera || !isWebGPURenderer(renderer)) return;
  if (!impostor || !impostorMesh) {
    impostor = bakeImpostor(
      renderer,
      [
        { color: BARK_COLOR, geometry: branchGeometry },
        { color: LEAF_COLOR, geometry: leafGeometry, opacityNode: createLeafShapeNode() },
      ],
      IMPOSTOR_RESOLUTION,
    );
    const { bottom, height, width } = impostor;
    impostorMesh = new Mesh(
      new PlaneGeometry(width, height).translate(0, bottom + height / 2, 0),
      createImpostorMaterial({ fade, impostor, lightUniforms, rampTexture }),
    );
    impostorMesh.castShadow = true;
    impostorMesh.receiveShadow = true;
    treeGroup.add(impostorMesh);
  }
  treeGroup.getWorldPosition(treePosition);
  const switchDistance = impostor.height * IMPOSTOR_SWITCH_HEIGHTS;
  const halfBand = (switchDistance * IMPOSTOR_CROSSFADE_SHARE) / 2;
  fade.value = MathUtils.smoothstep(
    activeCamera.position.distanceTo(treePosition),
    switchDistance - halfBand,
    switchDistance + halfBand,
  );
  branchMesh.visible = leafMesh.visible = fade.value < 1;
  impostorMesh.visible = fade.value > 0;
});

onUnmounted(() => {
  branchGeometry.dispose();
  leafGeometry.dispose();
  barkMaterial.dispose();
  leafMaterial.dispose();
  impostor?.albedoTarget.dispose();
  impostor?.normalTarget.dispose();
  impostorMesh?.geometry.dispose();
  impostorMesh?.material.dispose();
});
</script>

<template>
  <primitive :object="treeGroup" />
</template>
