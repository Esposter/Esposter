<script setup lang="ts">
import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import files from "#shared/generated/phaser/files.json";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpritesheetLoaders } from "@/services/dungeons/loader/spritesheet/SpritesheetLoaderMap";
import { TilemapLoaders } from "@/services/dungeons/loader/TilemapLoaderMap";
import { TilesetLoaders } from "@/services/dungeons/loader/TilesetLoaderMap";
import {
  PROGRESS_BAR_HEIGHT,
  PROGRESS_BAR_MAX_WIDTH,
  PROGRESS_BOX_HEIGHT,
  PROGRESS_BOX_WIDTH,
} from "@/services/dungeons/scene/preloader/constants";
import { prettify } from "@/util/text/prettify";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { Rectangle, Text, usePhaserStore } from "vue-phaserjs";

const phaserStore = usePhaserStore();
const { switchToScene } = phaserStore;
const x = ref<number>();
const y = ref<number>();
const percentageText = ref("0%");
const assetText = ref("");
const progressBarWidth = ref(0);
const containerBaseUrl = useContainerBaseUrl();

const preload = (scene: SceneWithPlugins) => {
  const { height, width } = scene.cameras.main;
  x.value = width / 2;
  y.value = height / 2;

  scene.load
    .on("progress", (value: number) => {
      progressBarWidth.value = PROGRESS_BAR_MAX_WIDTH * value;
      percentageText.value = `${Math.trunc(value * 100)}%`;
    })
    .on("fileprogress", (file: Loader.File) => {
      assetText.value = `Loading asset: ${prettify(file.key)}`;
    })
    .once(
      "complete",
      getSynchronizedFunction(() => {
        // The pack's base url stays set for the whole load, so it has to come back off before any later scene
        // Loads a bundled asset by its own relative path
        scene.load.setBaseURL();
        return getResultAsync(() => switchToScene(SceneKey.Title)).match(noop, console.error);
      }),
    );

  for (const spritesheetLoader of SpritesheetLoaders) spritesheetLoader(scene);
  for (const tilesetLoader of TilesetLoaders) tilesetLoader(scene);
  for (const tilemapLoader of TilemapLoaders) tilemapLoader(scene);

  // Every image, sound and font now lives in blob storage and is described by the generated file pack, so the
  // Loader reads one manifest instead of a loader map per asset family
  scene.load.setBaseURL(`${containerBaseUrl}/${AzureContainer.DungeonsAssets}`);
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
        height: PROGRESS_BAR_HEIGHT,
        fillColor: 0xffffff,
      }"
      immediate
    />
    <Rectangle
      :configuration="{
        x,
        y,
        width: PROGRESS_BOX_WIDTH,
        height: PROGRESS_BOX_HEIGHT,
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
