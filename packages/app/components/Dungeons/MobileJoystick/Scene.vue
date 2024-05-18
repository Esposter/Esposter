<script setup lang="ts">
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
</script>

<template>
  <Scene :scene-key="SceneKey.MobileJoystick">
    <DungeonsMobileJoystick />
    <DungeonsMobileJoystickConfirmThumb />
  </Scene>
</template>
