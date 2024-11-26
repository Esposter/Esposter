<script setup lang="ts">
import type { SpriteConfiguration } from "@/models/configuration/SpriteConfiguration";
import type { SpriteEventEmitsOptions } from "@/models/emit/SpriteEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { SpriteSetterMap } from "@/util/setterMap/SpriteSetterMap";

export interface SpriteProps {
  configuration: SetRequired<Partial<SpriteConfiguration>, "texture">;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, sprite: GameObjects.Sprite) => void;
}

interface SpriteEmits extends /** @vue-ignore */ SpriteEventEmitsOptions {}

const { configuration, immediate, onComplete } = defineProps<SpriteProps>();
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
