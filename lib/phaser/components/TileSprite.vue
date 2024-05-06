<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { TileSpriteConfiguration } from "@/lib/phaser/models/configuration/TileSpriteConfiguration";
import type { TileSpriteEventEmitsOptions } from "@/lib/phaser/models/emit/TileSpriteEventEmitsOptions";
import { TileSpriteSetterMap } from "@/lib/phaser/util/setterMap/TileSpriteSetterMap";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

export interface TileSpriteProps {
  configuration: SetRequired<Partial<TileSpriteConfiguration>, "texture">;
}

interface TileSpriteEmits extends /** @vue-ignore */ TileSpriteEventEmitsOptions {}

const props = defineProps<TileSpriteProps>();
const { configuration } = toRefs(props);
const { x, y, width, height, texture, frame } = configuration.value;
const emit = defineEmits<TileSpriteEmits>();
const tileSprite = ref() as Ref<GameObjects.TileSprite>;

onCreate((scene) => {
  tileSprite.value = scene.add.tileSprite(x ?? 0, y ?? 0, width ?? 0, height ?? 0, texture, frame);
});

useInitializeGameObject(tileSprite, configuration, emit, TileSpriteSetterMap);
</script>

<template></template>
