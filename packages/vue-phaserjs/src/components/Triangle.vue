<script setup lang="ts">
import type { TriangleConfiguration } from "@/models/configuration/TriangleConfiguration";
import type { TriangleEventEmitsOptions } from "@/models/emit/TriangleEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { TriangleSetterMap } from "@/util/setterMap/TriangleSetterMap";

interface TriangleEmits extends /** @vue-ignore */ TriangleEventEmitsOptions {}

interface TriangleProps {
  configuration: Partial<TriangleConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, triangle: GameObjects.Triangle) => void;
}

const { configuration, immediate, onComplete } = defineProps<TriangleProps>();
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
