<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { useInputStore } from "@/lib/phaser/store/input";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const buildVersion = await useBuildVersion();
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const titleSceneStore = useTitleSceneStore();
const { onPlayerInput } = titleSceneStore;
const x = ref<number>();
const versionX = ref<number>();
const versionY = ref<number>();
</script>

<template>
  <Scene
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
  </Scene>
</template>
