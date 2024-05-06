<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { getAllInputResolvers } from "@/services/dungeons/scene/world/getAllInputResolvers";
import { usePlayerStore } from "@/store/dungeons/player";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import type { Cameras } from "phaser";

const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const worldDialogStore = useWorldDialogStore();
const { showMessages } = worldDialogStore;
const playerStore = usePlayerStore();
const { isPlayerFainted } = storeToRefs(playerStore);
const worldPlayerStore = useWorldPlayerStore();
const { respawn, healParty } = worldPlayerStore;
const inputResolvers = getAllInputResolvers();

const create = (scene: SceneWithPlugins) => {
  useDungeonsBackgroundMusic(scene, BackgroundMusicKey.AndTheJourneyBegins);

  if (isPlayerFainted.value) respawn();

  scene.cameras.main.setBounds(0, 0, 1280, 2176);
  scene.cameras.main.setZoom(0.8);
  fadeIn(
    scene,
    dayjs.duration(1, "second").asMilliseconds(),
    0,
    0,
    0,
    (_camera: Cameras.Scene2D.Camera, progress: number) => {
      if (!(progress === 1 && isPlayerFainted.value)) return;

      healParty();
      showMessages(scene, [
        { title: "???", text: "It looks like your team put up quite a fight..." },
        { title: "???", text: "I went ahead and healed them up for you." },
      ]);
    },
  );
};

const update = async (scene: SceneWithPlugins) => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();

  for (const inputResolver of inputResolvers)
    if (await inputResolver.handleInputPre(scene, justDownInput, input)) return;

  for (const inputResolver of inputResolvers) if (await inputResolver.handleInput(scene, justDownInput, input)) return;
};

const shutdown = (scene: SceneWithPlugins) => {
  scene.cameras.main.removeBounds();
  scene.cameras.main.setZoom(1);
};
</script>

<template>
  <Scene :scene-key="SceneKey.World" @create="create" @update="update" @shutdown="shutdown">
    <DungeonsWorldMap />
    <DungeonsWorldCharacterPlayer />
    <DungeonsWorldNpcList />
    <DungeonsWorldChestLayer />
    <DungeonsWorldForeground />
    <DungeonsWorldDialog />
    <DungeonsWorldMenu />
  </Scene>
</template>
