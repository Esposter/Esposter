<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageLoaderMap } from "@/models/dungeons/loader/ImageLoaderMap";
import { SpritesheetLoaderMap } from "@/models/dungeons/loader/SpritesheetLoaderMap";
import { SceneWithPlugins } from "@/models/dungeons/scene/plugins/SceneWithPlugins";
import { useGameStore } from "@/store/dungeons/game";
import { type Loader } from "phaser";

const phaserStore = usePhaserStore();
const { sceneKey } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { cursorKeys } = storeToRefs(gameStore);
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
    sceneKey.value = SceneKey.World;
  });

  for (const textureLoader of Object.values(ImageLoaderMap)) textureLoader(scene);
  for (const spritesheetLoader of Object.values(SpritesheetLoaderMap)) spritesheetLoader(scene);
};
</script>

<template>
  <Scene
    :scene-key="SceneKey.Preloader"
    auto-start
    :cls="SceneWithPlugins"
    @preload="preload"
    @create="
      (scene) => {
        cursorKeys = scene.input.keyboard!.createCursorKeys();
      }
    "
  >
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
        style: { fontSize: '1.5rem' },
        origin: 0.5,
      }"
    />
    <Text
      :configuration="{
        x,
        y: y ? y + 50 : undefined,
        text: assetText,
        style: { fontSize: '1.5rem' },
        origin: 0.5,
      }"
    />
  </Scene>
</template>
