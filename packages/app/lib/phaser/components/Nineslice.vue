<script setup lang="ts">
import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/lib/phaser/models/emit/NineSliceEventEmitsOptions";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { NineSliceSetterMap } from "@/lib/phaser/util/setterMap/NineSliceSetterMap";

export interface NineSliceProps {
  configuration: SetRequired<Partial<NineSliceConfiguration>, "texture">;
}

interface NineSliceEmits extends /** @vue-ignore */ NineSliceEventEmitsOptions {}

const { configuration } = defineProps<NineSliceProps>();
const emit = defineEmits<NineSliceEmits>();

useInitializeGameObject(
  (scene) => {
    const { bottomHeight, frame, height, leftWidth, rightWidth, texture, topHeight, width, x, y } = configuration;
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
