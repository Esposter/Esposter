<script setup lang="ts">
import type { CurveConfiguration } from "#src/models/configuration/CurveConfiguration";
import type { CurveEventEmitsOptions } from "#src/models/emit/CurveEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { CurveSetterMap } from "#src/util/setterMap/CurveSetterMap";

interface CurveEmits extends /** @vue-ignore */ CurveEventEmitsOptions {}

interface Props {
  configuration: Partial<CurveConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, curve: GameObjects.Curve) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<CurveEmits>();

useInitializeGameObject(
  (scene) => {
    const { alpha, curve, fillColor, x, y } = configuration;
    const curveObject = scene.add.curve(x, y, curve, fillColor, alpha);
    onComplete?.(scene, curveObject);
    return curveObject;
  },
  () => configuration,
  emit,
  CurveSetterMap,
  immediate,
);
</script>

<template></template>
