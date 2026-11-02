import type { PlantedTerrainTile } from "#src/models/shared/PlantedTerrainTile";
import type { TerrainOptions, TerrainRing, TileStreamer } from "genshin-engine";
import type { BufferAttribute, Group, Material } from "three";

import { getResultAsync } from "@esposter/shared";
import { useTres } from "@tresjs/core";
import {
  createFlowerTileGeometry,
  createTerrainTileGeometry,
  getTerrainTileColumn,
  getTerrainTileLevel,
  getTerrainTileRow,
  TERRAIN_LAYER,
} from "genshin-engine";
import { Box3, Mesh } from "three";

// A tile as its worker answers it: a tile near the eye becomes a mesh of its own, compiled before it is shown, and a far one
// Is written into its level's ring
export const useTerrainReceive = ({
  checkIsNear,
  disposeTileMesh,
  failTile,
  flowerMaterial,
  getRing,
  index,
  terrainMaterial,
  terrainOptions,
  tileGroup,
  tileStreamer,
}: {
  checkIsNear: (key: number) => boolean;
  disposeTileMesh: (mesh: Mesh) => void;
  failTile: (key: number) => void;
  flowerMaterial: Material;
  getRing: (level: number) => TerrainRing;
  index: BufferAttribute;
  terrainMaterial: Material;
  terrainOptions: TerrainOptions;
  tileGroup: Group;
  tileStreamer: TileStreamer<Mesh | number>;
}) => {
  const { camera, renderer, scene } = useTres();
  const { finestTileSize } = terrainOptions;
  return async (terrainTile: PlantedTerrainTile) => {
    const { key, plantColors, plantMatrices } = terrainTile;
    if (!checkIsNear(key)) {
      getRing(getTerrainTileLevel(key)).add(terrainTile);
      tileStreamer.receive(key, key);
      return;
    }
    const size = finestTileSize * 2 ** getTerrainTileLevel(key);
    const mesh = new Mesh(
      createTerrainTileGeometry(terrainTile, index, new Box3().setFromArray(terrainTile.positions)),
      terrainMaterial,
    );
    mesh.position.set(getTerrainTileColumn(key) * size, 0, getTerrainTileRow(key) * size);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.enable(TERRAIN_LAYER);
    if (plantMatrices.length > 0) {
      const flowerMesh = new Mesh(createFlowerTileGeometry(plantMatrices, plantColors), flowerMaterial);
      flowerMesh.receiveShadow = true;
      mesh.add(flowerMesh);
    }
    // Three compiles only what is visible and unparented, so the tile's pipelines build before any frame can draw it,
    // Then it is held hidden and handed to the streamer, which shows it from the next frame that draws it
    const activeCamera = camera.value;
    const activeScene = scene.value;
    if (activeCamera && activeScene) {
      const isCompiled = await getResultAsync(async () => {
        await renderer.compileAsync(mesh, activeCamera, activeScene);
      }).match(
        () => true,
        (error) => {
          console.error(`Terrain tile ${key} failed to compile`, error);
          disposeTileMesh(mesh);
          failTile(key);
          return false;
        },
      );
      if (!isCompiled) return;
    }
    mesh.visible = false;
    tileGroup.add(mesh);
    tileStreamer.receive(key, mesh);
  };
};
