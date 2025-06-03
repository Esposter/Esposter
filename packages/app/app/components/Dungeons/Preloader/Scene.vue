<script setup lang="ts">
import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import files from "#shared/generated/phaser/files.json";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpritesheetLoaderMap } from "@/models/dungeons/loader/spritesheet/SpritesheetLoaderMap";
import { TilemapLoaderMap } from "@/models/dungeons/loader/TilemapLoaderMap";
import { TilesetLoaderMap } from "@/models/dungeons/loader/TilesetLoaderMap";
import { prettify } from "@/util/text/prettify";
import { Rectangle, Text, usePhaserStore } from "vue-phaserjs";

const runtimeConfig = useRuntimeConfig();
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

  scene.load
    .on("progress", (value: number) => {
      progressBarWidth.value = progressBarMaxWidth.value * value;
      percentageText.value = `${parseInt((value * 100).toString())}%`;
    })
    .on("fileprogress", (file: Loader.File) => {
      assetText.value = `Loading asset: ${prettify(file.key)}`;
    })
    .once("complete", async () => {
      await switchToScene(IS_DEVELOPMENT ? SceneKey.Title : SceneKey.Title);
    });

  for (const spritesheetLoader of Object.values(SpritesheetLoaderMap)) spritesheetLoader(scene);
  for (const tilesetLoader of Object.values(TilesetLoaderMap)) tilesetLoader(scene);
  for (const tilemapLoader of Object.values(TilemapLoaderMap)) tilemapLoader(scene);

  scene.load.setBaseURL(`${runtimeConfig.public.azure.blobUrl}/${AzureContainer.DungeonsAssets}`);
  scene.load.pack(files);
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
