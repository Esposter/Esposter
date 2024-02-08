<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { type Asset } from "@/models/dungeons/Asset";
import { TILE_SIZE } from "@/services/dungeons/world/constants";
import { type Position } from "grid-engine";

interface CharacterProps {
  position: Position;
  asset: Asset;
}

const { position, asset } = defineProps<CharacterProps>();
const tilePosition = computed(() => ({ x: position.x * TILE_SIZE, y: position.y * TILE_SIZE }));
</script>

<template>
  <Sprite :configuration="{ ...tilePosition, textureKey: asset.key, frame: asset.frame, origin: 0 }" />
</template>
