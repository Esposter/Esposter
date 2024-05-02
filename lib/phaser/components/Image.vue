<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "@/lib/phaser/models/emit/ImageEventEmitsOptions";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

export interface ImageProps {
  configuration: SetRequired<Partial<ImageConfiguration>, "texture">;
  onComplete?: (scene: ReturnType<typeof useInjectScene>, image: GameObjects.Image) => void;
}

interface ImageEmits extends /** @vue-ignore */ ImageEventEmitsOptions {}

const props = defineProps<ImageProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, texture, frame } = configuration.value;
const emit = defineEmits<ImageEmits>();
const scene = useInjectScene();
const image = ref(scene.add.image(x ?? 0, y ?? 0, texture, frame)) as Ref<GameObjects.Image>;
useInitializeGameObject(image, configuration, emit, ImageSetterMap);
onComplete.value?.(scene, image.value);
</script>

<template></template>
