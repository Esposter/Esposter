<script setup lang="ts">
import { SceneKey } from "vue-phaser";
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.MobileJoystick">
    <DungeonsMobileJoystick />
    <DungeonsMobileJoystickConfirmThumb />
  </DungeonsScene>
</template>
