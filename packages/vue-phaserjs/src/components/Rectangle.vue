<script setup lang="ts">
import type { RectangleConfiguration } from "@/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "@/models/emit/RectangleEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { RectangleSetterMap } from "@/util/setterMap/RectangleSetterMap";

interface RectangleEmits extends /** @vue-ignore */ RectangleEventEmitsOptions {}

interface RectangleProps {
  configuration: Partial<RectangleConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, rectangle: GameObjects.Rectangle) => void;
}

const { configuration, immediate, onComplete } = defineProps<RectangleProps>();
const emit = defineEmits<RectangleEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, height, width, x, y } = configuration;
    const rectangle = scene.add.rectangle(x, y, width, height, fillColor, alpha);
    onComplete?.(scene, rectangle);
    return rectangle;
  },
  () => configuration,
  emit,
  RectangleSetterMap,
  immediate,
);
</script>

<template></template>
