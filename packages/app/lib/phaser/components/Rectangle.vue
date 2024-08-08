<script setup lang="ts">
import type { RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "@/lib/phaser/models/emit/RectangleEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";

interface RectangleProps {
  configuration: Partial<RectangleConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, rectangle: GameObjects.Rectangle) => void;
}

interface RectangleEmits extends /** @vue-ignore */ RectangleEventEmitsOptions {}

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
