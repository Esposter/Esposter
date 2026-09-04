<script setup lang="ts">
import type { TileSpriteConfiguration } from "#src/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "#src/models/emit/TileSpriteEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { TileSpriteSetterMap } from "#src/util/setterMap/TileSpriteSetterMap";

interface TileSpriteEmits extends /** @vue-ignore */ TileSpriteEventEmitsOptions {}

interface Props {
  configuration: SetRequired<Partial<TileSpriteConfiguration>, "texture">;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, tileSprite: GameObjects.TileSprite) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
