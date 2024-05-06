<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { useInjectGame } from "@/lib/phaser/composables/useInjectGame";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/lib/phaser/models/emit/NineSliceEventEmitsOptions";
import { getScene } from "@/lib/phaser/util/getScene";
import { NineSliceSetterMap } from "@/lib/phaser/util/setterMap/NineSliceSetterMap";
import type { GameObjects } from "phaser";
import type { SetRequired } from "type-fest";

export interface NineSliceProps {
  configuration: SetRequired<Partial<NineSliceConfiguration>, "texture">;
}

interface NineSliceEmits extends /** @vue-ignore */ NineSliceEventEmitsOptions {}

const props = defineProps<NineSliceProps>();
const { configuration } = toRefs(props);
const { x, y, texture, frame, width, height, leftWidth, rightWidth, topHeight, bottomHeight } = configuration.value;
const emit = defineEmits<NineSliceEmits>();
const game = useInjectGame();
const sceneKey = useInjectSceneKey();
const scene = getScene(game, sceneKey);
const nineslice = ref() as Ref<GameObjects.NineSlice>;
useInitializeGameObject(nineslice, configuration, emit, NineSliceSetterMap);

onCreate(() => {
  nineslice.value = scene.add.nineslice(
    x ?? 0,
    y ?? 0,
    texture,
    frame,
    width,
    height,
    leftWidth,
    rightWidth,
    topHeight,
    bottomHeight,
  );
});
</script>

<template></template>
