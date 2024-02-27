<script setup lang="ts">
import Nineslice from "@/lib/phaser/components/Nineslice.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const padding = 100;
const width = computed(() => scene.value.scale.width - padding * 2);
const cornerCutLength = 32;
</script>

<template>
  <Nineslice
    :configuration="{
      x: padding,
      y: 20,
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
