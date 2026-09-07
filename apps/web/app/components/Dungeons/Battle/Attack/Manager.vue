<script setup lang="ts">
import { AttackComponentMap } from "@/services/dungeons/scene/battle/attack/AttackComponentMap";
import { useAttackManagerStore } from "@/store/dungeons/battle/attackManager";

const attackManagerStore = useAttackManagerStore();
const { completeAttack } = attackManagerStore;
const { attackId, isActive, isToEnemy } = storeToRefs(attackManagerStore);
</script>

<template>
  <component
    :is="AttackComponentMap[attackId]"
    v-if="attackId !== undefined && isToEnemy !== undefined"
    v-model:is-active="isActive"
    :is-to-enemy
    @complete="completeAttack()"
  />
</template>
