<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const settingsSceneStore = useSettingsSceneStore();
const { onPlayerInput } = settingsSceneStore;
</script>

<template>
  <Scene
    :scene-key="SceneKey.Settings"
    @create="(scene) => useDungeonsBackgroundMusic(scene, BackgroundMusicKey.Title)"
    @update="(scene, _time, delta) => onPlayerInput(scene, controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
  </Scene>
</template>
