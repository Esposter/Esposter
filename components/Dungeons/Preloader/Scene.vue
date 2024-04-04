<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { JoystickControls } from "@/models/dungeons/UI/input/JoystickControls";
import { KeyboardControls } from "@/models/dungeons/UI/input/KeyboardControls";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SoundLoaderMap } from "@/models/dungeons/loader/SoundLoaderMap";
import { TilemapLoaderMap } from "@/models/dungeons/loader/TilemapLoaderMap";
import { TilesetLoaderMap } from "@/models/dungeons/loader/TilesetLoaderMap";
import { ImageLoaderMap } from "@/models/dungeons/loader/image/ImageLoaderMap";
import { SpritesheetLoaderMap } from "@/models/dungeons/loader/spritesheet/SpritesheetLoaderMap";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useGameStore } from "@/store/dungeons/game";
import { IS_DEVELOPMENT } from "@/util/environment/constants";
import { prettifyName } from "@/util/text/prettifyName";
import isMobile from "is-mobile";
import type { Loader } from "phaser";

const phaserStore = usePhaserStore();
const { switchToScene, launchParallelScene } = phaserStore;
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
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
    assetText.value = `Loading asset: ${prettifyName(file.key)}`;
  });

  scene.load.on("complete", () => switchToScene(IS_DEVELOPMENT ? SceneKey.MonsterParty : SceneKey.Title));

  for (const spritesheetLoader of Object.values(SpritesheetLoaderMap)) spritesheetLoader(scene);
  for (const imageLoader of Object.values(ImageLoaderMap)) imageLoader(scene);
  for (const tilesetLoader of Object.values(TilesetLoaderMap)) tilesetLoader(scene);
  for (const tilemapLoader of Object.values(TilemapLoaderMap)) tilemapLoader(scene);
  for (const soundLoader of Object.values(SoundLoaderMap)) soundLoader(scene);
};

const create = (scene: SceneWithPlugins) => {
  if (isMobile()) {
    controls.value = new JoystickControls();
    launchParallelScene(SceneKey.MobileJoystick);
    return;
  }

  controls.value = new KeyboardControls(scene);
};
</script>

<template>
  <Scene :scene-key="SceneKey.Preloader" auto-start :cls="SceneWithPlugins" @preload="preload" @create="create">
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
        origin: 0.5,
        text: percentageText,
        style: { fontSize: 24 },
      }"
    />
    <Text
      :configuration="{
        x,
        y: y ? y + 50 : undefined,
        origin: 0.5,
        text: assetText,
        style: { fontSize: 24 },
      }"
    />
  </Scene>
</template>
