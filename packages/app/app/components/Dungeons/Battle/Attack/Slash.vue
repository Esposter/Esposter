<script setup lang="ts">
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";

import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";

const { isToEnemy } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
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
      :create-animation-configurations="
        (scene) => [
          {
            key: SpritesheetKey.Slash,
            frames: scene.anims.generateFrameNumbers(SpritesheetKey.Slash),
            frameRate: 16,
            repeat: 0,
            delay: 0,
          },
        ]
      "
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
