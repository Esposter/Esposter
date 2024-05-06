<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/lib/phaser/models/emit/ArcEventEmitsOptions";
import { ArcSetterMap } from "@/lib/phaser/util/setterMap/ArcSetterMap";
import type { GameObjects } from "phaser";

interface CircleProps {
  configuration: Partial<ArcConfiguration>;
}

interface CircleEmits extends /** @vue-ignore */ ArcEventEmitsOptions {}

const props = defineProps<CircleProps>();
const { configuration } = toRefs(props);
const { x, y, radius, fillColor, alpha } = configuration.value;
const emit = defineEmits<CircleEmits>();
const circle = ref() as Ref<GameObjects.Arc>;

onCreate((scene) => {
  circle.value = scene.add.circle(x, y, radius, fillColor, alpha);
});

useInitializeGameObject(circle, configuration, emit, ArcSetterMap);
</script>

<template></template>
