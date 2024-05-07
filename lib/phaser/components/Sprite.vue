<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import type { SpriteEventEmitsOptions } from "@/lib/phaser/models/emit/SpriteEventEmitsOptions";
import { SpriteSetterMap } from "@/lib/phaser/util/setterMap/SpriteSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

export interface SpriteProps {
  configuration: SetRequired<Partial<SpriteConfiguration>, "texture">;
  onComplete?: (scene: SceneWithPlugins, sprite: GameObjects.Sprite) => void;
}

interface SpriteEmits extends /** @vue-ignore */ SpriteEventEmitsOptions {}

const { configuration, onComplete } = defineProps<SpriteProps>();
const emit = defineEmits<SpriteEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y, texture, frame } = configuration;
    const sprite = scene.add.sprite(x ?? 0, y ?? 0, texture, frame);
    onComplete?.(scene, sprite);
    return sprite;
  },
  () => configuration,
  emit,
  SpriteSetterMap,
);
</script>

<template></template>
