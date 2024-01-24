<script setup lang="ts">
import characters from "@/assets/dungeons/spritesheets/characters.png";
import cloudCityTilemap from "@/assets/dungeons/tilemaps/cloud_city.json";
import cloudCityTileset from "@/assets/dungeons/tilesets/cloud_city.png";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { TextureLoaderMap } from "@/models/dungeons/loader/TextureLoaderMap";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
import { type Loader } from "phaser";

const phaserStore = usePhaserStore();
const { sceneKey } = storeToRefs(phaserStore);
const x = ref<number>();
const y = ref<number>();
const percentageText = ref("0%");
const assetText = ref("");
const progressBoxWidth = ref(320);
const progressBoxHeight = ref(50);
const progressBarMaxWidth = ref(300);
const progressBarWidth = ref(0);
const progressBarHeight = ref(30);

const preload = (scene: SceneWithPlugins) => {
  const { width, height } = scene.cameras.main;
  x.value = width / 2;
  y.value = height / 2;

  scene.load.on("progress", async (value: number) => {
    progressBarWidth.value = progressBarMaxWidth.value * value;
    percentageText.value = `${parseInt((value * 100).toString())}%`;
  });

  scene.load.on("fileprogress", (file: Loader.File) => {
    assetText.value = `Loading asset: ${file.key}`;
  });

  scene.load.on("complete", () => {
    sceneKey.value = SceneKey.Battle;
  });

  for (const textureLoader of Object.values(TextureLoaderMap)) textureLoader(scene);
  scene.load.image(TilesetKey.CloudCity, cloudCityTileset);
  scene.load.tilemapTiledJSON(TilemapKey.CloudCity, cloudCityTilemap);
  scene.load.spritesheet(SpritesheetKey.Characters, characters, { frameWidth: 52, frameHeight: 72 });
};
</script>

<template>
  <Scene :scene-key="SceneKey.Preloader" auto-start :cls="SceneWithPlugins" @preload="preload">
    <Rectangle
      :configuration="{
        x,
        y,
        width: progressBarWidth,
        height: progressBarHeight,
        fillColor: 0xffffff,
      }"
    />
    <Rectangle
      :configuration="{
        x,
        y,
        width: progressBoxWidth,
        height: progressBoxHeight,
        fillColor: 0x222222,
        alpha: 0.8,
      }"
    />
    <Text
      :configuration="{
        x,
        y,
        text: percentageText,
        style: { font: '1.5rem Frijole' },
        origin: 0.5,
      }"
    />
    <Text
      :configuration="{
        x,
        y: y ? y + 50 : undefined,
        text: assetText,
        style: { font: '1.5rem Frijole' },
        origin: 0.5,
      }"
    />
  </Scene>
</template>
