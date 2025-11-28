<script setup lang="ts">
import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
</script>

<template>
  <DungeonsScene :scene-key="SceneKey.MobileJoystick">
    <DungeonsMobileJoystick />
    <DungeonsMobileJoystickConfirmThumb />
  </DungeonsScene>
</template>
