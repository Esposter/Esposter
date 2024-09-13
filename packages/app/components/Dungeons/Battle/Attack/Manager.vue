<script setup lang="ts">
import { AttackComponentMap } from "@/services/dungeons/scene/battle/attack/AttackComponentMap";
import { ExternalAttackManagerStore, useAttackManagerStore } from "@/store/dungeons/battle/attackManager";

const attackManagerStore = useAttackManagerStore();
const { attackId, isActive, isToEnemy } = storeToRefs(attackManagerStore);
</script>

<template>
  <component
    :is="AttackComponentMap[attackId]"
    v-if="attackId !== undefined && isToEnemy !== undefined"
    v-model:is-active="isActive"
    :is-to-enemy
    @complete="
      () => {
        const callback = ExternalAttackManagerStore.onComplete;
        attackId = isToEnemy = ExternalAttackManagerStore.onComplete = undefined;
        callback?.();
      }
    "
  />
</template>
