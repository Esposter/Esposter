<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useGameStore } from "@/store/dungeons/game";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const titleSceneStore = useTitleSceneStore();
const { onPlayerInput } = titleSceneStore;
</script>

<template>
  <Scene :scene-key="SceneKey.Title" :cls="SceneWithPlugins" @update="onPlayerInput(controls.getInput(true))">
    <Image
      :configuration="{
        texture: ImageKey.TitleScreenBackground,
        origin: 0,
        scale: 0.58,
      }"
    />
    <Image
      :configuration="{
        x: scene.scale.width / 2,
        y: 150,
        texture: ImageKey.TitleTextBackground,
        scale: 0.25,
        alpha: 0.5,
      }"
    />
    <Image
      :configuration="{
        x: scene.scale.width / 2,
        y: 150,
        texture: ImageKey.TitleText,
        scale: 0.55,
        alpha: 0.5,
      }"
    />
    <DungeonsTitleMenuContainer />
    <DungeonsJoystick />
    <DungeonsJoystickConfirmThumb />
  </Scene>
</template>
