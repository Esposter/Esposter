<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { TilesetName } from "@/models/dungeons/keys/TilesetName";
import { SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { createLayer } from "@/services/dungeons/world/createLayer";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { collisionLayer, encounterLayer } = storeToRefs(worldSceneStore);

const create = (scene: SceneWithPlugins) => {
  const tilemap = scene.make.tilemap({ key: TilemapKey.Home });
  collisionLayer.value = createLayer(tilemap, TilesetName.collision, TilesetKey.WorldCollision)
    .setAlpha(0.7)
    .setDepth(2);
  encounterLayer.value = createLayer(tilemap, TilesetName.encounter, TilesetKey.WorldEncounter)
    .setAlpha(0.7)
    .setDepth(2);

  scene.gridEngine.create(tilemap, { characters: [] });
  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.fadeIn(dayjs.duration(1, "second").asMilliseconds(), 0, 0, 0);
};
</script>

<template>
  <Scene :scene-key="SceneKey.World" :cls="SceneWithPlugins" @create="create">
    <Image :configuration="{ textureKey: ImageKey.WorldHomeBackground, origin: 0 }" />
    <DungeonsWorldCharacterPlayer />
  </Scene>
</template>
