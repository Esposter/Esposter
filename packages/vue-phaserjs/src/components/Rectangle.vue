<script setup lang="ts">
import type { RectangleConfiguration } from "#src/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "#src/models/emit/RectangleEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { RectangleSetterMap } from "#src/util/setterMap/RectangleSetterMap";

interface Props {
  configuration: Partial<RectangleConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, rectangle: GameObjects.Rectangle) => void;
}

interface RectangleEmits extends /** @vue-ignore */ RectangleEventEmitsOptions {}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
