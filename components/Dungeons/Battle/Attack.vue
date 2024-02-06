<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { type SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Position } from "grid-engine";

interface AttackProps {
  position: Position;
  spritesheetKey: SpritesheetKey;
  frame: number;
  isPlayingAnimation: boolean;
}

const { position, spritesheetKey, frame, isPlayingAnimation } = defineProps<AttackProps>();
</script>

<template>
  <Sprite
    :configuration="{ ...position, textureKey: spritesheetKey, frame, isPlayingAnimation, origin: 0.5, scale: 4 }"
  />
</template>
