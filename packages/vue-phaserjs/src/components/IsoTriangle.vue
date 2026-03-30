<script setup lang="ts">
import type { IsoTriangleConfiguration } from "@/models/configuration/IsoTriangleConfiguration";
import type { IsoTriangleEventEmitsOptions } from "@/models/emit/IsoTriangleEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { IsoTriangleSetterMap } from "@/util/setterMap/IsoTriangleSetterMap";

interface IsoTriangleEmits extends /** @vue-ignore */ IsoTriangleEventEmitsOptions {}

interface IsoTriangleProps {
  configuration: Partial<IsoTriangleConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, isoTriangle: GameObjects.IsoTriangle) => void;
}

const { configuration, immediate, onComplete } = defineProps<IsoTriangleProps>();
const emit = defineEmits<IsoTriangleEmits>();

useInitializeGameObject(
  (scene) => {
    const { fillLeft, fillRight, fillTop, height, isReversed, size, x, y } = configuration;
    const isoTriangle = scene.add.isotriangle(x, y, size, height, isReversed, fillTop, fillLeft, fillRight);
    onComplete?.(scene, isoTriangle);
    return isoTriangle;
  },
  () => configuration,
  emit,
  IsoTriangleSetterMap,
  immediate,
);
</script>

<template></template>
