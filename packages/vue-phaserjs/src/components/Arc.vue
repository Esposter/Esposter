<script setup lang="ts">
import type { ArcConfiguration } from "@/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/models/emit/ArcEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { ArcSetterMap } from "@/util/setterMap/ArcSetterMap";

interface ArcEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

interface ArcProps {
  configuration: Partial<ArcConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, arc: GameObjects.Arc) => void;
}

const { configuration, immediate, onComplete } = defineProps<ArcProps>();
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
