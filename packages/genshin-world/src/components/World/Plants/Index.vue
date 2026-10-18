<script setup lang="ts">
import type { WindrisePlant } from "#src/models/windrise/WindrisePlant";
import type { WindriseSurfaces } from "#src/models/windrise/WindriseSurfaces";
import type {
  Impostor,
  InstanceCulling,
  LightUniforms,
  PlantCullingOptions,
  ToonNodeMaterial,
  TreeOptions,
} from "genshin-engine";
import type { BufferGeometry, DataTexture } from "three";
import type { Node, UniformNode } from "three/webgpu";

import { TreeSpecies } from "#src/models/world/TreeSpecies";
import {
  OAK_BARK_PART,
  OAK_LEAF_PART,
  PLANT_DOME_SCALE,
  PLANT_DRAW_DISTANCE,
  TREE_PREFAB_NAME_PART,
} from "#src/services/windrise/constants";
import { getWindrisePartColor } from "#src/services/windrise/getWindrisePartColor";
import { bakeTreeImpostor } from "#src/services/world/bakeTreeImpostor";
import { composePlantPlaceMatrix } from "#src/services/world/composePlantPlaceMatrix";
import { withFinalizer } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import {
  createImpostorMaterial,
  createInstancedGeometry,
  createInstanceMatrixBuffer,
  createInstanceMatrixNode,
  createPlantCulling,
  createToonMaterial,
  createTreeGeometry,
} from "genshin-engine";
import { Group, Matrix4, Mesh, PlaneGeometry, SphereGeometry, Vector3 } from "three";
import { uniform } from "three/tsl";
import { WebGPURenderer } from "three/webgpu";

interface Props {
  // The world's ground at a point in its own coordinates, which each plant stands on
  getGroundHeight: (x: number, z: number) => number;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  // The plants the game places round the oak, each prefab's places
  plants: WindrisePlant[];
  rampTexture: DataTexture;
  // The families' surfaces, the oak's painting its impostor and the ground's the domes
  surfaces: WindriseSurfaces;
  // Each species as the tree kit's parameters, the great oak's baked into the trees' impostor
  treeSpeciesOptionsMap: Record<TreeSpecies, TreeOptions>;
}

// Each kind of plant is one culling pass and one draw of all its places, the pass keeping the places in view
interface PlantBatch {
  clipFromModel: UniformNode<"mat4", Matrix4>;
  culling: InstanceCulling;
  material: ToonNodeMaterial;
  mesh: Mesh;
}

const { getGroundHeight, lightUniforms, origin, plants, rampTexture, surfaces, treeSpeciesOptionsMap } =
  defineProps<Props>();
const { camera, renderer } = useTres();
const { onBeforeRender } = useLoop();
const plantsGroup = new Group();
const batches: PlantBatch[] = [];
// The eye in the world's own coordinates, which the plants' places are in, so the draw distance is measured in them
const eye = uniform(new Vector3());
const domeFactor = new Vector3(...PLANT_DOME_SCALE);
const domeGeometry = new SphereGeometry(1, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2);
// The unit dome's box: its base on the ground, its top at its height, and its radius to each side
const domeBounds = { bottom: 0, halfWidth: 1, height: 1 };
let oakImpostor: Impostor | undefined;
let treeGeometry: PlaneGeometry | undefined;
const isTreePrefab = ({ name }: WindrisePlant): boolean => name.includes(TREE_PREFAB_NAME_PART);
// Each place of a kind, composed where the game places it, the kind's prefabs' places flattened into one list
const placeMatrices = (prefabs: WindrisePlant[], factor: Vector3): Matrix4[] =>
  prefabs.flatMap(({ places }) =>
    places.map((place) => composePlantPlaceMatrix(new Matrix4(), place, getGroundHeight, factor)),
  );
// A kind's places in one culling pass and one draw, which covers exactly the places its pass keeps
const addPlantBatch = (
  geometry: BufferGeometry,
  matrices: Matrix4[],
  bounds: PlantCullingOptions["bounds"],
  createMaterial: (instanceMatrix: Node<"mat4">) => ToonNodeMaterial,
): void => {
  const attribute = createInstanceMatrixBuffer(matrices);
  const clipFromModel = uniform(new Matrix4());
  const culling = createPlantCulling({
    attribute,
    bounds,
    clipFromModel,
    drawDistance: PLANT_DRAW_DISTANCE,
    eye,
    indexCount: geometry.getIndex()?.count ?? 0,
  });
  // Drawn once for every place, so a draw that runs no pass, as on WebGL, takes them all
  const instancedGeometry = createInstancedGeometry(geometry, matrices.length);
  instancedGeometry.setIndirect(culling.indirect);
  const material = createMaterial(createInstanceMatrixNode(attribute, culling.survivor));
  const mesh = new Mesh(instancedGeometry, material);
  mesh.frustumCulled = false;
  plantsGroup.add(mesh);
  batches.push({ clipFromModel, culling, material, mesh });
};

const domeMatrices = placeMatrices(
  plants.filter((prefab) => !isTreePrefab(prefab)),
  domeFactor,
);
if (domeMatrices.length > 0)
  addPlantBatch(domeGeometry, domeMatrices, domeBounds, (instanceMatrix) =>
    createToonMaterial({
      color: surfaces.Ground.color,
      detail: surfaces.Ground.detail,
      instanceMatrix,
      lightUniforms,
      rampTexture,
    }),
  );

// The oak's impostor is baked once from its mesh on the first frame the renderer can draw, then each tree is one card
const bakeOakImpostor = (webGPURenderer: WebGPURenderer): void => {
  const { branchGeometry, leafGeometry } = createTreeGeometry(treeSpeciesOptionsMap[TreeSpecies.GreatOak]);
  const impostor = withFinalizer(
    () =>
      bakeTreeImpostor(
        webGPURenderer,
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
  oakImpostor = impostor;
  const { bottom, height, width } = impostor;
  const cardGeometry = new PlaneGeometry(width, height).translate(0, bottom + height / 2, 0);
  treeGeometry = cardGeometry;
  const treeMatrices = placeMatrices(
    plants.filter((prefab) => isTreePrefab(prefab)),
    new Vector3(1, 1, 1),
  );
  if (treeMatrices.length > 0)
    addPlantBatch(cardGeometry, treeMatrices, { bottom, halfWidth: width / 2, height }, (instanceMatrix) =>
      createImpostorMaterial({ fade: uniform(1), impostor, instanceMatrix, lightUniforms, rampTexture }),
    );
};

// Every batch's pass runs each frame, its clip matrix taken from the camera the frame draws with, as the grass's is
onBeforeRender(() => {
  if (!(renderer instanceof WebGPURenderer)) return;
  if (!oakImpostor) bakeOakImpostor(renderer);
  const activeCamera = camera.value;
  if (!activeCamera) return;
  eye.value.copy(activeCamera.position).add(origin);
  for (const { clipFromModel, culling, mesh } of batches) {
    clipFromModel.value
      .multiplyMatrices(activeCamera.projectionMatrix, activeCamera.matrixWorldInverse)
      .multiply(mesh.matrixWorld);
    culling.cull(renderer);
  }
});

onUnmounted(() => {
  for (const { material } of batches) material.dispose();
  domeGeometry.dispose();
  treeGeometry?.dispose();
  oakImpostor?.albedoTarget.dispose();
  oakImpostor?.normalTarget.dispose();
});
</script>

<template>
  <primitive :object="plantsGroup" />
</template>
