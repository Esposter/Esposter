<script setup lang="ts">
import type { IsoTriangleConfiguration } from "#src/models/configuration/IsoTriangleConfiguration";
import type { IsoTriangleEventEmitsOptions } from "#src/models/emit/IsoTriangleEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { IsoTriangleSetterMap } from "#src/util/setterMap/IsoTriangleSetterMap";

interface IsoTriangleEmits extends /** @vue-ignore */ IsoTriangleEventEmitsOptions {}

interface Props {
  configuration: Partial<IsoTriangleConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, isoTriangle: GameObjects.IsoTriangle) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
