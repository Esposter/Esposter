<script setup lang="ts">
import type { ImageConfiguration } from "#src/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "#src/models/emit/ImageEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { ImageSetterMap } from "#src/util/setterMap/ImageSetterMap";

interface ImageEmits extends /** @vue-ignore */ ImageEventEmitsOptions {}

interface Props {
  configuration: SetRequired<Partial<ImageConfiguration>, "texture">;
  onComplete?: (scene: SceneWithPlugins, image: GameObjects.Image) => void;
}

const { configuration, onComplete } = defineProps<Props>();
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
