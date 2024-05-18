<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/lib/phaser/models/emit/NineSliceEventEmitsOptions";
import { NineSliceSetterMap } from "@/lib/phaser/util/setterMap/NineSliceSetterMap";
import type { SetRequired } from "type-fest";

export interface NineSliceProps {
  configuration: SetRequired<Partial<NineSliceConfiguration>, "texture">;
}

interface NineSliceEmits extends /** @vue-ignore */ NineSliceEventEmitsOptions {}

const { configuration } = defineProps<NineSliceProps>();
const emit = defineEmits<NineSliceEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y, texture, frame, width, height, leftWidth, rightWidth, topHeight, bottomHeight } = configuration;
    return scene.add.nineslice(
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
  },
  () => configuration,
  emit,
  NineSliceSetterMap,
);
</script>

<template></template>
