<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { type Position } from "grid-engine";

interface HealthBarProps {
  position: Position;
}

const { position } = defineProps<HealthBarProps>();
const { x, y } = position;
const scaleY = 0.7;
</script>

<template>
  <Container :configuration="{ x, y }">
    <Image
      :configuration="{
        x,
        y,
        originX: 0,
        originY: 0.5,
        scaleY,
      }"
    />
  </Container>
</template>
