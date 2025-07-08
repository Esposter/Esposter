<script setup lang="ts">
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";

import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import { AttackKey } from "#shared/models/dungeons/keys/spritesheet/AttackKey";
import { Animations } from "phaser";

const { isToEnemy } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const emit = defineEmits<{ complete: [] }>();
const playSpriteAnimationKey = usePlayAnimation(AttackKey["Ice Shard Start"], isActive, emit);
const onCompleteKey = `${Animations.Events.ANIMATION_COMPLETE_KEY}${AttackKey["Ice Shard Start"]}`;
</script>

<template>
  <DungeonsBattleAttack
    v-model:is-active="isActive"
    :spritesheet-key="AttackKey['Ice Shard']"
    :is-to-enemy
    :configuration="{
      type: AttackGameObjectType.Sprite,
    }"
    :create-animation-configurations="
      (scene) => [
        {
          key: AttackKey['Ice Shard'],
          frames: scene.anims.generateFrameNumbers(AttackKey['Ice Shard']),
          frameRate: 16,
          repeat: 0,
          delay: 0,
        },
        {
          key: AttackKey['Ice Shard Start'],
          frames: scene.anims.generateFrameNumbers(AttackKey['Ice Shard Start']),
          frameRate: 16,
          repeat: 0,
          delay: 0,
        },
      ]
    "
    :play-animation-key="playSpriteAnimationKey"
    @[onCompleteKey]="playSpriteAnimationKey = AttackKey['Ice Shard']"
  />
</template>
