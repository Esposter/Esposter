<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { GLASS_PANEL_CORNER_CUT_LENGTH } from "@/services/dungeons/constants";
import { MENU_HEIGHT, MENU_HORIZONTAL_PADDING } from "@/services/dungeons/settings/menu/constants";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const width = computed(() => scene.value.scale.width - MENU_HORIZONTAL_PADDING * 2);
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
      textureKey: ImageKey.GlassPanel,
      origin: 0,
    }"
  />
</template>
