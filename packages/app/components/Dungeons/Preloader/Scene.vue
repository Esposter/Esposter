<script setup lang="ts">
import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { FontKey } from "@/models/dungeons/keys/FontKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageLoaderMap } from "@/models/dungeons/loader/image/ImageLoaderMap";
import { SoundLoaderMap } from "@/models/dungeons/loader/sound/SoundLoaderMap";
import { SpritesheetLoaderMap } from "@/models/dungeons/loader/spritesheet/SpritesheetLoaderMap";
import { TilemapLoaderMap } from "@/models/dungeons/loader/TilemapLoaderMap";
import { TilesetLoaderMap } from "@/models/dungeons/loader/TilesetLoaderMap";
import { IS_DEVELOPMENT } from "@/util/environment/constants";
import { prettify } from "@/util/text/prettify";
import { Rectangle, Text, usePhaserStore } from "vue-phaserjs";
import { load } from "webfontloader";

const phaserStore = usePhaserStore();
const { switchToScene } = phaserStore;
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
  const { height, width } = scene.cameras.main;
  x.value = width / 2;
  y.value = height / 2;
  // We need to preload the fonts so phaser can properly use them
  load({ custom: { families: [FontKey.KenneyFutureNarrow] } });

  scene.load.on("progress", (value: number) => {
    progressBarWidth.value = progressBarMaxWidth.value * value;
    percentageText.value = `${parseInt((value * 100).toString())}%`;
  });

  scene.load.on("fileprogress", (file: Loader.File) => {
    assetText.value = `Loading asset: ${prettify(file.key)}`;
  });

  scene.load.on("complete", async () => {
    await switchToScene(IS_DEVELOPMENT ? SceneKey.Title : SceneKey.Title);
  });

  for (const spritesheetLoader of Object.values(SpritesheetLoaderMap)) spritesheetLoader(scene);
  for (const imageLoader of Object.values(ImageLoaderMap)) imageLoader(scene);
  for (const tilesetLoader of Object.values(TilesetLoaderMap)) tilesetLoader(scene);
  for (const tilemapLoader of Object.values(TilemapLoaderMap)) tilemapLoader(scene);
  for (const soundLoader of Object.values(SoundLoaderMap)) soundLoader(scene);
};
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.Preloader" auto-start @preload="preload">
    <Rectangle
      :configuration="{
        x,
        y,
        width: progressBarWidth,
        height: progressBarHeight,
        fillColor: 0xffffff,
      }"
      immediate
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
      immediate
    />
    <Text
      :configuration="{
        x,
        y,
        origin: 0.5,
        text: percentageText,
        style: { fontSize: 24 },
      }"
      immediate
    />
    <Text
      :configuration="{
        x,
        y: y ? y + 50 : undefined,
        origin: 0.5,
        text: assetText,
        style: { fontSize: 24 },
      }"
      immediate
    />
  </DungeonsScene>
</template>
