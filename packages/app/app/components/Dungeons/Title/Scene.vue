<script setup lang="ts">
<<<<<<< HEAD
import { FileKey } from "#shared/generated/phaser/FileKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
=======
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "#shared/models/dungeons/keys/sound/BackgroundMusicKey";
>>>>>>> main
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
        playDungeonsBackgroundMusic(scene, FileKey.ThirdPartyXDeviruchiTitleTheme);
        x = scene.scale.width / 2;
        versionX = scene.scale.width - 150;
        versionY = scene.scale.height - 50;
      }
    "
    @update="onPlayerInput($event, controls.getInput(true))"
  >
    <Image
      :configuration="{
        origin: 0,
        texture: FileKey.SceneTitleScreenBackground,
        scale: 0.58,
      }"
    />
    <Image
      :configuration="{
        x,
        y: 150,
        texture: FileKey.SceneTitleTextBackground,
        scale: 0.25,
        alpha: 0.5,
      }"
    />
    <Image
      :configuration="{
        x,
        y: 150,
        texture: FileKey.SceneTitleText,
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
