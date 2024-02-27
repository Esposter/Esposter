<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const phaserStore = usePhaserStore();
const { switchToScene } = phaserStore;
const { scene } = storeToRefs(phaserStore);
const titleSceneStore = useTitleSceneStore();
const { onPlayerInput } = titleSceneStore;
const { optionGrid } = storeToRefs(titleSceneStore);
</script>

<template>
  <Scene :scene-key="SceneKey.Settings" :cls="SceneWithPlugins" @create="(scene) => {}" @update="onPlayerInput()">
    <DungeonsSettingsMenuContainer />
    <DungeonsJoystick />
    <DungeonsJoystickConfirmThumb />
  </Scene>
</template>
