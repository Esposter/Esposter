<script setup lang="ts">
import type { StarConfiguration } from "#src/models/configuration/StarConfiguration";
import type { StarEventEmitsOptions } from "#src/models/emit/StarEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { StarSetterMap } from "#src/util/setterMap/StarSetterMap";

interface Props {
  configuration: Partial<StarConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, star: GameObjects.Star) => void;
}

interface StarEmits extends /** @vue-ignore */ StarEventEmitsOptions {}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
