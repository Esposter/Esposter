<script setup lang="ts">
import { MENU_PADDING } from "@/services/dungeons/scene/inventory/constants";
import { Rectangle } from "vue-phaserjs";

interface InventoryPanelProps {
  height: number;
  width: number;
}

defineSlots<{ default: () => VNode }>();
const { height, width } = defineProps<InventoryPanelProps>();
</script>

<template>
  <DungeonsUIGlassPanelNineSlice :width :height />
  <Rectangle
    :configuration="{
      x: MENU_PADDING,
      y: MENU_PADDING,
      origin: 0,
      width: width - MENU_PADDING * 2,
      height: height - MENU_PADDING * 2,
      fillColor: 0xffff88,
      alpha: 0.6,
    }"
  />
  <slot />
</template>
