<script setup lang="ts">
import type { TileSpriteConfiguration } from "@/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/models/emit/TileSpriteEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { TileSpriteSetterMap } from "@/util/setterMap/TileSpriteSetterMap";

export interface TileSpriteProps {
  configuration: SetRequired<Partial<TileSpriteConfiguration>, "texture">;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, tileSprite: GameObjects.TileSprite) => void;
}

interface TileSpriteEmits extends /** @vue-ignore */ TileSpriteEventEmitsOptions {}

const { configuration, immediate, onComplete } = defineProps<TileSpriteProps>();
const emit = defineEmits<TileSpriteEmits>();

useInitializeGameObject(
  (scene) => {
    const { frame, height, texture, width, x, y } = configuration;
    const tileSprite = scene.add.tileSprite(x ?? 0, y ?? 0, width ?? 0, height ?? 0, texture, frame);
    onComplete?.(scene, tileSprite);
    return tileSprite;
  },
  () => configuration,
  emit,
  TileSpriteSetterMap,
  immediate,
);
</script>

<template></template>
