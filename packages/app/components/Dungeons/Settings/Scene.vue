<script setup lang="ts">
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { playDungeonsBackgroundMusic } from "@/services/dungeons/sound/playDungeonsBackgroundMusic";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import Scene, { SceneKey, useInputStore } from "vue-phaser";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const settingsSceneStore = useSettingsSceneStore();
const { onPlayerInput } = settingsSceneStore;
</script>

<template>
  <Scene
    :scene-key="SceneKey.Settings"
    @create="(scene) => playDungeonsBackgroundMusic(scene, BackgroundMusicKey.Title)"
    @update="(scene, _time, delta) => onPlayerInput(scene, controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
  </DungeonsScene>
</template>
