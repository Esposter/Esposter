<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
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
    :cls="SceneWithPlugins"
    @update="(_, __, delta) => onPlayerInput(controls.getInput(true), controls.getInput(), delta)"
  >
    <DungeonsSettingsContainer />
    <DungeonsJoystick />
    <DungeonsJoystickConfirmThumb />
  </Scene>
</template>
