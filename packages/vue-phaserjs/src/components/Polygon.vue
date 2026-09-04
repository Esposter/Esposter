<script setup lang="ts">
import type { PolygonConfiguration } from "#src/models/configuration/PolygonConfiguration";
import type { PolygonEventEmitsOptions } from "#src/models/emit/PolygonEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { PolygonSetterMap } from "#src/util/setterMap/PolygonSetterMap";

interface PolygonEmits extends /** @vue-ignore */ PolygonEventEmitsOptions {}

interface Props {
  configuration: Partial<PolygonConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, polygon: GameObjects.Polygon) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<PolygonEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, points, x, y } = configuration;
    const polygon = scene.add.polygon(x, y, points, fillColor, alpha);
    onComplete?.(scene, polygon);
    return polygon;
  },
  () => configuration,
  emit,
  PolygonSetterMap,
  immediate,
);
</script>

<template></template>
