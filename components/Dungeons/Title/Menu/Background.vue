<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { MENU_BACKGROUND_DISPLAY_WIDTH } from "@/services/dungeons/title/menu/constants";

const cornerCutLength = 32;
</script>

<template>
  <Nineslice
    :configuration="{
      x: 30,
      width: MENU_BACKGROUND_DISPLAY_WIDTH - cornerCutLength * 2,
      height: 180,
      leftWidth: cornerCutLength,
      rightWidth: cornerCutLength,
      topHeight: cornerCutLength,
      bottomHeight: cornerCutLength,
      textureKey: ImageKey.MenuBackground,
      origin: 0,
    }"
  />
</template>
