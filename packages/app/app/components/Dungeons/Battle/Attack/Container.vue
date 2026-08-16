<script setup lang="ts">
import { getAttackPosition } from "@/services/dungeons/scene/battle/attack/getAttackPosition";
import { Container } from "vue-phaserjs";

interface ContainerProps {
  isToEnemy: boolean;
}

defineSlots<{ default: () => VNode }>();
const isActive = defineModel<boolean>("isActive", { required: true });
const { isToEnemy } = defineProps<ContainerProps>();
</script>

<template>
  <Container :configuration="{ visible: isActive, ...getAttackPosition(isToEnemy) }">
    <slot />
  </Container>
</template>
