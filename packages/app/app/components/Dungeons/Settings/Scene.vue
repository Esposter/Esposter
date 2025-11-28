<script setup lang="ts">
<<<<<<< HEAD
import { FileKey } from "#shared/generated/phaser/FileKey";
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
=======
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "#shared/models/dungeons/keys/sound/BackgroundMusicKey";
>>>>>>> main
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
    @create="playDungeonsBackgroundMusic($event, FileKey.ThirdPartyXDeviruchiTitleTheme)"
    @update="(scene, _time, delta) => onPlayerInput(scene, controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
  </DungeonsScene>
</template>
