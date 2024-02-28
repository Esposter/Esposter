<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { MENU_PADDING } from "@/services/dungeons/settings/menu/constants";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const width = computed(() => scene.value.scale.width - MENU_PADDING * 2);
const cornerCutLength = 32;
</script>

<template>
  <Nineslice
    :configuration="{
      width,
      height: 432,
      leftWidth: cornerCutLength,
      rightWidth: cornerCutLength,
      topHeight: cornerCutLength,
      bottomHeight: cornerCutLength,
      textureKey: ImageKey.MenuBackground,
      origin: 0,
    }"
  />
</template>
