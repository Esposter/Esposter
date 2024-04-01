<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { NineSliceConfiguration } from "@/lib/phaser/models/configuration/NineSliceConfiguration";
import type { NineSliceEventEmitsOptions } from "@/lib/phaser/models/emit/NineSliceEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { NineSliceSetterMap } from "@/lib/phaser/util/setterMap/NineSliceSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { SetRequired } from "@/util/types/SetRequired";
import type { GameObjects } from "phaser";

export interface NineSliceProps {
  configuration: SetRequired<Partial<NineSliceConfiguration>, "texture">;
  onComplete?: (nineslice: GameObjects.NineSlice) => void;
}

interface NineSliceEmits extends /** @vue-ignore */ NineSliceEventEmitsOptions {}

const props = defineProps<NineSliceProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, texture, frame, width, height, leftWidth, rightWidth, topHeight, bottomHeight } = configuration.value;
const emit = defineEmits<NineSliceEmits>();
const scene = inject<SceneWithPlugins>(InjectionKeyMap.Scene);
if (!scene) throw new NotInitializedError("Scene");

const nineslice = ref(
  scene.add.nineslice(x ?? 0, y ?? 0, texture, frame, width, height, leftWidth, rightWidth, topHeight, bottomHeight),
) as Ref<GameObjects.NineSlice>;
useInitializeGameObject(nineslice, configuration, emit, NineSliceSetterMap);
onComplete.value?.(nineslice.value);
</script>

<template></template>
