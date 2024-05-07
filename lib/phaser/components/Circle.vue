<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/lib/phaser/models/emit/ArcEventEmitsOptions";
import { ArcSetterMap } from "@/lib/phaser/util/setterMap/ArcSetterMap";
import type { GameObjects } from "phaser";

interface CircleProps {
  configuration: Partial<ArcConfiguration>;
}

interface CircleEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

const { configuration } = defineProps<CircleProps>();
const emit = defineEmits<CircleEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y, radius, fillColor, alpha } = configuration;
    return scene.add.circle(x, y, radius, fillColor, alpha);
  },
  () => configuration,
  emit,
  ArcSetterMap,
);
</script>

<template></template>
