<script setup lang="ts">
import type { StarConfiguration } from "@/models/configuration/StarConfiguration";
import type { StarEventEmitsOptions } from "@/models/emit/StarEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { StarSetterMap } from "@/util/setterMap/StarSetterMap";

interface StarEmits extends /** @vue-ignore */ StarEventEmitsOptions {}

interface StarProps {
  configuration: Partial<StarConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, star: GameObjects.Star) => void;
}

const { configuration, immediate, onComplete } = defineProps<StarProps>();
const emit = defineEmits<StarEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, innerRadius, outerRadius, points, x, y } = configuration;
    const star = scene.add.star(x, y, points, innerRadius, outerRadius, fillColor, alpha);
    onComplete?.(scene, star);
    return star;
  },
  () => configuration,
  emit,
  StarSetterMap,
  immediate,
);
</script>

<template></template>
