<script setup lang="ts">
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { Position } from "grid-engine";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import { getAttackPosition } from "@/services/dungeons/scene/battle/attack/getAttackPosition";
import { Animations } from "phaser";
import { Sprite, useAnimations } from "vue-phaserjs";

interface AttackProps {
  configuration:
    | {
        // Position can be inferred if we know that the attack is just a base sprite
        type: AttackGameObjectType.Sprite;
      }
    | {
        position?: Partial<Position>;
        type: AttackGameObjectType.Container;
      };
  createAnimationConfigurations?: (scene: SceneWithPlugins) => Types.Animations.Animation[];
  isToEnemy: boolean;
  playAnimationKey?: SpritesheetKey;
  spritesheetKey: SpritesheetKey;
}

const { configuration, createAnimationConfigurations, isToEnemy, playAnimationKey, spritesheetKey } =
  defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const frame = ref<number>();
const position = computed(() =>
  configuration.type === AttackGameObjectType.Sprite ? getAttackPosition(isToEnemy) : configuration.position,
);
const animations = createAnimationConfigurations ? useAnimations(createAnimationConfigurations, true) : undefined;
</script>

<template>
  <Sprite
    :configuration="{
      visible: isActive,
      ...position,
      texture: spritesheetKey,
      frame,
      scale: 4,
      flipX: !isToEnemy,
      animations,
      playAnimationKey,
    }"
    immediate
    @[`${Animations.Events.ANIMATION_COMPLETE_KEY}${spritesheetKey}`]="
      () => {
        isActive = false;
        frame = 0;
      }
    "
  />
</template>
