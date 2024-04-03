<script setup lang="ts">
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import TileSprite from "@/lib/phaser/components/TileSprite.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
</script>

<template>
  <Rectangle
    :configuration="{
      origin: 0,
      width: scene.scale.width,
      height: scene.scale.height,
      fillColor: 0x000000,
    }"
  />
  <TileSprite
    :configuration="{
      origin: 0,
      width: scene.scale.width,
      height: scene.scale.height,
      texture: ImageKey.MonsterPartyBackground,
      alpha: 0.7,
    }"
  />
</template>
