<script setup lang="ts">
import { getAttackPosition } from "@/services/dungeons/scene/battle/attack/getAttackPosition";
import { Container } from "vue-phaser";

interface ContainerProps {
  isToEnemy: boolean;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { isToEnemy } = defineProps<ContainerProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const position = computed(() => getAttackPosition(isToEnemy));
</script>

<template>
  <Container :configuration="{ visible: isActive, ...position }">
    <slot />
  </Container>
</template>
