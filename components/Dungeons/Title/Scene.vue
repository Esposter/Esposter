<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const titleSceneStore = useTitleSceneStore();
const { onPlayerInput } = titleSceneStore;
const x = ref<number>();
</script>

<template>
  <Scene
    :scene-key="SceneKey.Title"
    @create="
      (scene) => {
        useDungeonsBackgroundMusic(scene, BackgroundMusicKey.Title);
        x = scene.scale.width / 2;
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
  </Scene>
</template>
