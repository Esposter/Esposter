<script setup lang="ts">
import type { NinesliceConfiguration } from "@/models/configuration/NinesliceConfiguration";
import type { NinesliceEventEmitsOptions } from "@/models/emit/NinesliceEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { NinesliceSetterMap } from "@/util/setterMap/NinesliceSetterMap";

export interface NinesliceProps {
  configuration: SetRequired<Partial<NinesliceConfiguration>, "texture">;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, nineSlice: GameObjects.NineSlice) => void;
}

interface NinesliceEmits extends /** @vue-ignore */ NinesliceEventEmitsOptions {}

const { configuration, immediate, onComplete } = defineProps<NinesliceProps>();
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
