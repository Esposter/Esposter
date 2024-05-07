<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "@/lib/phaser/models/emit/RectangleEventEmitsOptions";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

interface RectangleProps {
  configuration: Partial<RectangleConfiguration>;
  onComplete?: (scene: SceneWithPlugins, rectangle: GameObjects.Rectangle) => void;
}

interface RectangleEmits extends /** @vue-ignore */ RectangleEventEmitsOptions {}

const { configuration, onComplete } = defineProps<RectangleProps>();
const emit = defineEmits<RectangleEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y, width, height, fillColor, alpha } = configuration;
    const rectangle = scene.add.rectangle(x, y, width, height, fillColor, alpha);
    onComplete?.(scene, rectangle);
    return rectangle;
  },
  () => configuration,
  emit,
  RectangleSetterMap,
);
</script>

<template></template>
