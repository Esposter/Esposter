<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import type { Position } from "grid-engine";

interface HealthBarProps {
  position: Position;
  width?: number;
  scaleY?: number;
  barPercentage: number;
}

const { position, width = 360, scaleY = 0.7, barPercentage } = defineProps<HealthBarProps>();
</script>

<template>
  <Container :configuration="{ ...position }">
    <DungeonsUIHealthBarShadow :position="position" :width="width" :scale-y="scaleY" />
    <DungeonsUIHealthBar :position="position" :width="width" :scale-y="scaleY" :bar-percentage="barPercentage" />
  </Container>
</template>
