<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/UI/glassPanel/constants";

interface GlassPanelNineSliceProps {
  width?: number;
  height?: number;
}

const { width, height } = defineProps<GlassPanelNineSliceProps>();
const glassPanelImageKey = useGlassPanelImageKey();
</script>

<template>
  <Nineslice
    :configuration="{
      origin: 0,
      width,
      height,
      leftWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      rightWidth: GLASS_PANEL_CORNER_CUT_LENGTH,
      topHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      bottomHeight: GLASS_PANEL_CORNER_CUT_LENGTH,
      texture: glassPanelImageKey,
    }"
  />
</template>
