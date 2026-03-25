<script setup lang="ts">
import type { ImageConfiguration } from "@/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "@/models/emit/ImageEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { ImageSetterMap } from "@/util/setterMap/ImageSetterMap";

export interface ImageProps {
  configuration: SetRequired<Partial<ImageConfiguration>, "texture">;
  onComplete?: (scene: SceneWithPlugins, image: GameObjects.Image) => void;
}

interface ImageEmits extends /** @vue-ignore */ ImageEventEmitsOptions {}

const { configuration, onComplete } = defineProps<ImageProps>();
const emit = defineEmits<ImageEmits>();

useInitializeGameObject(
  (scene) => {
    const { frame, texture, x, y } = configuration;
    const image = scene.add.image(x ?? 0, y ?? 0, texture, frame);
    onComplete?.(scene, image);
    return image;
  },
  () => configuration,
  emit,
  ImageSetterMap,
);
</script>

<template></template>
