<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { getAttackPosition } from "@/services/dungeons/scene/battle/attack/getAttackPosition";

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
