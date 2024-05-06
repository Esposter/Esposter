<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "@/lib/phaser/models/emit/ImageEventEmitsOptions";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

export interface ImageProps {
  configuration: SetRequired<Partial<ImageConfiguration>, "texture">;
  onComplete?: (scene: SceneWithPlugins, image: GameObjects.Image) => void;
}

interface ImageEmits extends /** @vue-ignore */ ImageEventEmitsOptions {}

const props = defineProps<ImageProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, texture, frame } = configuration.value;
const emit = defineEmits<ImageEmits>();
const image = ref<GameObjects.Image>();

onCreate((scene) => {
  image.value = scene.add.image(x ?? 0, y ?? 0, texture, frame);
  onComplete.value?.(scene, image.value);
});

useInitializeGameObject(image, configuration, emit, ImageSetterMap);
</script>

<template></template>
