<script setup lang="ts">
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useControlsStore } from "@/store/dungeons/controls";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import { Image, Text } from "vue-phaserjs";

const buildVersion = await useBuildVersion();
const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const titleSceneStore = useTitleSceneStore();
const { onPlayerInput } = titleSceneStore;
const x = ref<number>();
const versionX = ref<number>();
const versionY = ref<number>();
</script>

<template>
  <DungeonsScene
    :scene-key="SceneKey.Title"
    @create="
      (scene) => {
        playDungeonsBackgroundMusic(scene, BackgroundMusicKey.Title);
        x = scene.scale.width / 2;
        versionX = scene.scale.width - 150;
        versionY = scene.scale.height - 50;
      }
    "
    @update="(scene) => onPlayerInput(scene, controls.getInput(true))"
  >
    <Image
      :configuration="{
        origin: 0,
        texture: ImageKey.TitleScreenBackground,
        scale: 0.58,
      }"
    />
    <Image
      :configuration="{
        x,
        y: 150,
        texture: ImageKey.TitleTextBackground,
        scale: 0.25,
        alpha: 0.5,
      }"
    />
    <Image
      :configuration="{
        x,
        y: 150,
        texture: ImageKey.TitleText,
        scale: 0.55,
        alpha: 0.5,
      }"
    />
    <DungeonsTitleMenuContainer />
    <Text
      :configuration="{
        x: versionX,
        y: versionY,
        text: `ver: ${buildVersion}`,
        style: { color: 'white', fontSize: 24 },
      }"
    />
  </DungeonsScene>
</template>
