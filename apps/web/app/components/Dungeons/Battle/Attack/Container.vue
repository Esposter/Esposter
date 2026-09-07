<script setup lang="ts">
import { getAttackPosition } from "@/services/dungeons/scene/battle/attack/getAttackPosition";
import { Container } from "vue-phaserjs";

interface Props {
  isToEnemy: boolean;
}

defineSlots<{ default: () => VNode }>();
const isActive = defineModel<boolean>("isActive", { required: true });
const { isToEnemy } = defineProps<Props>();
</script>

<template>
  <Container :configuration="{ visible: isActive, ...getAttackPosition(isToEnemy) }">
    <slot />
  </Container>
</template>
