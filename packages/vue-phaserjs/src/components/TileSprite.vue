<script setup lang="ts">
import type { TileSpriteConfiguration } from "@/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/models/emit/TileSpriteEventEmitsOptions";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { TileSpriteSetterMap } from "@/util/setterMap/TileSpriteSetterMap";

export interface TileSpriteProps {
  configuration: SetRequired<Partial<TileSpriteConfiguration>, "texture">;
}

interface TileSpriteEmits extends /** @vue-ignore */ TileSpriteEventEmitsOptions {}

const { configuration } = defineProps<TileSpriteProps>();
const emit = defineEmits<TileSpriteEmits>();

useInitializeGameObject(
  (scene) => {
    const { frame, height, texture, width, x, y } = configuration;
    return scene.add.tileSprite(x ?? 0, y ?? 0, width ?? 0, height ?? 0, texture, frame);
  },
  () => configuration,
  emit,
  TileSpriteSetterMap,
);
</script>

<template></template>
