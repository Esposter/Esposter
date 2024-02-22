<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import type { ImageEventEmitsOptions } from "@/lib/phaser/models/emit/ImageEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageSetterMap } from "@/lib/phaser/util/setterMap/ImageSetterMap";
import type { SetRequired } from "@/util/types/SetRequired";
import type { GameObjects } from "phaser";

export interface ImageProps {
  configuration: SetRequired<Partial<ImageConfiguration>, "textureKey">;
  onComplete?: (image: GameObjects.Image) => void;
}

interface ImageEmits extends /** @vue-ignore */ ImageEventEmitsOptions {}

const props = defineProps<ImageProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, textureKey, frame } = configuration.value;
const emit = defineEmits<ImageEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const image = ref(scene.value.add.image(x ?? 0, y ?? 0, textureKey, frame)) as Ref<GameObjects.Image>;
useInitializeGameObject(image, configuration, emit, ImageSetterMap);
onComplete.value?.(image.value);
</script>

<template></template>
