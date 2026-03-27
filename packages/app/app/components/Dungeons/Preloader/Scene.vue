<script setup lang="ts">
import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { FontLoaders } from "@/models/dungeons/loader/FontLoaderMap";
import { ImageLoaders } from "@/models/dungeons/loader/image/ImageLoaderMap";
import { SoundLoaders } from "@/models/dungeons/loader/sound/SoundLoaderMap";
import { SpritesheetLoaders } from "@/models/dungeons/loader/spritesheet/SpritesheetLoaderMap";
import { TilemapLoaders } from "@/models/dungeons/loader/TilemapLoaderMap";
import { TilesetLoaders } from "@/models/dungeons/loader/TilesetLoaderMap";
import { prettify } from "@/util/text/prettify";
import { Rectangle, Text, usePhaserStore } from "vue-phaserjs";

const phaserStore = usePhaserStore();
const { switchToScene } = phaserStore;
const isProduction = useIsProduction();
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

  scene.load
    .on("progress", (value: number) => {
      progressBarWidth.value = progressBarMaxWidth.value * value;
      percentageText.value = `${parseInt((value * 100).toString())}%`;
    })
    .on("fileprogress", (file: Loader.File) => {
      assetText.value = `Loading asset: ${prettify(file.key)}`;
    })
    .once("complete", async () => {
      await switchToScene(isProduction ? SceneKey.Title : SceneKey.Title);
    });

  for (const fontLoader of FontLoaders) fontLoader(scene);
  for (const soundLoader of SoundLoaders) soundLoader(scene);
  for (const spritesheetLoader of SpritesheetLoaders) spritesheetLoader(scene);
  for (const imageLoader of ImageLoaders) imageLoader(scene);
  for (const tilesetLoader of TilesetLoaders) tilesetLoader(scene);
  for (const tilemapLoader of TilemapLoaders) tilemapLoader(scene);
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
