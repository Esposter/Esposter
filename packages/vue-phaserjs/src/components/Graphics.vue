<script setup lang="ts">
import type { GraphicsConfiguration } from "#src/models/configuration/GraphicsConfiguration";
import type { GraphicsEventEmitsOptions } from "#src/models/emit/GraphicsEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { GraphicsSetterMap } from "#src/services/setterMap/GraphicsSetterMap";
import { omitUndefined } from "@esposter/shared";

interface GraphicsEmits extends /** @vue-ignore */ GraphicsEventEmitsOptions {}

interface Props {
  configuration?: undefined | UndefinedOnPartial<Partial<GraphicsConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, graphics: GameObjects.Graphics) => void) | undefined;
}

const { configuration = {}, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<GraphicsEmits>();

useInitializeGameObject(
  (scene) => {
    const { x, y } = configuration;
    const graphics = scene.add.graphics(omitUndefined({ x, y }));
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
