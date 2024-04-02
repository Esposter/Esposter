<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
</script>

<template>
  <Scene :scene-key="SceneKey.MobileJoystick" :cls="SceneWithPlugins">
    <DungeonsMobileJoystick />
    <DungeonsMobileJoystickConfirmThumb />
  </Scene>
</template>
