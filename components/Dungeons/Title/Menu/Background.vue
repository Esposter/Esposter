<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/constants";
import { MENU_BACKGROUND_WIDTH } from "@/services/dungeons/title/menu/constants";

const glassPanelImageKey = useGlassPanelImageKey();
</script>

<template>
  <Nineslice
    :configuration="{
      width: MENU_BACKGROUND_WIDTH,
      height: 180,
      leftWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      rightWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      topHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      bottomHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      textureKey: glassPanelImageKey,
      origin: 0,
    }"
  />
</template>
