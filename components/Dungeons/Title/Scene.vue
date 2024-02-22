<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { PlayerTitleMenuOption } from "@/models/dungeons/title/menu/PlayerTitleMenuOption";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import { Cameras } from "phaser";

const phaserStore = usePhaserStore();
const { switchToScene } = phaserStore;
const { scene } = storeToRefs(phaserStore);
const titleSceneStore = useTitleSceneStore();
const { onPlayerInput } = titleSceneStore;
const { optionGrid } = storeToRefs(titleSceneStore);
</script>

<template>
  <Scene
    :scene-key="SceneKey.Title"
    :cls="SceneWithPlugins"
    @create="
      (scene) => {
        scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          if (optionGrid.value === PlayerTitleMenuOption['New Game']) switchToScene(SceneKey.World);
        });
      }
    "
    @update="onPlayerInput()"
  >
    <Image
      :configuration="{
        textureKey: ImageKey.TitleScreenBackground,
        origin: 0,
        scale: 0.58,
      }"
    />
    <Image
      :configuration="{
        x: scene.scale.width / 2,
        y: 150,
        textureKey: ImageKey.TitleTextBackground,
        scale: 0.25,
        alpha: 0.5,
      }"
    />
    <Image
      :configuration="{
        x: scene.scale.width / 2,
        y: 150,
        textureKey: ImageKey.TitleText,
        scale: 0.55,
        alpha: 0.5,
      }"
    />
    <DungeonsTitleMenuContainer />
  </Scene>
</template>
