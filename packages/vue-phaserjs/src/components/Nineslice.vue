<script setup lang="ts">
import type { NinesliceConfiguration } from "#src/models/configuration/NinesliceConfiguration";
import type { NinesliceEventEmitsOptions } from "#src/models/emit/NinesliceEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { NinesliceSetterMap } from "#src/util/setterMap/NinesliceSetterMap";

interface NinesliceEmits extends /** @vue-ignore */ NinesliceEventEmitsOptions {}

interface Props {
  configuration: SetRequired<Partial<NinesliceConfiguration>, "texture">;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, nineSlice: GameObjects.NineSlice) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<NinesliceEmits>();

useInitializeGameObject(
  (scene) => {
    const { bottomHeight, frame, height, leftWidth, rightWidth, texture, topHeight, width, x, y } = configuration;
    const nineSlice = scene.add.nineslice(
      x ?? 0,
      y ?? 0,
      texture,
      frame,
      width,
      height,
      leftWidth,
      rightWidth,
      topHeight,
      bottomHeight,
    );
    onComplete?.(scene, nineSlice);
    return nineSlice;
  },
  () => configuration,
  emit,
  NinesliceSetterMap,
  immediate,
);
</script>

<template></template>
