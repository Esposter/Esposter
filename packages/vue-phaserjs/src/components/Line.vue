<script setup lang="ts">
import type { LineConfiguration } from "@/models/configuration/LineConfiguration";
import type { LineEventEmitsOptions } from "@/models/emit/LineEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { LineSetterMap } from "@/util/setterMap/LineSetterMap";

interface LineEmits extends /** @vue-ignore */ LineEventEmitsOptions {}

interface LineProps {
  configuration: Partial<LineConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, line: GameObjects.Line) => void;
}

const { configuration, immediate, onComplete } = defineProps<LineProps>();
const emit = defineEmits<LineEmits>();

useInitializeGameObject(
  (scene) => {
    const { to, x, y } = configuration;
    const line = scene.add.line(x, y, to?.[0], to?.[1], to?.[2], to?.[3]);
    onComplete?.(scene, line);
    return line;
  },
  () => configuration,
  emit,
  LineSetterMap,
  immediate,
);
</script>

<template></template>
