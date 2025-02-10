<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
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
    @create="(scene) => playDungeonsBackgroundMusic(scene, FileKey.ThirdPartyXDeviruchiTitleTheme)"
    @update="(scene, _time, delta) => onPlayerInput(scene, controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
  </DungeonsScene>
</template>
