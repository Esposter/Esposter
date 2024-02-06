<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { type SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Position } from "grid-engine";
import { type Types } from "phaser";

interface AttackProps {
  position: Position;
  spritesheetKey: SpritesheetKey;
  frame: number;
  anims: Types.Animations.Animation;
  playAnimationKey: SpritesheetKey;
}

const { position, spritesheetKey, frame, anims, playAnimationKey } = defineProps<AttackProps>();
</script>

<template>
  <Sprite
    :configuration="{
      ...position,
      textureKey: spritesheetKey,
      frame,
      anims,
      playAnimationKey,
      origin: 0.5,
      scale: 4,
    }"
  />
</template>
