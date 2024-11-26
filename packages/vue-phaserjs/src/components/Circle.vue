<script setup lang="ts">
import type { ArcConfiguration } from "@/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/models/emit/ArcEventEmitsOptions";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { ArcSetterMap } from "@/util/setterMap/ArcSetterMap";

interface CircleEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

interface CircleProps {
  configuration: Partial<ArcConfiguration>;
}

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
