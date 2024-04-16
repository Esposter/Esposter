<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsSceneStore = useSettingsSceneStore();
const { onPlayerInput } = settingsSceneStore;
</script>

<template>
  <Scene
    :scene-key="SceneKey.Settings"
    @create="(scene) => useDungeonsBackgroundMusic(BackgroundMusicKey.Title, scene.scene.key)"
    @update="(_scene, _time, delta) => onPlayerInput(controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
  </Scene>
</template>
