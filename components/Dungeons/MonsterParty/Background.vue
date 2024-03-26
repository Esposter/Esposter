<script setup lang="ts">
import TileSprite from "@/lib/phaser/components/TileSprite.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
</script>

<template>
  <TileSprite
    :configuration="{
      width: scene.scale.width,
      height: scene.scale.height,
      texture: ImageKey.MonsterPartyBackground,
      origin: 0,
      alpha: 0.7,
    }"
  />
</template>
