<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { TileSpriteConfiguration } from "@/lib/phaser/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/lib/phaser/models/emit/TileSpriteEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { TileSpriteSetterMap } from "@/lib/phaser/util/setterMap/TileSpriteSetterMap";
import type { SetRequired } from "@/util/types/SetRequired";
import type { GameObjects } from "phaser";

export interface TileSpriteProps {
  configuration: SetRequired<Partial<TileSpriteConfiguration>, "texture">;
}

interface TileSpriteEmits extends /** @vue-ignore */ TileSpriteEventEmitsOptions {}

const props = defineProps<TileSpriteProps>();
const { configuration } = toRefs(props);
const { x, y, width, height, texture, frame } = configuration.value;
const emit = defineEmits<TileSpriteEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const tileSprite = ref(
  scene.value.add.tileSprite(x ?? 0, y ?? 0, width ?? 0, height ?? 0, texture, frame),
) as Ref<GameObjects.TileSprite>;
useInitializeGameObject(tileSprite, configuration, emit, TileSpriteSetterMap);
</script>

<template></template>
