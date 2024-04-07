<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "@/lib/phaser/models/emit/RectangleEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { GameObjects } from "phaser";

interface RectangleProps {
  configuration: Partial<RectangleConfiguration>;
  onComplete?: (rectangle: GameObjects.Rectangle) => void;
}

interface RectangleEmits extends /** @vue-ignore */ RectangleEventEmitsOptions {}

const props = defineProps<RectangleProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, width, height, fillColor, alpha } = configuration.value;
const emit = defineEmits<RectangleEmits>();
const scene = inject<SceneWithPlugins>(InjectionKeyMap.Scene);
if (!scene) throw new NotInitializedError("Scene");
console.log(height);
const rectangle = ref(scene.add.rectangle(x, y, width, height, fillColor, alpha)) as Ref<GameObjects.Rectangle>;
useInitializeGameObject(rectangle, configuration, emit, RectangleSetterMap);
onComplete.value?.(rectangle.value);
</script>

<template></template>
