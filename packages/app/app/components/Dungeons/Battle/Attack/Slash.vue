<script setup lang="ts">
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";

import { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import { getAnimationConfiguration } from "@/services/dungeons/animation/getAnimationConfiguration";

const isActive = defineModel<boolean>("isActive", { required: true });
const { isToEnemy } = defineProps<AttackProps>();
const emit = defineEmits<{ complete: [] }>();
const playAnimationKey = usePlayAnimation(SpritesheetKey.Slash, isActive, emit);
</script>

<template>
  <DungeonsBattleAttackContainer v-model:is-active="isActive" :is-to-enemy>
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :spritesheet-key="SpritesheetKey.Slash"
      :is-to-enemy
      :configuration="{
        type: AttackGameObjectType.Container,
      }"
      :create-animation-configurations="(scene) => [getAnimationConfiguration(scene, SpritesheetKey.Slash)]"
      :play-animation-key
    />
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :spritesheet-key="SpritesheetKey.Slash"
      :is-to-enemy
      :configuration="{
        type: AttackGameObjectType.Container,
        position: { x: 30 },
      }"
      :play-animation-key
    />
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :spritesheet-key="SpritesheetKey.Slash"
      :is-to-enemy
      :configuration="{
        type: AttackGameObjectType.Container,
        position: { x: -30 },
      }"
      :play-animation-key
    />
  </DungeonsBattleAttackContainer>
</template>
