<script setup lang="ts">
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/UI/glassPanel/constants";
import { Nineslice } from "vue-phaserjs";

interface GlassPanelNineSliceProps {
  height?: number;
  width?: number;
}

const { height, width } = defineProps<GlassPanelNineSliceProps>();
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
