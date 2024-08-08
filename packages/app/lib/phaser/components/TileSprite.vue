<script setup lang="ts">
import type { TileSpriteConfiguration } from "@/lib/phaser/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/lib/phaser/models/emit/TileSpriteEventEmitsOptions";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { TileSpriteSetterMap } from "@/lib/phaser/util/setterMap/TileSpriteSetterMap";

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
