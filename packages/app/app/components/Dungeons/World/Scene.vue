<script setup lang="ts">
import type { SceneWithPlugins } from "vue-phaserjs";

import { dayjs } from "#shared/services/dayjs";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "#shared/models/dungeons/keys/sound/BackgroundMusicKey";
import { getActiveInputResolvers } from "@/services/dungeons/scene/world/getActiveInputResolvers";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useControlsStore } from "@/store/dungeons/controls";
import { useCameraStore } from "vue-phaserjs";

const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
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
