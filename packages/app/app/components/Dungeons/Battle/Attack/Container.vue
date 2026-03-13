<script setup lang="ts">
import { getAttackPosition } from "@/services/dungeons/scene/battle/attack/getAttackPosition";
import { Container } from "vue-phaserjs";

interface ContainerProps {
  isToEnemy: boolean;
}

defineSlots<{ default: () => VNode }>();
const isActive = defineModel<boolean>("isActive", { required: true });
const { isToEnemy } = defineProps<ContainerProps>();
const position = computed(() => getAttackPosition(isToEnemy));
</script>

<template>
  <Container :configuration="{ visible: isActive, ...position }">
    <slot />
  </Container>
</template>
