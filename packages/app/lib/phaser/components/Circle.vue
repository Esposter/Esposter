<script setup lang="ts">
import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/lib/phaser/models/emit/ArcEventEmitsOptions";

import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { ArcSetterMap } from "@/lib/phaser/util/setterMap/ArcSetterMap";

interface CircleProps {
  configuration: Partial<ArcConfiguration>;
}

interface CircleEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

const { configuration } = defineProps<CircleProps>();
const emit = defineEmits<CircleEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, radius, x, y } = configuration;
    return scene.add.circle(x, y, radius, fillColor, alpha);
  },
  () => configuration,
  emit,
  ArcSetterMap,
);
</script>

<template></template>
