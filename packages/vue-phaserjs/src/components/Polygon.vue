<script setup lang="ts">
import type { PolygonConfiguration } from "#src/models/configuration/PolygonConfiguration";
import type { PolygonEventEmitsOptions } from "#src/models/emit/PolygonEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { PolygonSetterMap } from "#src/services/setterMap/PolygonSetterMap";

interface PolygonEmits extends /** @vue-ignore */ PolygonEventEmitsOptions {}

interface Props {
  configuration: UndefinedOnPartial<Partial<PolygonConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, polygon: GameObjects.Polygon) => void) | undefined;
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
