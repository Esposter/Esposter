<script setup lang="ts">
import type { LineConfiguration } from "#src/models/configuration/LineConfiguration";
import type { LineEventEmitsOptions } from "#src/models/emit/LineEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { LineSetterMap } from "#src/services/setterMap/LineSetterMap";

interface LineEmits extends /** @vue-ignore */ LineEventEmitsOptions {}

interface Props {
  configuration: UndefinedOnPartial<Partial<LineConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, line: GameObjects.Line) => void) | undefined;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
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
