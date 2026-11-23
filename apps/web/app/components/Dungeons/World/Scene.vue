<script setup lang="ts">
import type { SceneWithPlugins } from "vue-phaserjs";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { getActiveInputResolvers } from "#src/services/dungeons/scene/world/getActiveInputResolvers";
import { playDungeonsBackgroundMusic } from "#src/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { useCameraStore } from "vue-phaserjs";

const cameraStore = useCameraStore();
const { fadeIn } = cameraStore;
const activeInputResolvers = getActiveInputResolvers();
const update = useResolveInput(activeInputResolvers);
const worldSceneStore = useWorldSceneStore();
const { updateGridEngine } = worldSceneStore;

const create = (scene: SceneWithPlugins) => {
  playDungeonsBackgroundMusic(scene, DungeonsKeys.ThirdPartyXDeviruchiAndTheJourneyBegins);
  fadeIn(scene, Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
};
</script>

<template>
  <DungeonsScene
    :scene-key="SceneKey.World"
    @create="(scene) => create(scene)"
    @update="
      (scene, _time, delta) => {
        update(scene);
        // The grid engine steps its characters with the frame's delta, once the frame's input has resolved
        updateGridEngine(delta);
      }
    "
  >
    <DungeonsWorldMap />
    <DungeonsWorldCharacterPlayer />
    <DungeonsWorldNpcList />
    <DungeonsWorldChestLayer />
    <DungeonsWorldMapForeground />
    <DungeonsWorldDialog />
    <DungeonsWorldMenu />
  </DungeonsScene>
</template>
