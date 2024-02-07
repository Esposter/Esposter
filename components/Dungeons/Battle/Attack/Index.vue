<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { type SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Position } from "grid-engine";
import { Animations, type Types } from "phaser";

interface AttackProps {
  position?: Partial<Position>;
  spritesheetKey: SpritesheetKey;
  animations?: Types.Animations.Animation[];
  playAnimationKey: SpritesheetKey | undefined;
}

const { position, spritesheetKey, animations, playAnimationKey } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const frame = ref<number>();
</script>

<template>
  <Sprite
    :configuration="{
      ...position,
      textureKey: spritesheetKey,
      frame,
      animations,
      playAnimationKey,
      visible: isActive,
      origin: 0.5,
      scale: 4,
    }"
    @[`${Animations.Events.ANIMATION_COMPLETE_KEY}${spritesheetKey}`]="
      {
        isActive = false;
        frame = 0;
      }
    "
  />
</template>
