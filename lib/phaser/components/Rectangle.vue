<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import type { RectangleEventEmitsOptions } from "@/lib/phaser/models/emit/RectangleEventEmitsOptions";
import { RectangleSetterMap } from "@/lib/phaser/util/setterMap/RectangleSetterMap";
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
const scene = useInjectScene();
const rectangle = ref(scene.add.rectangle(x, y, width, height, fillColor, alpha)) as Ref<GameObjects.Rectangle>;
useInitializeGameObject(rectangle, configuration, emit, RectangleSetterMap);
onComplete.value?.(rectangle.value);
</script>

<template></template>
