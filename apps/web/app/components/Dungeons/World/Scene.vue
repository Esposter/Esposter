<script setup lang="ts">
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { getActiveInputResolvers } from "@/services/dungeons/scene/world/getActiveInputResolvers";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useCameraStore } from "vue-phaserjs";

const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const activeInputResolvers = getActiveInputResolvers();
const update = useResolveInput(activeInputResolvers);

const create = (scene: SceneWithPlugins) => {
  playDungeonsBackgroundMusic(scene, BackgroundMusicKey.AndTheJourneyBegins);
  fadeIn(scene, Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
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
