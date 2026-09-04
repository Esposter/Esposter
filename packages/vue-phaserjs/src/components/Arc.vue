<script setup lang="ts">
import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "#src/models/emit/ArcEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ArcSetterMap } from "#src/util/setterMap/ArcSetterMap";

interface ArcEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

interface Props {
  configuration: Partial<ArcConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, arc: GameObjects.Arc) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<ArcEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, endAngle, fillColor, radius, startAngle, x, y } = configuration;
    const arc = scene.add.arc(x, y, radius, startAngle, endAngle, undefined, fillColor, alpha);
    onComplete?.(scene, arc);
    return arc;
  },
  () => configuration,
  emit,
  ArcSetterMap,
  immediate,
);
</script>

<template></template>
