<script setup lang="ts">
import { useAnimations } from "@/lib/phaser/composables/useAnimations";
import { AttackGameObjectType } from "@/models/dungeons/attack/AttackGameObjectType";
import type { AttackProps } from "@/models/dungeons/attack/AttackProps";
import { SpritesheetKey } from "@/models/dungeons/keys/spritesheet/SpritesheetKey";

const { isToEnemy } = defineProps<AttackProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const emit = defineEmits<{ complete: [] }>();
const playAnimationKey = usePlayAnimation(SpritesheetKey.Slash, isActive, emit);
const animations = useAnimations((scene) => [
  {
    key: SpritesheetKey.Slash,
    frames: scene.anims.generateFrameNumbers(SpritesheetKey.Slash),
    frameRate: 16,
    repeat: 0,
    delay: 0,
  },
]);
</script>

<template>
  <DungeonsBattleAttackContainer v-model:is-active="isActive" :is-to-enemy="isToEnemy">
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :spritesheet-key="SpritesheetKey.Slash"
      :animations
      :play-animation-key="playAnimationKey"
      :is-to-enemy="isToEnemy"
      :configuration="{
        type: AttackGameObjectType.Container,
      }"
    />
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :spritesheet-key="SpritesheetKey.Slash"
      :play-animation-key="playAnimationKey"
      :is-to-enemy="isToEnemy"
      :configuration="{
        type: AttackGameObjectType.Container,
        position: { x: 30 },
      }"
    />
    <DungeonsBattleAttack
      v-model:is-active="isActive"
      :spritesheet-key="SpritesheetKey.Slash"
      :play-animation-key="playAnimationKey"
      :is-to-enemy="isToEnemy"
      :configuration="{
        type: AttackGameObjectType.Container,
        position: { x: -30 },
      }"
    />
  </DungeonsBattleAttackContainer>
</template>
