<script setup lang="ts">
import type { Impostor, LightUniforms, ToonNodeMaterial } from "genshin-engine";
import type { BufferGeometry, DataTexture } from "three";

import plantsData from "#src/data/windrise/plants.json";
import { TreeSpecies } from "#src/models/world/TreeSpecies";
import {
  PLANT_DOME_COLOR,
  PLANT_DOME_DETAIL,
  PLANT_DOME_SCALE,
  TREE_PREFAB_NAME_PART,
} from "#src/services/windrise/constants";
import { bakeTreeImpostor } from "#src/services/world/bakeTreeImpostor";
import { getWorldHeight } from "#src/services/world/getWorldHeight";
import { TreeSpeciesOptionsMap } from "#src/services/world/TreeSpeciesOptionsMap";
import { isWebGPURenderer, useLoop, useTres } from "@tresjs/core";
import { createImpostorMaterial, createToonMaterial, createTreeGeometry } from "genshin-engine";
import { Euler, Group, InstancedMesh, Matrix4, PlaneGeometry, Quaternion, SphereGeometry, Vector3 } from "three";
import { uniform } from "three/tsl";

type PlantPlaces = (typeof plantsData.plants)[number]["places"];

interface Props {
  lightUniforms: LightUniforms;
  rampTexture: DataTexture;
}

const { lightUniforms, rampTexture } = defineProps<Props>();
const { renderer } = useTres();
const { onBeforeRender } = useLoop();
const plantsGroup = new Group();
const matrix = new Matrix4();
const position = new Vector3();
const quaternion = new Quaternion();
const euler = new Euler();
const scale = new Vector3();
const domeFactor = new Vector3(...PLANT_DOME_SCALE);
const domeGeometry = new SphereGeometry(1, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2);
const domeMaterial = createToonMaterial({
  color: PLANT_DOME_COLOR,
  detail: PLANT_DOME_DETAIL,
  lightUniforms,
  rampTexture,
});
const oakTreeGeometries: BufferGeometry[] = [];
const oakTreeMaterials: ToonNodeMaterial[] = [];
let oakImpostor: Impostor | undefined;
// Each place's matrix, a prefab's instances in one instanced draw: its ground under it, its turn about the vertical and
// Its scale, with the factor a stand-in's own geometry takes
const addInstances = (
  geometry: BufferGeometry,
  material: ToonNodeMaterial,
  places: PlantPlaces,
  factor: Vector3,
): void => {
  const mesh = new InstancedMesh(geometry, material, places.length);
  for (const [
    index,
    {
      position: { x, z },
      rotation,
      scale: placeScale,
    },
  ] of places.entries()) {
    const [scaleX = 1, scaleY = 1, scaleZ = 1] = placeScale;
    position.set(x, getWorldHeight(x, z), z);
    quaternion.setFromEuler(euler.set(0, rotation, 0));
    scale.set(scaleX * factor.x, scaleY * factor.y, scaleZ * factor.z);
    mesh.setMatrixAt(index, matrix.compose(position, quaternion, scale));
  }
  mesh.instanceMatrix.needsUpdate = true;
  plantsGroup.add(mesh);
};

for (const { name, places } of plantsData.plants)
  if (!name.includes(TREE_PREFAB_NAME_PART)) addInstances(domeGeometry, domeMaterial, places, domeFactor);
// The oak's impostor is baked once from its mesh on the first frame the renderer can draw, then each tree is one card
onBeforeRender(() => {
  if (oakImpostor || !isWebGPURenderer(renderer)) return;
  const { branchGeometry, leafGeometry } = createTreeGeometry(TreeSpeciesOptionsMap[TreeSpecies.GreatOak]);
  oakImpostor = bakeTreeImpostor(renderer, branchGeometry, leafGeometry);
  branchGeometry.dispose();
  leafGeometry.dispose();
  const { bottom, height, width } = oakImpostor;
  const impostorGeometry = new PlaneGeometry(width, height).translate(0, bottom + height / 2, 0);
  const impostorMaterial = createImpostorMaterial({
    fade: uniform(1),
    impostor: oakImpostor,
    lightUniforms,
    rampTexture,
  });
  oakTreeGeometries.push(impostorGeometry);
  oakTreeMaterials.push(impostorMaterial);
  for (const { name, places } of plantsData.plants)
    if (name.includes(TREE_PREFAB_NAME_PART))
      addInstances(impostorGeometry, impostorMaterial, places, new Vector3(1, 1, 1));
});

onUnmounted(() => {
  domeGeometry.dispose();
  domeMaterial.dispose();
  for (const geometry of oakTreeGeometries) geometry.dispose();
  for (const material of oakTreeMaterials) material.dispose();
  oakImpostor?.albedoTarget.dispose();
  oakImpostor?.normalTarget.dispose();
});
</script>

<template>
  <primitive :object="plantsGroup" />
</template>
