<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/lib/phaser/models/emit/NineSliceEventEmitsOptions";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { NineSliceSetterMap } from "@/lib/phaser/util/setterMap/NineSliceSetterMap";
import type { SetRequired } from "@/util/types/SetRequired";
import type { GameObjects } from "phaser";

export interface NineSliceProps {
  configuration: SetRequired<Partial<NineSliceConfiguration>, "textureKey">;
  onComplete?: (nineslice: GameObjects.NineSlice) => void;
}

interface NineSliceEmits extends /** @vue-ignore */ NineSliceEventEmitsOptions {}

const props = defineProps<NineSliceProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, textureKey, frame, width, height, leftWidth, rightWidth, topHeight, bottomHeight } = configuration.value;
const emit = defineEmits<NineSliceEmits>();
const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const nineslice = ref(
  scene.value.add.nineslice(
    x ?? 0,
    y ?? 0,
    textureKey,
    frame,
    width,
    height,
    leftWidth,
    rightWidth,
    topHeight,
    bottomHeight,
  ),
) as Ref<GameObjects.NineSlice>;
useInitializeGameObject(nineslice, configuration, emit, NineSliceSetterMap);
onComplete.value?.(nineslice.value);
</script>

<template></template>
