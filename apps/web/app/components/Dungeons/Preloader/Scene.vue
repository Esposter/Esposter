<script setup lang="ts">
import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { loadDungeonsFiles } from "#src/services/dungeons/loader/loadDungeonsFiles";
import { PixelArtTextureKeys } from "#src/services/dungeons/loader/PixelArtTextureKeys";
import { readDungeonsPreloadSet } from "#src/services/dungeons/loader/readDungeonsPreloadSet";
import {
  PROGRESS_BAR_HEIGHT,
  PROGRESS_BAR_MAX_WIDTH,
  PROGRESS_BOX_HEIGHT,
  PROGRESS_BOX_WIDTH,
} from "#src/services/dungeons/scene/preloader/constants";
import { prettify } from "#src/util/text/prettify";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";
import { HostedAssetPreloadStatus, useHostedAssetsPreload } from "hosted-assets";
import { Textures } from "phaser";
import { Rectangle, Text, usePhaserStore } from "vue-phaserjs";

const phaserStore = usePhaserStore();
const { switchToScene } = phaserStore;
const origin = useRuntimeConfig().public.hostedAssets.baseUrl;
const x = ref<number>();
const y = ref<number>();
const loadingAssetText = ref("");
// The scene the files load into once every one is held, which is set when Phaser runs the preload
let preloadScene: SceneWithPlugins | undefined;

// The bar follows the download of every file the cache lacks. Once each one is held, the Phaser pass loads them from
// The cache, so it only decodes them, and the game starts on its `complete`
const {
  downloadProgress,
  preload: downloadFiles,
  status,
} = useHostedAssetsPreload(
  async () => readDungeonsPreloadSet(origin),
  () => {
    if (preloadScene) startPhaserLoads(preloadScene);
  },
);
const progressBarWidth = computed(() => PROGRESS_BAR_MAX_WIDTH * downloadProgress.value);
const percentageText = computed(() => `${Math.trunc(downloadProgress.value * 100)}%`);
const assetText = computed(() =>
  status.value === HostedAssetPreloadStatus.Failed ? "Download failed" : loadingAssetText.value,
);

const startPhaserLoads = (scene: SceneWithPlugins) => {
  scene.load
    .once("complete", () => {
      for (const key of PixelArtTextureKeys) scene.textures.get(key).setFilter(Textures.FilterMode.NEAREST);
    })
    .once(
      "complete",
      getSynchronizedFunction(() => getResultAsync(() => switchToScene(SceneKey.Title)).match(noop, console.error)),
    );
  loadDungeonsFiles(scene, origin);
  scene.load.start();
};

const preload = async (scene: SceneWithPlugins) => {
  const { height, width } = scene.cameras.main;
  x.value = width / 2;
  y.value = height / 2;
  preloadScene = scene;
  scene.load.on("fileprogress", (file: Loader.File) => {
    loadingAssetText.value = `Loading asset: ${prettify(file.key)}`;
  });
  await downloadFiles();
};
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.Preloader" auto-start @preload="(scene) => preload(scene)">
    <Rectangle
      :configuration="{ x, y, width: progressBarWidth, height: PROGRESS_BAR_HEIGHT, fillColor: 0xffffff }"
      immediate
    />
    <Rectangle
      :configuration="{ x, y, width: PROGRESS_BOX_WIDTH, height: PROGRESS_BOX_HEIGHT, fillColor: 0x222222, alpha: 0.8 }"
      immediate
    />
    <Text :configuration="{ x, y, origin: 0.5, text: percentageText, style: { fontSize: 24 } }" immediate />
    <Text
      :configuration="{ x, y: y ? y + 50 : undefined, origin: 0.5, text: assetText, style: { fontSize: 24 } }"
      immediate
    />
  </DungeonsScene>
</template>
