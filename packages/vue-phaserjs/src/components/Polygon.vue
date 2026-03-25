<script setup lang="ts">
import type { PolygonConfiguration } from "@/models/configuration/PolygonConfiguration";
import type { PolygonEventEmitsOptions } from "@/models/emit/PolygonEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { PolygonSetterMap } from "@/util/setterMap/PolygonSetterMap";

interface PolygonEmits extends /** @vue-ignore */ PolygonEventEmitsOptions {}

interface PolygonProps {
  configuration: Partial<PolygonConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, polygon: GameObjects.Polygon) => void;
}

const { configuration, immediate, onComplete } = defineProps<PolygonProps>();
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
