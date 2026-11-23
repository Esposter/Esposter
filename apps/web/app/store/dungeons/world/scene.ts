import type { ObjectgroupName } from "#shared/generated/tiled/layers/ObjectgroupName";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { WorldData } from "#shared/models/dungeons/data/world/WorldData";
import type { GridEngine, Position } from "grid-engine-headless";
import type { Tilemaps } from "phaser";

import { useDungeonsStore } from "#src/store/dungeons/index";
import { NotInitializedError } from "@esposter/shared";

export const useWorldSceneStore = defineStore("dungeons/world/scene", () => {
  const dungeonsStore = useDungeonsStore();
  const tilemapKey = computed(() => dungeonsStore.save.tilemapKey);
  const worldData = computed<WorldData>(() => dungeonsStore.save.world[tilemapKey.value]);
  // The tilemap and the player's tile on it are written together, so the player that re-renders in the new tilemap is
  // Never placed on a tile of the tilemap it left
  const switchToTilemap = async (newTilemapKey: TilemapKey, playerPosition: Position) => {
    dungeonsStore.save.tilemapKey = newTilemapKey;
    dungeonsStore.save.player.position = playerPosition;
    // We need to wait for:
    // 1. The player to re-render first in the tilemap, where it joins the grid at the position just stored
    // 2. The tilemap key watcher to load the new tilemap from the vue-phaser library
    await nextTick();
  };
  // We will create the tilemap and its metadata in the world scene vue component
  // A read before the tilemap is made is an error, since every reader of it runs after the tilemap is set
  const tilemapValue = ref<Tilemaps.Tilemap>();
  const tilemap = computed({
    get: () => {
      if (!tilemapValue.value) throw new NotInitializedError("Tilemap");
      return tilemapValue.value;
    },
    set: (newTilemap) => {
      tilemapValue.value = newTilemap;
    },
  });
  // The tilemap's grid engine is made with the tilemap and marked raw where it is set, and it is released with the
  // Scene
  const gridEngine = ref<GridEngine>();
  // Each character's sprite writer, keyed by its id. Each frame the engine steps first, then every writer draws its
  // Sprite
  const characterIdSpriteWriterMap = new Map<string, () => void>();
  const updateGridEngine = (delta: number) => {
    gridEngine.value?.update(delta);
    for (const writeCharacterSprite of characterIdSpriteWriterMap.values()) writeCharacterSprite();
  };
  const releaseGridEngine = () => {
    gridEngine.value = undefined;
    characterIdSpriteWriterMap.clear();
  };
  const tilemapKeyLayerMap = ref(new Map<TilemapKey, Map<string, Tilemaps.TilemapLayer | undefined>>());
  const layerMap = computed({
    get: () => tilemapKeyLayerMap.value.get(tilemapKey.value),
    set: (newLayerMap) => {
      if (newLayerMap) tilemapKeyLayerMap.value.set(tilemapKey.value, newLayerMap);
      else tilemapKeyLayerMap.value.delete(tilemapKey.value);
    },
  });
  const tilemapKeyObjectLayerMap = ref(new Map<TilemapKey, Map<ObjectgroupName, Tilemaps.ObjectLayer | undefined>>());
  const objectLayerMap = computed({
    get: () => tilemapKeyObjectLayerMap.value.get(tilemapKey.value),
    set: (newObjectLayerMap) => {
      if (newObjectLayerMap) tilemapKeyObjectLayerMap.value.set(tilemapKey.value, newObjectLayerMap);
      else tilemapKeyObjectLayerMap.value.delete(tilemapKey.value);
    },
  });
  return {
    characterIdSpriteWriterMap,
    gridEngine,
    layerMap,
    objectLayerMap,
    releaseGridEngine,
    switchToTilemap,
    tilemap,
    tilemapKey,
    updateGridEngine,
    worldData,
  };
});
