<script setup lang="ts">
import type { SpriteConfiguration } from "#src/models/configuration/SpriteConfiguration";
import type { SpriteEventEmitsOptions } from "#src/models/emit/SpriteEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { SpriteSetterMap } from "#src/util/setterMap/SpriteSetterMap";

interface SpriteEmits extends /** @vue-ignore */ SpriteEventEmitsOptions {}

interface Props {
  configuration: SetRequired<Partial<SpriteConfiguration>, "texture">;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, sprite: GameObjects.Sprite) => void;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<SpriteEmits>();

useInitializeGameObject(
  (scene) => {
    const { frame, texture, x, y } = configuration;
    const sprite = scene.add.sprite(x ?? 0, y ?? 0, texture, frame);
    onComplete?.(scene, sprite);
    return sprite;
  },
  () => configuration,
  emit,
  SpriteSetterMap,
  immediate,
);
</script>

<template></template>
