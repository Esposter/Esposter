<script setup lang="ts">
import type { EllipseConfiguration } from "#src/models/configuration/EllipseConfiguration";
import type { EllipseEventEmitsOptions } from "#src/models/emit/EllipseEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { EllipseSetterMap } from "#src/util/setterMap/EllipseSetterMap";

interface EllipseEmits extends /** @vue-ignore */ EllipseEventEmitsOptions {}

interface Props {
  configuration: Partial<EllipseConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, ellipse: GameObjects.Ellipse) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
