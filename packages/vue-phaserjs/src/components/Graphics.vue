<script setup lang="ts">
import type { GraphicsConfiguration } from "#src/models/configuration/GraphicsConfiguration";
import type { GraphicsEventEmitsOptions } from "#src/models/emit/GraphicsEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { GraphicsSetterMap } from "#src/util/setterMap/GraphicsSetterMap";

interface GraphicsEmits extends /** @vue-ignore */ GraphicsEventEmitsOptions {}

interface Props {
  configuration?: Partial<GraphicsConfiguration>;
  immediate?: true;
  onComplete?: (scene: SceneWithPlugins, graphics: GameObjects.Graphics) => void;
}

const { configuration = {}, immediate, onComplete } = defineProps<Props>();
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
