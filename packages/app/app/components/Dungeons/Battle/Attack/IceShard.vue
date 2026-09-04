<script setup lang="ts">
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";

import { AttackKey } from "#shared/models/dungeons/keys/spritesheet/AttackKey";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import { getAnimationConfiguration } from "@/services/dungeons/animation/getAnimationConfiguration";
import { Animations } from "phaser";

const isActive = defineModel<boolean>("isActive", { required: true });
const { isToEnemy } = defineProps<AttackProps>();
const emit = defineEmits<{ complete: [] }>();
const playAnimationKey = usePlayAnimation(AttackKey["Ice Shard Start"], isActive, emit);
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
        getAnimationConfiguration(scene, AttackKey['Ice Shard']),
        getAnimationConfiguration(scene, AttackKey['Ice Shard Start']),
      ]
    "
    :play-animation-key
    @[onCompleteKey]="playAnimationKey = AttackKey['Ice Shard']"
  />
</template>
