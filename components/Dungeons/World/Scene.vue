<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { TileProperty } from "@/models/dungeons/tile/TileProperty";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { LayerId } from "@/models/dungeons/world/home/LayerId";
import { dayjs } from "@/services/dayjs";
import { isDirection } from "@/services/dungeons/input/isDirection";
import { createLayer } from "@/services/dungeons/world/createLayer";
import { createTileset } from "@/services/dungeons/world/createTileset";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { type Tilemaps } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsStore = useSettingsStore();
const { debugTileLayerAlpha } = storeToRefs(settingsStore);
const worldSceneStore = useWorldSceneStore();
const { encounterLayer } = storeToRefs(worldSceneStore);
const encounterStore = useEncounterStore();
const { isMonsterEncountered } = storeToRefs(encounterStore);
let tilemap: Tilemaps.Tilemap;
const destroyListener = () => tilemap.destroy();

const create = (scene: SceneWithPlugins) => {
  tilemap = scene.make.tilemap({ key: TilemapKey.Home });
  const basicPlainsTileset = createTileset(tilemap, TilesetKey.BasicPlains);
  const beachAndCavesTileset = createTileset(tilemap, TilesetKey.BeachAndCaves);
  const houseTileset = createTileset(tilemap, TilesetKey.House);
  const bushesTileset = createTileset(tilemap, TilesetKey.Bushes);
  const collisionTileset = createTileset(tilemap, TilesetKey.Collision);
  const encounterTileset = createTileset(tilemap, TilesetKey.Encounter);
  const grassTileset = createTileset(tilemap, TilesetKey.Grass);
  createLayer(tilemap, LayerId.Ground, [basicPlainsTileset, grassTileset]);
  createLayer(tilemap, LayerId.Building, houseTileset);
  createLayer(tilemap, LayerId.Water, beachAndCavesTileset);
  createLayer(tilemap, LayerId.Decoration, [basicPlainsTileset, bushesTileset]);
  createLayer(tilemap, LayerId.Sign, basicPlainsTileset);
  createLayer(tilemap, LayerId.TreeBottom, basicPlainsTileset);
  createLayer(tilemap, LayerId.TreeTop, basicPlainsTileset);
  createLayer(tilemap, LayerId.Fence, basicPlainsTileset);
  createLayer(tilemap, LayerId.Boulder, basicPlainsTileset);
  createLayer(tilemap, LayerId.Foreground, [basicPlainsTileset, houseTileset]);
  encounterLayer.value = createLayer(tilemap, LayerId.Encounter, encounterTileset).setAlpha(debugTileLayerAlpha.value);
  createLayer(tilemap, LayerId.Collision, collisionTileset).setAlpha(debugTileLayerAlpha.value);

  scene.gridEngine.create(tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  scene.cameras.main.fadeIn(dayjs.duration(1, "second").asMilliseconds(), 0, 0, 0);
};

const update = (scene: SceneWithPlugins) => {
  if (isMonsterEncountered.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return;

  const input = controls.value.getInput();
  if (isDirection(input)) scene.gridEngine.move(CharacterId.Player, input);
};

onMounted(() => {
  phaserEventEmitter.on(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, destroyListener);
});

onUnmounted(() => {
  phaserEventEmitter.off(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, destroyListener);
});
</script>

<template>
  <Scene :scene-key="SceneKey.World" :cls="SceneWithPlugins" @create="create" @update="update">
    <DungeonsWorldCharacterPlayer />
    <!-- Create foreground with a higher depth than the player to hide behind -->
    <Image :configuration="{ textureKey: ImageKey.WorldHomeForeground, origin: 0, depth: 12 }" />
    <DungeonsJoystick />
  </Scene>
</template>
