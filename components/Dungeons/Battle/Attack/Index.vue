<script setup lang="ts">
import Sprite from "@/lib/phaser/components/Sprite.vue";
import { useAnimations } from "@/lib/phaser/composables/useAnimations";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import type { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { getAttackPosition } from "@/services/dungeons/scene/battle/attack/getAttackPosition";
import type { Position } from "grid-engine";
import type { Types } from "phaser";
import { Animations } from "phaser";

interface AttackProps {
  spritesheetKey: SpritesheetKey;
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
  createAnimationConfigurations?: (scene: SceneWithPlugins) => Types.Animations.Animation[];
  playAnimationKey?: SpritesheetKey;
}

const { spritesheetKey, isToEnemy, configuration, createAnimationConfigurations, playAnimationKey } =
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
    @[`${Animations.Events.ANIMATION_COMPLETE_KEY}${spritesheetKey}`]="
      {
        isActive = false;
        frame = 0;
      }
    "
  />
</template>
