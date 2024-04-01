<script setup lang="ts">
import { useInitializeGameObject } from "@/lib/phaser/composables/useInitializeGameObject";
import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { ArcEventEmitsOptions } from "@/lib/phaser/models/emit/ArcEventEmitsOptions";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { ArcSetterMap } from "@/lib/phaser/util/setterMap/ArcSetterMap";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
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
const scene = inject<SceneWithPlugins>(InjectionKeyMap.Scene);
if (!scene) throw new NotInitializedError("Scene");

const circle = ref(scene.add.circle(x, y, radius, fillColor, alpha)) as Ref<GameObjects.Arc>;
useInitializeGameObject(circle, configuration, emit, ArcSetterMap);
onComplete.value?.(circle.value);
</script>

<template></template>
