<script setup lang="ts">
import type { WindrisePlant } from "#src/models/windrise/WindrisePlant";
import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type { Impostor, LightUniforms, ToonNodeMaterial, TreeOptions } from "genshin-engine";
import type { BufferGeometry, DataTexture } from "three";

import { TreeSpecies } from "#src/models/world/TreeSpecies";
import {
  OAK_BARK_PART,
  OAK_LEAF_PART,
  PLANT_DOME_SCALE,
  TREE_PREFAB_NAME_PART,
} from "#src/services/windrise/constants";
import { getWindrisePartColor } from "#src/services/windrise/getWindrisePartColor";
import { bakeTreeImpostor } from "#src/services/world/bakeTreeImpostor";
import { withFinalizer } from "@esposter/shared";
import { isWebGPURenderer, useLoop, useTres } from "@tresjs/core";
import { createImpostorMaterial, createToonMaterial, createTreeGeometry } from "genshin-engine";
import { Euler, Group, InstancedMesh, Matrix4, PlaneGeometry, Quaternion, SphereGeometry, Vector3 } from "three";
import { uniform } from "three/tsl";

interface Props {
  // The world's ground at a point in its own coordinates, which each plant stands on
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The plants the game places round the oak, each prefab's places
  plants: WindrisePlant[];
  rampTexture: DataTexture;
  // The families' surfaces, the oak's painting its impostor and the ground's the domes
  surfaces: WindriseSurfaces;
  // Each species as the tree kit's parameters, the great oak's baked into the trees' impostor
  treeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions>;
}

const { getGroundHeight, lightUniforms, plants, rampTexture, surfaces, treeSpeciesOptionsMap } = defineProps<Props>();
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
// The domes stand in the ground's own green and detail
const domeMaterial = createToonMaterial({
  color: surfaces.Ground.color,
  detail: surfaces.Ground.detail,
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
  places: WindrisePlant["places"],
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
    position.set(x, getGroundHeight(x, z), z);
    quaternion.setFromEuler(euler.set(0, rotation, 0));
    scale.set(scaleX * factor.x, scaleY * factor.y, scaleZ * factor.z);
    mesh.setMatrixAt(index, matrix.compose(position, quaternion, scale));
  }
  mesh.instanceMatrix.needsUpdate = true;
  plantsGroup.add(mesh);
};

for (const { name, places } of plants)
  if (!name.includes(TREE_PREFAB_NAME_PART)) addInstances(domeGeometry, domeMaterial, places, domeFactor);
// The oak's impostor is baked once from its mesh on the first frame the renderer can draw, then each tree is one card
onBeforeRender(() => {
  if (oakImpostor || !isWebGPURenderer(renderer)) return;
  const { branchGeometry, leafGeometry } = createTreeGeometry(treeSpeciesOptionsMap[TreeSpecies.GreatOak]);
  oakImpostor = withFinalizer(
    () =>
      bakeTreeImpostor(
        renderer,
        branchGeometry,
        leafGeometry,
        getWindrisePartColor(surfaces.Oak, OAK_BARK_PART),
        getWindrisePartColor(surfaces.Oak, OAK_LEAF_PART),
      ),
    () => {
      branchGeometry.dispose();
      leafGeometry.dispose();
    },
  );
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
  for (const { name, places } of plants)
    if (name.includes(TREE_PREFAB_NAME_PART))
      addInstances(impostorGeometry, impostorMaterial, places, new Vector3(1, 1, 1));
});

onUnmounted(() => {
  for (const child of plantsGroup.children) if (child instanceof InstancedMesh) child.dispose();
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
