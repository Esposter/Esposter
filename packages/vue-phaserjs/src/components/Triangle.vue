<script setup lang="ts">
import type { TriangleConfiguration } from "#src/models/configuration/TriangleConfiguration";
import type { TriangleEventEmitsOptions } from "#src/models/emit/TriangleEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { TriangleSetterMap } from "#src/util/setterMap/TriangleSetterMap";

interface TriangleEmits extends /** @vue-ignore */ TriangleEventEmitsOptions {}

interface Props {
  configuration: Partial<TriangleConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, triangle: GameObjects.Triangle) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<TriangleEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, to, x, y } = configuration;
    const triangle = scene.add.triangle(x, y, to?.[0], to?.[1], to?.[2], to?.[3], to?.[4], to?.[5], fillColor, alpha);
    onComplete?.(scene, triangle);
    return triangle;
  },
  () => configuration,
  emit,
  TriangleSetterMap,
  immediate,
);
</script>

<template></template>
