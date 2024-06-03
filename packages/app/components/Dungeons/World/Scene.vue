<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { useCameraStore } from "@/lib/phaser/store/camera";
import { useInputStore } from "@/lib/phaser/store/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { dayjs } from "@/services/dayjs";
import { getAllInputResolvers } from "@/services/dungeons/scene/world/getAllInputResolvers";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";

const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const inputResolvers = getAllInputResolvers();

const create = (scene: SceneWithPlugins) => {
  playDungeonsBackgroundMusic(scene, BackgroundMusicKey.AndTheJourneyBegins);
  fadeIn(scene, dayjs.duration(1, "second").asMilliseconds());
};

const update = async (scene: SceneWithPlugins) => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();

  for (const { handleInputPre } of inputResolvers) if (await handleInputPre(scene, justDownInput, input)) return;

  for (const { handleInput } of inputResolvers) if (await handleInput(scene, justDownInput, input)) return;
};
</script>

<template>
  <Scene :scene-key="SceneKey.World" @create="create" @update="update">
    <DungeonsWorldMap />
    <DungeonsWorldCharacterPlayer />
    <DungeonsWorldNpcList />
    <DungeonsWorldChestLayer />
    <DungeonsWorldMapForeground />
    <DungeonsWorldDialog />
    <DungeonsWorldMenu />
  </Scene>
</template>
