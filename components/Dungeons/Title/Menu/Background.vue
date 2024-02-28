<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/constants";
import { MENU_BACKGROUND_WIDTH } from "@/services/dungeons/title/menu/constants";
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
      textureKey: ImageKey.GlassPanel,
      origin: 0,
    }"
  />
</template>
