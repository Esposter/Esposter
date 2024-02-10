<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { CharacterId } from "@/models/dungeons/world/CharacterId";
import { LayerId } from "@/models/dungeons/world/home/LayerId";
import { dayjs } from "@/services/dayjs";
import { isDirection } from "@/services/dungeons/input/isDirection";
import { createLayer } from "@/services/dungeons/world/createLayer";
import { createTileset } from "@/services/dungeons/world/createTileset";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const worldSceneStore = useWorldSceneStore();
const { encounterLayer, collisionLayer } = storeToRefs(worldSceneStore);

const create = (scene: SceneWithPlugins) => {
  const tilemap = scene.make.tilemap({ key: TilemapKey.Home });
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
  encounterLayer.value = createLayer(tilemap, LayerId.Encounter, encounterTileset);
  collisionLayer.value = createLayer(tilemap, LayerId.Collision, collisionTileset);

  scene.gridEngine.create(tilemap, { characters: [] });
  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  scene.cameras.main.fadeIn(dayjs.duration(1, "second").asMilliseconds(), 0, 0, 0);
};

const update = (scene: SceneWithPlugins) => {
  const input = controls.value.getInput();
  if (isDirection(input)) scene.gridEngine.move(CharacterId.Player, input);
};
</script>

<template>
  <Scene :scene-key="SceneKey.World" :cls="SceneWithPlugins" @create="create" @update="update">
    <DungeonsWorldCharacterPlayer />
    <!-- Create foreground for depth for player to hide behind -->
    <Image :configuration="{ textureKey: ImageKey.WorldHomeForeground, origin: 0 }" />
    <DungeonsJoystick />
  </Scene>
</template>
