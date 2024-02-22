<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import type { Position } from "grid-engine";

interface HealthBarProps {
  position: Position;
  barPercentage: number;
}

const { position, barPercentage } = defineProps<HealthBarProps>();
</script>

<template>
  <Container :configuration="{ ...position }">
    <DungeonsBattleHealthBarShadow :position="position" />
    <DungeonsBattleHealthBar :position="position" :bar-percentage="barPercentage" />
  </Container>
</template>
