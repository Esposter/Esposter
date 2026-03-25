<script setup lang="ts">
import type { GraphicsConfiguration } from "@/models/configuration/GraphicsConfiguration";
import type { GraphicsEventEmitsOptions } from "@/models/emit/GraphicsEventEmitsOptions";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "@/composables/useInitializeGameObject";
import { GraphicsSetterMap } from "@/util/setterMap/GraphicsSetterMap";

interface GraphicsEmits extends /** @vue-ignore */ GraphicsEventEmitsOptions {}

interface GraphicsProps {
  configuration?: Partial<GraphicsConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, graphics: GameObjects.Graphics) => void;
}

const { configuration = {}, immediate, onComplete } = defineProps<GraphicsProps>();
const emit = defineEmits<GraphicsEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y } = configuration;
    const graphics = scene.add.graphics({ x, y });
    onComplete?.(scene, graphics);
    return graphics;
  },
  () => configuration,
  emit,
  GraphicsSetterMap,
  immediate,
);
</script>

<template></template>
