<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import { getAttackPosition } from "@/services/dungeons/battle/attack/getAttackPosition";
import type { Position } from "grid-engine";
import type { Types } from "phaser";
import { Animations } from "phaser";

interface AttackProps {
  spritesheetKey: SpritesheetKey;
  animations?: Types.Animations.Animation[];
  playAnimationKey: SpritesheetKey | undefined;
  isToEnemy: boolean;
  configuration:
    | {
        // Position can be inferred if we know that the attack is just a base sprite
        type: AttackGameObjectType.Sprite;
      }
    | {
        type: AttackGameObjectType.Container;
        position?: Partial<Position>;
      };
}

const { spritesheetKey, animations, playAnimationKey, isToEnemy, configuration } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const frame = ref<number>();
const position = computed(() =>
  configuration.type === AttackGameObjectType.Sprite ? getAttackPosition(isToEnemy) : configuration.position,
);
</script>

<template>
  <Sprite
    :configuration="{
      visible: isActive,
      ...position,
      textureKey: spritesheetKey,
      frame,
      animations,
      playAnimationKey,
      scale: 4,
      flipX: !isToEnemy,
    }"
    @[`${Animations.Events.ANIMATION_COMPLETE_KEY}${spritesheetKey}`]="
      {
        isActive = false;
        frame = 0;
      }
    "
  />
</template>
