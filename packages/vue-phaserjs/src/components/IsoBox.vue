<script setup lang="ts">
import type { IsoBoxConfiguration } from "#src/models/configuration/IsoBoxConfiguration";
import type { IsoBoxEventEmitsOptions } from "#src/models/emit/IsoBoxEventEmitsOptions";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";
import type { UndefinedOnPartial } from "type-fest";

import { useInitializeGameObject } from "#src/composables/useInitializeGameObject";
import { IsoBoxSetterMap } from "#src/services/setterMap/IsoBoxSetterMap";

interface IsoBoxEmits extends /** @vue-ignore */ IsoBoxEventEmitsOptions {}

interface Props {
  configuration: UndefinedOnPartial<Partial<IsoBoxConfiguration>>;
  immediate?: true | undefined;
  onComplete?: ((scene: SceneWithPlugins, isoBox: GameObjects.IsoBox) => void) | undefined;
}

const { configuration, immediate, onComplete } = defineProps<Props>();
const emit = defineEmits<IsoBoxEmits>();

useInitializeGameObject(
  (scene) => {
    const { fillLeft, fillRight, fillTop, height, size, x, y } = configuration;
    const isoBox = scene.add.isobox(x, y, size, height, fillTop, fillLeft, fillRight);
    onComplete?.(scene, isoBox);
    return isoBox;
  },
  () => configuration,
  emit,
  IsoBoxSetterMap,
  immediate,
);
</script>

<template></template>
