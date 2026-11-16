<script setup lang="ts">
import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { Position } from "grid-engine";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AttackGameObjectType } from "#src/models/dungeons/attack/AttackGameObjectType";
import { getAnimationCompleteEventKey } from "#src/services/dungeons/animation/getAnimationCompleteEventKey";
import { getAttackPosition } from "#src/services/dungeons/scene/battle/attack/getAttackPosition";
import { Sprite, useAnimations } from "vue-phaserjs";

interface Props {
  configuration:
    | {
        // Position can be inferred if we know that the attack is just a base sprite
        type: typeof AttackGameObjectType.Sprite;
      }
    | { position?: Partial<Position>; type: typeof AttackGameObjectType.Container };
  createAnimationConfigurations?: ((scene: SceneWithPlugins) => Types.Animations.Animation[]) | undefined;
  isToEnemy: boolean;
  playAnimationKey?: SpritesheetKey | undefined;
  spritesheetKey: SpritesheetKey;
}

const isActive = defineModel<boolean>("isActive", { required: true });
const { createAnimationConfigurations } = defineProps<Props>();
const frame = ref<number>();
const animations = createAnimationConfigurations ? useAnimations(createAnimationConfigurations, true) : undefined;
</script>

<template>
  <Sprite
    :configuration="{
      visible: isActive,
      ...(configuration.type === AttackGameObjectType.Sprite ? getAttackPosition(isToEnemy) : configuration.position),
      texture: spritesheetKey,
      frame,
      scale: 4,
      flipX: !isToEnemy,
      animations,
      playAnimationKey,
    }"
    immediate
    @[getAnimationCompleteEventKey(spritesheetKey)]="
      () => {
        isActive = false;
        frame = 0;
      }
    "
  />
</template>
