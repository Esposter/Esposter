<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { getAttackPosition } from "@/services/dungeons/battle/attack/getAttackPosition";

interface ContainerProps {
  isToEnemy: boolean;
}

const { isToEnemy } = defineProps<ContainerProps>();
const isActive = defineModel<boolean>("isActive", { required: true });
const position = computed(() => getAttackPosition(isToEnemy));
</script>

<template>
  <Container :configuration="{ ...position, visible: isActive }">
    <slot />
  </Container>
</template>
