<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/lib/phaser/models/emit/ArcEventEmitsOptions";
import { ArcSetterMap } from "@/lib/phaser/util/setterMap/ArcSetterMap";
import type { GameObjects } from "phaser";

interface CircleProps {
  configuration: Partial<ArcConfiguration>;
  onComplete?: (circle: GameObjects.Arc) => void;
}

interface CircleEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

const props = defineProps<CircleProps>();
const { configuration, onComplete } = toRefs(props);
const { x, y, radius, fillColor, alpha } = configuration.value;
const emit = defineEmits<CircleEmits>();
const scene = useInjectScene();
const circle = ref(scene.add.circle(x, y, radius, fillColor, alpha)) as Ref<GameObjects.Arc>;
useInitializeGameObject(circle, configuration, emit, ArcSetterMap);
onComplete.value?.(circle.value);
</script>

<template></template>
