<script setup lang="ts">
import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "#src/models/emit/ArcEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ArcSetterMap } from "#src/services/setterMap/ArcSetterMap";

interface CircleEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

interface Props {
  configuration: UndefinedOnPartial<Partial<ArcConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, circle: GameObjects.Arc) => void) | undefined;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<CircleEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, fillColor, radius, x, y } = configuration;
    const circle = scene.add.circle(x, y, radius, fillColor, alpha);
    onComplete?.(scene, circle);
    return circle;
  },
  () => configuration,
  emit,
  ArcSetterMap,
  immediate,
);
</script>

<template></template>
