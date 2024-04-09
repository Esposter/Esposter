<script setup lang="ts">
import { AttackComponentMap } from "@/services/dungeons/battle/attack/AttackComponentMap";
import { useAttackManagerStore } from "@/store/dungeons/battle/attackManager";

const attackManagerStore = useAttackManagerStore();
const { attackId, isToEnemy, isActive, onComplete } = storeToRefs(attackManagerStore);
</script>

<template>
  <component
    :is="AttackComponentMap[attackId]"
    v-if="attackId !== undefined && isToEnemy !== undefined"
    v-model:is-active="isActive"
    :is-to-enemy="isToEnemy"
    @complete="
      () => {
        const callback = onComplete;
        attackId = isToEnemy = onComplete = undefined;
        callback?.();
      }
    "
  />
</template>
