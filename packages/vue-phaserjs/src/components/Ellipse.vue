<script setup lang="ts">
import type { EllipseConfiguration } from "@/models/configuration/EllipseConfiguration";
import type { EllipseEventEmitsOptions } from "@/models/emit/EllipseEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { EllipseSetterMap } from "@/util/setterMap/EllipseSetterMap";

interface EllipseEmits extends /** @vue-ignore */ EllipseEventEmitsOptions {}

interface EllipseProps {
  configuration: Partial<EllipseConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, ellipse: GameObjects.Ellipse) => void;
}

const { configuration, immediate, onComplete } = defineProps<EllipseProps>();
const emit = defineEmits<EllipseEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, height, width, x, y } = configuration;
    const ellipse = scene.add.ellipse(x, y, width, height, fillColor, alpha);
    onComplete?.(scene, ellipse);
    return ellipse;
  },
  () => configuration,
  emit,
  EllipseSetterMap,
  immediate,
);
</script>

<template></template>
