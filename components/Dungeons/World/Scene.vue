<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKeyMap } from "@/models/dungeons/keys/TilesetKeyMap";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { TileProperty } from "@/models/dungeons/tilemap/TileProperty";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { LayerId } from "@/models/dungeons/world/home/LayerId";
import { ObjectLayer } from "@/models/dungeons/world/home/ObjectLayer";
import { dayjs } from "@/services/dayjs";
import { isDirection } from "@/services/dungeons/input/isDirection";
import { createLayer } from "@/services/dungeons/tilemap/createLayer";
import { createTileset } from "@/services/dungeons/tilemap/createTileset";
import { getObjectLayer } from "@/services/dungeons/world/getObjectLayer";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useEncounterStore } from "@/store/dungeons/world/encounter";
import { useNpcStore } from "@/store/dungeons/world/npc";
import { usePlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { type Tilemaps } from "phaser";

const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsStore = useSettingsStore();
const { debugTileLayerAlpha } = storeToRefs(settingsStore);
const dialogStore = useDialogStore();
const { handleShowMessageInput } = dialogStore;
const worldSceneStore = useWorldSceneStore();
const { encounterLayer, signLayer, isDialogVisible } = storeToRefs(worldSceneStore);
const playerStore = usePlayerStore();
const { isMoving } = storeToRefs(playerStore);
const npcStore = useNpcStore();
const { npcList } = storeToRefs(npcStore);
const encounterStore = useEncounterStore();
const { isMonsterEncountered } = storeToRefs(encounterStore);
let tilemap: Tilemaps.Tilemap;

const create = (scene: SceneWithPlugins) => {
  tilemap = scene.make.tilemap({ key: TilemapKey.Home });
  const basicPlainsTileset = createTileset(tilemap, TilesetKeyMap.BasicPlains);
  const beachAndCavesTileset = createTileset(tilemap, TilesetKeyMap.BeachAndCaves);
  const houseTileset = createTileset(tilemap, TilesetKeyMap.House);
  const bushesTileset = createTileset(tilemap, TilesetKeyMap.Bushes);
  const collisionTileset = createTileset(tilemap, TilesetKeyMap.Collision);
  const encounterTileset = createTileset(tilemap, TilesetKeyMap.Encounter);
  const grassTileset = createTileset(tilemap, TilesetKeyMap.Grass);
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
  signLayer.value = getObjectLayer(tilemap, ObjectLayer.Sign);

  scene.gridEngine.create(tilemap, {
    characters: [],
    collisionTilePropertyName: TileProperty.Collision,
    numberOfDirections: 8,
  });
  useReadNpcList(tilemap);

  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  scene.cameras.main.fadeIn(dayjs.duration(1, "second").asMilliseconds());
};

const update = (scene: SceneWithPlugins) => {
  if (isMoving.value || isMonsterEncountered.value || !scene.gridEngine.hasCharacter(CharacterId.Player)) return;

  const input = controls.value.getInput();
  // We want to pause all other player input whilst the dialog is visible
  if (isDialogVisible.value) {
    handleShowMessageInput(input);
    return;
  }

  if (input === PlayerSpecialInput.Confirm) useInteractions();
  else if (isDirection(input)) scene.gridEngine.move(CharacterId.Player, input);
};

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  tilemap.destroy();
  scene.value.cameras.resetAll();
});
</script>

<template>
  <Scene :scene-key="SceneKey.World" :cls="SceneWithPlugins" @create="create" @update="update">
    <DungeonsWorldCharacterPlayer />
    <DungeonsWorldCharacterNpc
      v-for="({ id, position, direction, ...rest }, index) in npcList"
      :key="id"
      v-model:position="npcList[index].position"
      v-model:direction="npcList[index].direction"
      :="{ id, ...rest }"
    />
    <DungeonsWorldForeground />
    <DungeonsWorldDialog />
    <DungeonsJoystick />
    <DungeonsJoystickConfirmThumb />
  </Scene>
</template>
