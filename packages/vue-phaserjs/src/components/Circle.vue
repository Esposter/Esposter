<script setup lang="ts">
import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "#src/models/emit/ArcEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ArcSetterMap } from "#src/util/setterMap/ArcSetterMap";

interface CircleEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

interface Props {
  configuration: Partial<ArcConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, circle: GameObjects.Arc) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<CircleEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, radius, x, y } = configuration;
    const circle = scene.add.circle(x, y, radius, fillColor, alpha);
    onComplete?.(scene, circle);
    return circle;
  },
  () => configuration,
  emit,
  ArcSetterMap,
  immediate,
);
</script>

<template></template>
