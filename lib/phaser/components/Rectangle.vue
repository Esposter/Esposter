<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "@/lib/phaser/models/emit/RectangleEventEmitsOptions";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

interface RectangleProps {
  configuration: Partial<RectangleConfiguration>;
  onComplete?: (scene: SceneWithPlugins, rectangle: GameObjects.Rectangle) => void;
}

interface RectangleEmits extends /** @vue-ignore */ RectangleEventEmitsOptions {}

const props = defineProps<RectangleProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, width, height, fillColor, alpha } = configuration.value;
const emit = defineEmits<RectangleEmits>();
const rectangle = ref() as Ref<GameObjects.Rectangle>;

onCreate((scene) => {
  rectangle.value = scene.add.rectangle(x, y, width, height, fillColor, alpha);
  onComplete.value?.(scene, rectangle.value);
});

useInitializeGameObject(rectangle, configuration, emit, RectangleSetterMap);
</script>

<template></template>
