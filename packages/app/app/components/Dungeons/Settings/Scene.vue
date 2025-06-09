<script setup lang="ts">
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useControlsStore } from "@/store/dungeons/controls";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const settingsSceneStore = useSettingsSceneStore();
const { onPlayerInput } = settingsSceneStore;
</script>

<template>
  <DungeonsScene
    :scene-key="SceneKey.Settings"
    @create="playDungeonsBackgroundMusic($event, BackgroundMusicKey.Title)"
    @update="(scene, _time, delta) => onPlayerInput(scene, controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
  </DungeonsScene>
</template>
