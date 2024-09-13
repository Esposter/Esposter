<script setup lang="ts">
import type { SceneWithPlugins } from "vue-phaser";

import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { dayjs } from "@/services/dayjs";
import { getActiveInputResolvers } from "@/services/dungeons/scene/world/getActiveInputResolvers";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { SceneKey, useCameraStore, useInputStore } from "vue-phaser";

const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const inputResolvers = getActiveInputResolvers();

const create = (scene: SceneWithPlugins) => {
  playDungeonsBackgroundMusic(scene, BackgroundMusicKey.AndTheJourneyBegins);
  fadeIn(scene, dayjs.duration(1, "second").asMilliseconds());
};

const update = async (scene: SceneWithPlugins) => {
  const justDownInput = controls.value.getInput(true);
  const input = controls.value.getInput();

  for (const inputResolver of inputResolvers) if (await inputResolver.handleInput(scene, justDownInput, input)) return;
};
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.World" @create="create" @update="update">
    <DungeonsWorldMap />
    <DungeonsWorldCharacterPlayer />
    <DungeonsWorldNpcList />
    <DungeonsWorldChestLayer />
    <DungeonsWorldMapForeground />
    <DungeonsWorldDialog />
    <DungeonsWorldMenu />
  </DungeonsScene>
</template>
