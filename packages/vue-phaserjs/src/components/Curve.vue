<script setup lang="ts">
import type { CurveConfiguration } from "@/models/configuration/CurveConfiguration";
import type { CurveEventEmitsOptions } from "@/models/emit/CurveEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { CurveSetterMap } from "@/util/setterMap/CurveSetterMap";

interface CurveEmits extends /** @vue-ignore */ CurveEventEmitsOptions {}

interface CurveProps {
  configuration: Partial<CurveConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, curve: GameObjects.Curve) => void;
}

const { configuration, immediate, onComplete } = defineProps<CurveProps>();
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
