<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/lib/phaser/models/emit/NineSliceEventEmitsOptions";
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
const scene = useInjectScene();
const nineslice = ref(
  scene.add.nineslice(x ?? 0, y ?? 0, texture, frame, width, height, leftWidth, rightWidth, topHeight, bottomHeight),
) as Ref<GameObjects.NineSlice>;
useInitializeGameObject(nineslice, configuration, emit, NineSliceSetterMap);
</script>

<template></template>
