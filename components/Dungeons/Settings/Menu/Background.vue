<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/constants";
import { MENU_HEIGHT } from "@/services/dungeons/settings/constants";

const glassPanelImageKey = useGlassPanelImageKey();
const width = useSettingsMenuWidth();
</script>

<template>
  <Nineslice
    :configuration="{
      width,
      height: MENU_HEIGHT,
      leftWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      rightWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      topHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      bottomHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      texture: glassPanelImageKey,
      origin: 0,
    }"
  />
</template>
