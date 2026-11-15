<script setup lang="ts">
import type { SceneWithPlugins } from "vue-phaserjs";

import { SceneKey } from "#src/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "#src/models/dungeons/keys/sound/BackgroundMusicKey";
import { playDungeonsBackgroundMusic } from "#src/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useControlsStore } from "#src/store/dungeons/controls";
import { useSettingsSceneStore } from "#src/store/dungeons/settings/scene";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const settingsSceneStore = useSettingsSceneStore();
const { onPlayerInput, restSettingsCursor } = settingsSceneStore;
const onCreate = (scene: SceneWithPlugins) => {
  restSettingsCursor();
  playDungeonsBackgroundMusic(scene, BackgroundMusicKey.Title);
};
</script>

<template>
  <DungeonsScene
    :scene-key="SceneKey.Settings"
    @create="(scene) => onCreate(scene)"
    @update="(scene, _time, delta) => onPlayerInput(scene, controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
  </DungeonsScene>
</template>
