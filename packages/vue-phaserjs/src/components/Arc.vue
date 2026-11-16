<script setup lang="ts">
import type { ArcConfiguration } from "#src/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "#src/models/emit/ArcEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ArcSetterMap } from "#src/services/setterMap/ArcSetterMap";

interface ArcEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

interface Props {
  configuration: UndefinedOnPartial<Partial<ArcConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, arc: GameObjects.Arc) => void) | undefined;
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
